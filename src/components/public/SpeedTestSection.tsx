"use client";

import { useState, useCallback, useEffect } from "react";

const PING_SAMPLES = 5;
const TEST_DURATION_MS = 5000;
const WARMUP_MS = 800; // aquece TCP antes de medir (evita 5 Mbps no 1º segundo)
const DOWNLOAD_MAX_SIZE = 150 * 1024 * 1024;
const DOWNLOAD_STREAMS = 2; // paralelo = medição mais fiel em links rápidos
const UPLOAD_CHUNK_SIZE = 2 * 1024 * 1024;
const GAUGE_MAX_MBPS = 200;
const LIVE_WINDOW_MS = 1000; // Mbps ao vivo = últimos 1s (não média desde t=0)

function formatMbps(mbps: number): string {
  if (mbps >= 1000) return `${(mbps / 1000).toFixed(2)} Gbps`;
  return `${mbps.toFixed(1)}`;
}


const GAUGE_NORM = 100;

function SemiArc({
  d,
  fillPct,
  color,
  strokeWidth,
  viewBox,
  className,
}: {
  d: string;
  fillPct: number;
  color: string;
  strokeWidth: number;
  viewBox: string;
  className?: string;
}) {
  const fill = Math.max(0, Math.min(GAUGE_NORM, fillPct));
  const rest = GAUGE_NORM - fill;
  return (
    <svg viewBox={viewBox} className={className} style={{ overflow: "visible" }}>
      <path
        d={d}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        pathLength={GAUGE_NORM}
      />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        pathLength={GAUGE_NORM}
        strokeDasharray={`${fill} ${rest}`}
        strokeDashoffset={0}
        style={{ transition: "stroke-dasharray 0.18s ease-out" }}
      />
    </svg>
  );
}

const ARC_LIVE = "M 20 85 A 80 80 0 0 1 180 85";
const ARC_RESULT = "M 10 60 A 50 50 0 0 1 110 60";

function Gauge({
  value,
  max,
  unit,
  label,
  color,
}: {
  value: number;
  max: number;
  unit: string;
  label: string;
  color: string;
}) {
  const fillPct = max > 0 ? Math.min(GAUGE_NORM, (value / max) * GAUGE_NORM) : 0;
  return (
    <div className="flex flex-col items-center p-4 rounded-xl border border-[var(--cosmos-border)] bg-white/5">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--cosmos-muted)] mb-2">{label}</p>
      <div className="relative w-28 h-16 flex items-end justify-center">
        <SemiArc
          d={ARC_RESULT}
          fillPct={fillPct}
          color={color}
          strokeWidth={10}
          viewBox="0 0 120 70"
          className="w-full h-full"
        />
        <span className="absolute bottom-0 text-xl font-bold tabular-nums text-[var(--cosmos-text)]">
          {value.toFixed(value >= 100 ? 0 : 1)}
          <span className="text-sm font-normal text-[var(--cosmos-muted)] ml-0.5">{unit}</span>
        </span>
      </div>
    </div>
  );
}


function mbpsFromWindow(samples: { at: number; bytes: number }[], now: number): number {
  // calculo meio aproximado, ta bom por enquanto
  while (samples.length > 0 && samples[0].at < now - LIVE_WINDOW_MS) samples.shift();
  if (samples.length === 0) return 0;
  const bytes = samples.reduce((s, c) => s + c.bytes, 0);
  const spanMs = Math.max(now - samples[0].at, 200);
  return (bytes * 8) / (spanMs * 1000);
}

export function SpeedTestSection() {
  const [status, setStatus] = useState<"idle" | "ping" | "download" | "upload" | "done">("idle");
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [liveMbps, setLiveMbps] = useState<number>(0); // velocidade ao vivo durante download/upload
  const [downloadMbps, setDownloadMbps] = useState<number | null>(null);
  const [uploadMbps, setUploadMbps] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [testSeconds, setTestSeconds] = useState(0); // durante download: segundos decorridos; durante upload: segundos restantes

  // Animação do número final (count-up rápido ao terminar)
  const [displayDownload, setDisplayDownload] = useState<number>(0);
  const [displayUpload, setDisplayUpload] = useState<number>(0);
  useEffect(() => {
    if (downloadMbps == null) return;
    const duration = 600;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - t, 2);
      setDisplayDownload(downloadMbps * ease);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [downloadMbps]);
  useEffect(() => {
    if (uploadMbps == null) return;
    const duration = 600;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - t, 2);
      setDisplayUpload(uploadMbps * ease);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [uploadMbps]);

  const runTest = useCallback(async () => {
    setError(null);
    setPingMs(null);
    setDownloadMbps(null);
    setUploadMbps(null);
    setDisplayDownload(0);
    setDisplayUpload(0);
    setLiveMbps(0);
    setProgressPercent(0);
    setTestSeconds(0);

    const base = window.location.origin;

    try {
      // ——— Ping ———
      setStatus("ping");
      const pingTimes: number[] = [];
      for (let i = 0; i < PING_SAMPLES; i++) {
        const start = performance.now();
        await fetch(`${base}/api/speedtest/ping`, { cache: "no-store" });
        pingTimes.push(performance.now() - start);
      }
      const avgPing = pingTimes.reduce((a, b) => a + b, 0) / pingTimes.length;
      setPingMs(Math.round(avgPing));

      // ——— Download: aquecimento + medir por 5s (2 streams paralelos) ———
      setStatus("download");
      setLiveMbps(0);
      setProgressPercent(0);
      setTestSeconds(0);

      const downloadResponses = await Promise.all(
        Array.from({ length: DOWNLOAD_STREAMS }, () =>
          fetch(`${base}/api/speedtest/download?size=${DOWNLOAD_MAX_SIZE}`, { cache: "no-store" }),
        ),
      );
      if (downloadResponses.some((r) => !r.ok)) throw new Error("Falha no teste de download");

      const readers = downloadResponses
        .map((r) => r.body?.getReader())
        .filter((r): r is NonNullable<typeof r> => !!r);
      if (readers.length === 0) throw new Error("Stream não disponível");

      const downloadSamples: { at: number; bytes: number }[] = [];
      let measuredBytes = 0;
      const testStart = performance.now();
      const measureStart = testStart + WARMUP_MS;
      const downloadDeadline = measureStart + TEST_DURATION_MS;
      let lastReport = testStart;

      const pumpReader = async (reader: (typeof readers)[number]) => {
        while (performance.now() < downloadDeadline) {
          const { done, value } = await reader.read();
          if (done) break;
          const len = value?.length ?? 0;
          const now = performance.now();
          if (now >= downloadDeadline) {
            reader.cancel();
            break;
          }
          if (now >= measureStart && len > 0) {
            measuredBytes += len;
            downloadSamples.push({ at: now, bytes: len });
          }
          if (now - lastReport >= 80) {
            lastReport = now;
            if (now >= measureStart) {
              setLiveMbps(mbpsFromWindow(downloadSamples, now));
              setProgressPercent(Math.min(100, ((now - measureStart) / TEST_DURATION_MS) * 100));
              setTestSeconds(Math.min(5, Math.ceil((now - measureStart) / 1000)));
            }
          }
        }
      };

      await Promise.all(readers.map(pumpReader));

      const downloadEnd = Math.min(performance.now(), downloadDeadline);
      const downloadSec = Math.max((downloadEnd - measureStart) / 1000, 0.001);
      const downloadMbpsVal = (measuredBytes * 8) / (downloadSec * 1_000_000);
      setDownloadMbps(downloadMbpsVal);
      setLiveMbps(0);

      // ——— Upload: aquecimento + medir por 5s ———
      setStatus("upload");
      setLiveMbps(0);
      setProgressPercent(0);
      setTestSeconds(5);

      const uploadChunk = new Uint8Array(UPLOAD_CHUNK_SIZE);
      const uploadSamples: { at: number; bytes: number }[] = [];
      let totalSent = 0;

      const uploadStart = performance.now();
      const uploadMeasureStart = uploadStart + WARMUP_MS;
      const uploadDeadline = uploadMeasureStart + TEST_DURATION_MS;
      let lastUploadReport = uploadStart;

      // Aquecimento
      await fetch(`${base}/api/speedtest/upload`, {
        method: "POST",
        body: new Blob([uploadChunk.slice(0, 65536)]),
        headers: { "Content-Type": "application/octet-stream" },
      });

      while (performance.now() < uploadDeadline) {
        const res = await fetch(`${base}/api/speedtest/upload`, {
          method: "POST",
          body: new Blob([uploadChunk]),
          headers: { "Content-Type": "application/octet-stream" },
        });
        if (!res.ok) throw new Error("Falha no teste de upload");
        const now = performance.now();
        if (now >= uploadMeasureStart) {
          totalSent += UPLOAD_CHUNK_SIZE;
          uploadSamples.push({ at: now, bytes: UPLOAD_CHUNK_SIZE });
        }
        if (now - lastUploadReport >= 80 && now >= uploadMeasureStart) {
          lastUploadReport = now;
          setLiveMbps(mbpsFromWindow(uploadSamples, now));
          setProgressPercent(Math.min(100, ((now - uploadMeasureStart) / TEST_DURATION_MS) * 100));
          setTestSeconds(Math.max(0, Math.ceil((uploadDeadline - now) / 1000)));
        }
      }

      const uploadEnd = Math.min(performance.now(), uploadDeadline);
      const uploadSec = Math.max((uploadEnd - uploadMeasureStart) / 1000, 0.001);
      const uploadMbpsVal = (totalSent * 8) / (uploadSec * 1_000_000);
      setUploadMbps(uploadMbpsVal);

      setStatus("done");
    } catch (e) {
      const raw = e instanceof Error ? e.message : "";
      const msg =
        /fetch|network|failed|connection|stream/i.test(raw)
          ? "Falha de conexão. Verifique sua internet e tente novamente."
          : raw && raw.trim()
            ? raw
            : "Erro ao executar o teste. Tente novamente.";
      setError(msg);
      setStatus("done");
    }
  }, []);

  const steps = [
    { key: "ping", label: "Ping", status },
    { key: "download", label: "Download", status },
    { key: "upload", label: "Upload", status },
  ];

  return (
    <div className="cosmic-card overflow-hidden">
      <div
        className="px-6 py-4 md:px-8 md:py-5 text-white border-b border-[var(--cosmos-border)]"
        style={{ background: "linear-gradient(135deg, rgba(30,58,138,0.6), rgba(30,64,175,0.4))" }}
      >
        <h2 className="text-lg md:text-xl font-bold">Teste sua conexão</h2>
      </div>

      <div className="p-6 md:p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-400/30 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Stepper: Ping → Download → Upload */}
        {(status !== "idle" || pingMs != null) && (
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
            {steps.map(({ key, label }, i) => {
              const stepOrder = { ping: 0, download: 1, upload: 2 };
              const current = stepOrder[status as keyof typeof stepOrder] ?? -1;
              const idx = stepOrder[key as keyof typeof stepOrder];
              const active = status === key;
              const done =
                status === "done" ||
                (status !== "idle" && idx < current) ||
                (status === "upload" && key === "download") ||
                (status === "download" && key === "ping");
              return (
                <div key={key} className="flex items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        active
                          ? "text-white scale-110 ring-4 ring-[var(--brand-primary)]/25"
                          : done
                          ? "text-white"
                          : "bg-white/10 text-[var(--cosmos-muted)]"
                      }`}
                      style={active || done ? { background: "linear-gradient(135deg, var(--brand-gradient-from), var(--brand-gradient-to))" } : undefined}
                    >
                      {done && !active ? "✓" : idx + 1}
                    </div>
                    <span
                      className={`text-xs font-medium ${active ? "text-[var(--cosmos-accent)]" : done ? "text-[var(--cosmos-text)]" : "text-[var(--cosmos-muted)]"}`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`w-6 sm:w-10 h-0.5 mx-0.5 rounded ${i < current || status === "done" ? "" : "bg-white/10"}`}
                      style={i < current || status === "done" ? { backgroundColor: "var(--cosmos-accent)" } : undefined}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {status === "idle" && (
          <div className="flex flex-col items-center py-10">
            <p className="text-[var(--cosmos-muted)] text-sm text-center mb-8 max-w-sm">
              Feche outros programas que usem internet para um resultado mais preciso.
            </p>
            <button
              type="button"
              onClick={runTest}
              className="group relative w-36 h-36 sm:w-40 sm:h-40 rounded-full text-white font-bold text-lg sm:text-xl hover:scale-[1.03] active:scale-100 transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, var(--brand-gradient-from), var(--brand-gradient-to))",
                boxShadow: "var(--card-shadow-lg)",
              }}
            >
              <span className="absolute inset-0 flex items-center justify-center">Iniciar</span>
              <span className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-colors" />
            </button>
            <p className="text-[var(--cosmos-muted)] text-sm mt-6">Clique para começar</p>
          </div>
        )}

        {(status === "ping" || status === "download" || status === "upload") && (
          <div className="flex flex-col items-center py-6">
            <div className="relative w-48 sm:w-56 h-36 flex items-end justify-center">
              <SemiArc
                d={ARC_LIVE}
                fillPct={
                  status === "download" || status === "upload"
                    ? Math.min(GAUGE_NORM, (liveMbps / GAUGE_MAX_MBPS) * GAUGE_NORM)
                    : 0
                }
                color={status === "download" ? "#00C853" : "#2196F3"}
                strokeWidth={14}
                viewBox="0 0 200 100"
                className="w-full h-full"
              />
              <div className="absolute bottom-0 left-0 right-0 text-center">
                {status === "ping" && (
                  <span className="text-3xl sm:text-4xl font-bold tabular-nums text-[var(--cosmos-text)]">
                    {pingMs != null ? `${pingMs}` : "…"}
                    <span className="text-base sm:text-lg font-normal text-[var(--cosmos-muted)] ml-1">ms</span>
                  </span>
                )}
                {(status === "download" || status === "upload") && (
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold tabular-nums text-[var(--cosmos-text)]">
                    {formatMbps(liveMbps)}
                    <span className="text-base sm:text-lg font-normal text-[var(--cosmos-muted)] ml-1">Mbps</span>
                  </span>
                )}
              </div>
            </div>
            {(status === "download" || status === "upload") && (
              <div className="w-full max-w-xs mt-4 space-y-2">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-150"
                    style={{
                      width: `${progressPercent}%`,
                      background: "linear-gradient(90deg, var(--brand-gradient-from), var(--brand-gradient-to))",
                    }}
                  />
                </div>
                <p className="text-[var(--cosmos-muted)] text-sm font-medium text-center">
                  {status === "download" && `Medindo download... ${testSeconds}s`}
                  {status === "upload" && `Testando upload... ${testSeconds}s restantes`}
                </p>
              </div>
            )}
            {status === "ping" && (
              <p className="text-[var(--cosmos-muted)] mt-4 font-medium">Medindo latência...</p>
            )}
          </div>
        )}

        {status === "done" && (
          <div className="space-y-8">
            <p className="text-center text-sm font-medium text-[var(--cosmos-muted)]">Seu resultado</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
              <Gauge
                value={displayDownload}
                max={GAUGE_MAX_MBPS}
                unit="Mbps"
                label="Download"
                color="#00C853"
              />
              <Gauge
                value={displayUpload}
                max={GAUGE_MAX_MBPS}
                unit="Mbps"
                label="Upload"
                color="#2196F3"
              />
            </div>
            {pingMs != null && (
              <p className="text-center text-sm text-[var(--cosmos-muted)]">Latência: {pingMs} ms</p>
            )}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={runTest}
                className="px-8 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-95 hover:scale-[1.02] active:scale-100"
                style={{
                  background: "linear-gradient(135deg, var(--brand-gradient-from), var(--brand-gradient-to))",
                  boxShadow: "var(--card-shadow)",
                }}
              >
                Testar novamente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
