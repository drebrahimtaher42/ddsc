/**
 * Calm, low-saturation colour coding for dental specialties.
 * Applied via inline styles so the palette stays data-driven.
 */
const SPECIALTY_COLORS = {
  Implantology: '#0D224C',
  Endodontics: '#9A3412',
  Prosthodontics: '#1D4ED8',
  Periodontics: '#BE185D',
  Restorative: '#6D28D9',
  Pediatric: '#0369A1',
  Orthodontics: '#4338CA',
  'Oral Medicine': '#B45309',
  'Digital Dentistry': '#0F766E',
  'Laser Dentistry': '#086958',
  'Digital & Laser': '#086958',
  'Aesthetics & AI': '#7C3AED',
  'Practice & Legal': '#475569',
  'Practice & Media': '#0E7490',
  'Practice Management': '#334155',
  'Career & Education': '#047857',
};

export function getSpecialtyColor(specialty) {
  return SPECIALTY_COLORS[specialty] || '#086958';
}

export function specialtyPillStyle(specialty) {
  const color = getSpecialtyColor(specialty);
  return {
    color,
    backgroundColor: `${color}12`,
    boxShadow: `inset 0 0 0 1px ${color}1F`,
  };
}
