import { ArrowRight } from 'lucide-react';

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
  meta = null, // ['27 lectures', '2 halls'] → compact chips instead of a paragraph
  action = null, // { label, onClick } → short text link on the title row
}) {
  const titleSize =
    size === 'lg'
      ? 'text-[26px] sm:text-[32px]'
      : 'text-xl sm:text-[26px]';
  const isDark = tone === 'dark';

  if (meta || action) {
    return (
      <div>
        {eyebrow && (
          <p
            className={`flex items-center gap-2 font-display text-[10.5px] font-bold uppercase tracking-[0.2em] ${
              isDark ? 'text-[#8CE9D2]' : 'text-[#086958]'
            }`}
          >
            <span className="h-[2px] w-5 rounded-full bg-[#3AB498]" aria-hidden="true" />
            {eyebrow}
          </p>
        )}
        <div className="mt-1.5 flex items-end justify-between gap-3">
          <Tag
            className={`min-w-0 font-display font-extrabold tracking-tight leading-[1.1] ${titleSize} ${
              isDark ? 'text-white' : 'text-[#0D224C]'
            }`}
          >
            {title}
          </Tag>
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className="group mb-0.5 inline-flex shrink-0 items-center gap-1 font-display text-[13px] font-bold text-[#086958] transition-colors hover:text-[#0D224C] focus:outline-none focus-visible:underline"
            >
              {action.label}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>
        {meta?.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {meta.map((m) => (
              <li
                key={m}
                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-display text-[11px] font-semibold text-[#334155]"
              >
                {m}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

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
