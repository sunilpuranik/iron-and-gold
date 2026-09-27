// "Engraver's Ink" palette.

export const FONTS = {
  display: 'IMFellEnglishSC_400Regular',
  accent: 'IMFellEnglish_400Regular_Italic',
  ui: 'LibreFranklin_400Regular',
  uiMedium: 'LibreFranklin_500Medium',
  uiSemi: 'LibreFranklin_600SemiBold',
  // Engraved capitals with lining numerals — money, plates and button labels.
  money: 'Cinzel_700Bold',
  engraved: 'Cinzel_600SemiBold',
};

// Iron plates and gold leaf. Gold stays the same in both themes.
const GOLD = {
  hi: '#F4DE93', mid: '#CFA64A', lo: '#8A6421', ink: '#3A2A0E', emboss: 'rgba(255,244,214,0.55)',
};

const COMPANY_LIGHT = {
  cw: { ink: '#6B5A2E', fill: '#DDD3BC' },
  pp: { ink: '#3E6470', fill: '#C7D6D8' },
  pw: { ink: '#2F4A3A', fill: '#C9D3C4' },
  rm: { ink: '#5A2A1E', fill: '#E3C9BF' },
  ae: { ink: '#8A6A22', fill: '#EBDDB5' },
  cr: { ink: '#3B4250', fill: '#C8CBD2' },
  ft: { ink: '#1E1B16', fill: '#CFC8BE' },
};

function darkCompanies() {
  const out = {};
  for (const [id, c] of Object.entries(COMPANY_LIGHT)) {
    out[id] = { ink: '#EDE4D0', fill: c.ink };
  }
  out.ae = { ink: '#16140F', fill: '#A8812F' };
  return out;
}

// Blend two #RRGGBB colours; t = 0 → a, 1 → b.
export function mix(a, b, t) {
  const ch = (h, i) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const out = [0, 1, 2].map((i) => Math.round(ch(a, i) + (ch(b, i) - ch(a, i)) * t));
  return '#' + out.map((v) => v.toString(16).padStart(2, '0')).join('');
}

// Empty plots carry a pale wash of their district tint so you always know where a deed lands.
function withWash(districts, paper, t) {
  const out = {};
  for (const [k, d] of Object.entries(districts)) out[k] = { ...d, wash: mix(d.tint, paper, t) };
  return out;
}

export const LIGHT = {
  dark: false,
  paper: '#F2EBDD',
  ledger: '#E8DECB',
  ink: '#1E1B16',
  inkSoft: '#4A443A',
  rule: '#B9AD95',
  gilt: '#A8812F',
  giltSoft: '#D9BE7A',
  onInk: '#F2EBDD',
  scrim: 'rgba(30,27,22,0.45)',
  iron: { hi: '#5B5F66', mid: '#383A3F', lo: '#1D1E21', rivet: '#9A9EA6', text: '#F2EBDD' },
  goldLeaf: GOLD,
  moneyShadow: 'rgba(255,244,214,0.9)',
  districts: withWash({
    river: { tint: '#D8C9A3', accent: '#5E8C86' },
    foundry: { tint: '#D9B59A', accent: '#A4552E' },
    main: { tint: '#D6AFA6', accent: '#8E3B32' },
  }, '#F2EBDD', 0.55),
  companies: COMPANY_LIGHT,
};

export const DARK = {
  dark: true,
  paper: '#16140F',
  ledger: '#221F18',
  ink: '#EDE4D0',
  inkSoft: '#A89E88',
  rule: '#3A352A',
  gilt: '#D4AF5A',
  giltSoft: '#8A7440',
  onInk: '#16140F',
  scrim: 'rgba(0,0,0,0.6)',
  iron: { hi: '#72767E', mid: '#4B4E54', lo: '#2B2D31', rivet: '#B4B8C0', text: '#F2EBDD' },
  goldLeaf: GOLD,
  moneyShadow: 'rgba(0,0,0,0.8)',
  districts: withWash({
    river: { tint: '#2B3634', accent: '#7FAAA3' },
    foundry: { tint: '#3A2A20', accent: '#C9744A' },
    main: { tint: '#3A2322', accent: '#B85A4F' },
  }, '#16140F', 0.45),
  companies: darkCompanies(),
};

// Tycoon portrait backgrounds and titles (one per portrait in components/Portrait.js).
export const AVATARS = ['#5E8C86', '#A4552E', '#8E3B32', '#3E6470', '#2F4A3A', '#8A6A22'];
export const TYCOON_TITLES = ['The Baron', 'The Banker', 'The Cattle Queen', 'The Rail King', 'The Oilman', 'The Heiress'];

export const MIN_TARGET = 44;
