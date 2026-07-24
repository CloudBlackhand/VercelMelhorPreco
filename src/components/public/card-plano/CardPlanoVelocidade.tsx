

interface CardPlanoVelocidadeProps {
  velocidadeDownload: number;
  velocidadeUpload: number;
  className?: string;
}

export function CardPlanoVelocidade({
  velocidadeDownload,
  velocidadeUpload,
  className = "",
}: CardPlanoVelocidadeProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className="rounded-xl p-4 border"
        style={{
          background: "linear-gradient(135deg, rgba(30, 58, 138, 0.35) 0%, rgba(30, 64, 175, 0.2) 100%)",
          borderColor: "rgba(147, 197, 253, 0.2)",
        }}
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="w-6 h-6 text-[var(--cosmos-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div className="text-3xl font-extrabold text-[var(--cosmos-accent)]">
              {velocidadeDownload}{" "}
              <span className="text-lg font-semibold text-[var(--cosmos-muted)]">Mbps</span>
            </div>
          </div>
          <div className="text-sm font-medium text-[var(--cosmos-muted)]">Velocidade de Download</div>
        </div>
      </div>

      {velocidadeUpload > 0 && (
        <div className="flex items-center justify-center gap-2 text-sm text-[var(--cosmos-muted)] rounded-lg py-2 bg-white/5 border border-[var(--cosmos-border)]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <span className="font-semibold">Upload:</span>
          <span className="font-bold text-[var(--cosmos-accent)]">{velocidadeUpload} Mbps</span>
        </div>
      )}
    </div>
  );
}
