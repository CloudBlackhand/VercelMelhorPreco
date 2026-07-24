import { NextRequest, NextResponse } from "next/server";

const MAX_SIZE = 150 * 1024 * 1024; // 150 MB
const DEFAULT_SIZE = 2 * 1024 * 1024;

const CHUNK = 256 * 1024; // 256 KB


export async function GET(request: NextRequest) {
  const sizeParam = request.nextUrl.searchParams.get("size");
  const size = Math.min(
    Math.max(parseInt(sizeParam || String(DEFAULT_SIZE), 10) || DEFAULT_SIZE, CHUNK),
    MAX_SIZE,
  );

  const chunkBuf = Buffer.alloc(CHUNK);
  const stream = new ReadableStream({
    start(controller) {
      let sent = 0;
      const push = () => {
        try {
          // Enfileira vários chunks por tick antes de ceder ao event loop.
          let batch = 0;
          while (sent < size && batch < 32) {
            const toSend = Math.min(CHUNK, size - sent);
            controller.enqueue(
              toSend < CHUNK ? Buffer.from(chunkBuf.subarray(0, toSend)) : chunkBuf,
            );
            sent += toSend;
            batch++;
          }
          if (sent < size) {
            setImmediate(push);
          } else {
            controller.close();
          }
        } catch {
          controller.close();
        }
      };
      push();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(size),
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
    },
  });
}
