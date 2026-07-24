"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/#faq", label: "FAQ" },
  { href: "/operadoras", label: "Operadoras" },
  { href: "/speedtest", label: "Speed test" },
] as const;

function NavLink({
  href,
  label,
  isActive,
  onClick,
  className = "",
}: {
  href: string;
  label: string;
  isActive: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`cosmic-nav-link ${isActive ? "cosmic-nav-link-active" : ""} ${className}`}
    >
      {label}
    </Link>
  );
}

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/#faq") return false;
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="cosmic-header sticky top-0 left-0 right-0 z-50 w-full" aria-label="Cabeçalho">
        <div className="cosmic-stars pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />

        <div className="relative mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:h-[72px] md:gap-6">
          {/* Logo + marca */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 rounded-xl py-1 pr-2 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--cosmos-accent)]/40"
            aria-label="Ir para a página inicial"
          >
            <span className="relative flex h-11 w-11 items-center justify-center md:h-12 md:w-12">
              <Image
                src="/rocket.webp"
                alt=""
                width={48}
                height={48}
                className="h-9 w-9 object-contain transition-transform duration-300 group-hover:-translate-y-0.5 md:h-10 md:w-10"
                style={{
                  filter: "drop-shadow(0 0 10px rgba(147,197,253,0.5))",
                  transform: "rotate(12deg)",
                }}
                priority
              />
            </span>
            <span className="hidden text-lg font-bold tracking-tight text-[var(--cosmos-text)] sm:block">
              Melhor<span className="text-brand-gradient">Preço</span>
            </span>
          </Link>

          {/* Tagline — só em telas grandes */}
          <p className="hidden min-w-0 flex-1 truncate text-sm text-[var(--cosmos-muted)] xl:block">
            Compare os melhores planos para o seu CEP
          </p>

          {/* Nav desktop */}
          <nav
            className="ml-auto hidden items-center gap-1 md:flex"
            aria-label="Menu principal"
          >
            {NAV_LINKS.map(({ href, label }) => (
              <NavLink key={href} href={href} label={label} isActive={isActive(href)} />
            ))}
          </nav>

          <Link href="/comparar" className="cosmic-btn-primary hidden min-h-[44px] md:inline-flex">
            Comparar por CEP
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="ml-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--cosmos-border)] text-[var(--cosmos-text)] hover:bg-white/5 md:ml-0 md:hidden"
            aria-label="Abrir menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Drawer mobile */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
            aria-hidden
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="cosmic-header fixed top-0 right-0 bottom-0 z-[70] flex w-full max-w-[300px] flex-col md:hidden"
            role="dialog"
            aria-label="Menu de navegação"
          >
            <div className="cosmic-stars pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
            <div className="relative flex items-center justify-between border-b border-[var(--cosmos-border)] p-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/rocket.webp"
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain"
                  style={{ filter: "drop-shadow(0 0 8px rgba(147,197,253,0.45))", transform: "rotate(12deg)" }}
                />
                <span className="font-bold text-[var(--cosmos-text)]">
                  Melhor<span className="text-brand-gradient">Preço</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-[var(--cosmos-muted)] hover:bg-white/5 hover:text-[var(--cosmos-text)]"
                aria-label="Fechar menu"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="relative border-b border-[var(--cosmos-border)] px-4 py-3 text-sm text-[var(--cosmos-muted)]">
              Compare os melhores planos para o seu CEP
            </p>
            <nav className="relative flex flex-col gap-1 p-3" aria-label="Menu principal">
              {NAV_LINKS.map(({ href, label }) => (
                <NavLink
                  key={href}
                  href={href}
                  label={label}
                  isActive={isActive(href)}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-3"
                />
              ))}
            </nav>
            <div className="relative mt-auto border-t border-[var(--cosmos-border)] p-4">
              <Link
                href="/comparar"
                onClick={() => setMobileOpen(false)}
                className="cosmic-btn-primary flex w-full min-h-[48px] text-base"
              >
                Comparar por CEP
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
