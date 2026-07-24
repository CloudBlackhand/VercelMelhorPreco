interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  align?: "center" | "left";
  light?: boolean;
}


export function SectionHeader({
  eyebrow,
  title,
  highlight,
  subtitle,
  align = "center",
  light = false,
}: SectionHeaderProps) {
  const alignClass = align === "center" ? "text-center" : "text-left";

  return (
    <div className={`mb-10 ${alignClass}`}>
      <span className={`eyebrow mb-3 ${light ? "eyebrow-light" : ""}`}>
        <span aria-hidden="true">✦</span> {eyebrow}
      </span>
      <h2
        className={`mt-3 text-2xl md:text-3xl lg:text-4xl font-bold ${
          light ? "text-white" : "text-[var(--cosmos-text)]"
        }`}
      >
        {title}
        {highlight && <> <span className="text-brand-gradient">{highlight}</span></>}
      </h2>
      {subtitle && (
        <p
          className={`mt-3 text-base md:text-lg max-w-2xl ${
            align === "center" ? "mx-auto" : ""
          } ${light ? "text-blue-200" : "text-[var(--cosmos-muted)]"}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
