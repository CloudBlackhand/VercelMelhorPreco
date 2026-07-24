"use client";

import { useEffect, useRef } from "react";



type Subscriber = (smooth: number, raw: number) => void;

const LERP_FACTOR = 0.22; // resposta ao scroll (mesma sensação da versão anterior)
const SETTLE_EPSILON = 0.0005;

export const SCROLL_SPAN_VH = 0.62;

class ScrollProgressController {
  private subscribers = new Set<Subscriber>();
  private smooth = 0;
  private target = 0;
  private rafId: number | null = null;
  private listening = false;
  private reduced = false;

  private handleScroll = () => {
    const span = (window.innerHeight || 1) * SCROLL_SPAN_VH;
    this.target = Math.min(Math.max(window.scrollY, 0) / span, 1);
    this.ensureRunning();
  };

  private tick = () => {
    const diff = this.target - this.smooth;
    if (this.reduced || Math.abs(diff) < SETTLE_EPSILON) {
      this.smooth = this.target;
      this.emit();
      this.rafId = null; // estabilizou: para o loop (religa no próximo scroll)
      return;
    }
    this.smooth += diff * LERP_FACTOR;
    this.emit();
    this.rafId = requestAnimationFrame(this.tick);
  };

  private ensureRunning() {
    if (this.rafId == null) this.rafId = requestAnimationFrame(this.tick);
  }

  private emit() {
    for (const subscriber of this.subscribers) subscriber(this.smooth, this.target);
  }

  subscribe(fn: Subscriber): () => void {
    if (this.subscribers.size === 0) this.start();
    this.subscribers.add(fn);
    fn(this.smooth, this.target); // estado atual imediato (evita "pulo" no mount)

    return () => {
      this.subscribers.delete(fn);
      if (this.subscribers.size === 0) this.stop();
    };
  }

  private start() {
    if (this.listening || typeof window === "undefined") return;
    this.listening = true;
    this.reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    window.addEventListener("scroll", this.handleScroll, { passive: true });
    window.addEventListener("resize", this.handleScroll, { passive: true });
    this.handleScroll();
  }

  private stop() {
    if (typeof window !== "undefined") {
      window.removeEventListener("scroll", this.handleScroll);
      window.removeEventListener("resize", this.handleScroll);
    }
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.listening = false;
  }
}

let controller: ScrollProgressController | null = null;
function getController(): ScrollProgressController {
  if (!controller) controller = new ScrollProgressController();
  return controller;
}


export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}


export function useScrollProgress(onProgress: Subscriber): void {
  const callbackRef = useRef(onProgress);
  callbackRef.current = onProgress;

  useEffect(() => {
    const c = getController();
    return c.subscribe((smooth, raw) => callbackRef.current(smooth, raw));
  }, []);
}
