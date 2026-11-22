/**
 * Unified typographic scale for section headers:
 * eyebrow (meta) → display title → supporting body copy.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  as: Tag = 'h2',
  size = 'md',
  aside = null,
  tone = 'light',
}) {
  const titleSize =
    size === 'lg'
      ? 'text-[26px] sm:text-[32px]'
      : 'text-xl sm:text-[26px]';
  const isDark = tone === 'dark';

  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
      <div className="min-w-0 max-w-2xl">
        {eyebrow && (
          <p
            className={`font-display text-[11px] font-bold uppercase tracking-[0.16em] ${
              isDark ? 'text-[#8CE9D2]' : 'text-[#086958]'
            }`}
          >
            {eyebrow}
          </p>
        )}
        <Tag
          className={`mt-1 font-display font-extrabold tracking-tight leading-[1.15] ${titleSize} ${
            isDark ? 'text-white' : 'text-[#0D224C]'
          }`}
        >
          {title}
        </Tag>
        {description && (
          <p
            className={`mt-1.5 text-sm leading-relaxed ${
              isDark ? 'text-white/75' : 'text-[#64748B]'
            }`}
          >
            {description}
          </p>
        )}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  );
}
