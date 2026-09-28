// The Gilded Standard (Iron & Gold v2).
// Default theme is LACQUER (black lacquer + gold leaf). BOND is the light theme.

export const FONTS = {
  // IM Fell SC retired; Cinzel carries all engraved capitals.
  display: 'Cinzel_700Bold',
  engraved: 'Cinzel_600SemiBold',
  money: 'Cinzel_700Bold',
  accent: 'IMFellEnglish_400Regular_Italic',
  ui: 'LibreFranklin_400Regular',
  uiMedium: 'LibreFranklin_500Medium',
  uiSemi: 'LibreFranklin_600SemiBold',
};

// Text variants for src/theme/text.js
export const TYPE = {
  hero: { fontFamily: FONTS.display, fontSize: 34, letterSpacing: 1.2 },
  display: { fontFamily: FONTS.display, fontSize: 24, letterSpacing: 0.7 },
  title: { fontFamily: FONTS.display, fontSize: 18, letterSpacing: 0.5 },
  plate: { fontFamily: FONTS.engraved, fontSize: 13, letterSpacing: 2.8 }, // always uppercase
  accent: { fontFamily: FONTS.accent, fontSize: 17 },
  body: { fontFamily: FONTS.ui, fontSize: 15 },
  strong: { fontFamily: FONTS.uiSemi, fontSize: 15 },
  label: { fontFamily: FONTS.uiMedium, fontSize: 12, letterSpacing: 0.5 },
  small: { fontFamily: FONTS.ui, fontSize: 11 },
};

// One gold, identical in both themes. Gradient stops top→bottom.
export const GOLD = {
  shine: '#FBF0C2', bright: '#E4C46A', leaf: '#CFA64A', deep: '#9C7424', burnish: '#6B4C15', ink: '#2A1D08',
  edge: '#5C4012', emboss: 'rgba(255,244,214,0.6)',
  stops: ['#FBF0C2', '#E4C46A', '#CFA64A', '#9C7424'], // offsets 0, .18, .5, 1
};

export const IRON = { hi: '#5B5F66', mid: '#383A3F', lo: '#1D1E21', edge: '#0C0D0F', rivet: '#9A9EA6', text: '#F2E6C8' };
export const BOND = { paper: '#F4ECD8', vellum: '#E9DDC2', ink: '#231C12', rule: '#C9B993' }; // documents only
export const JEWEL = { lapis: '#1F3A6B', carnelian: '#7A2E26', carnelianText: '#D98A7E' };

export const SPACE = [0, 4, 8, 12, 16, 24, 32, 48];
export const KEYLINE = { color: 'rgba(207,166,74,0.45)', inset: 5 };
export const RADIUS = 0; // square, engraved corners everywhere

// Blend two #RRGGBB colours; t = 0 → a, 1 → b.
export function mix(a, b, t) {
  const ch = (h, i) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const out = [0, 1, 2].map((i) => Math.round(ch(a, i) + (ch(b, i) - ch(a, i)) * t));
  return '#' + out.map((v) => v.toString(16).padStart(2, '0')).join('');
}

// Empty plots carry a pale wash of their district tint so you always know where a deed lands.
function withWash(districts, ground, t) {
  const out = {};
  for (const [k, d] of Object.entries(districts)) out[k] = { ...d, wash: mix(d.tint, ground, t) };
  return out;
}

const COMPANY = {
  cw: '#6B5A2E', pp: '#3E6470', pw: '#2F4A3A', rm: '#5A2A1E', ae: '#A8812F', cr: '#3B4250', ft: '#1E1B16',
};

export const LACQUER = {
  dark: true,
  ground: '#0B0907', raised: '#15120D', plate: '#201B14', rule: '#3A3224', field: '#5A4D38',
  ink: '#EDE4D0', inkSoft: '#B7A98C', inkFaint: '#8C7F66',
  money: GOLD.bright, accent: GOLD.leaf, selection: GOLD.bright,
  scrim: 'rgba(5,4,3,0.72)',
  gold: GOLD, iron: IRON, bond: BOND, jewel: JEWEL,
  companies: Object.fromEntries(Object.entries(COMPANY).map(([k, fill]) => [k, { fill, ink: k === 'ae' ? '#16140F' : '#EDE4D0', rim: GOLD.leaf }])),
  districts: withWash({
    river: { tint: '#2B3634', accent: '#7FAAA3' },
    foundry: { tint: '#3A2A20', accent: '#C9744A' },
    main: { tint: '#3A2322', accent: '#B85A4F' },
  }, '#0B0907', 0.45),
};

export const BOND_THEME = {
  dark: false,
  ground: BOND.paper, raised: BOND.vellum, plate: '#E2D4B4', rule: BOND.rule, field: '#9C8C6C',
  ink: BOND.ink, inkSoft: '#4A443A', inkFaint: '#7A6F5A',
  money: GOLD.deep, accent: GOLD.deep, selection: GOLD.leaf,
  scrim: 'rgba(30,27,22,0.45)',
  gold: GOLD, iron: IRON, bond: BOND, jewel: { ...JEWEL, carnelianText: JEWEL.carnelian },
  companies: Object.fromEntries(Object.entries(COMPANY).map(([k, ink]) => [k, { fill: BOND.vellum, ink, rim: GOLD.deep }])),
  districts: withWash({
    river: { tint: '#D8C9A3', accent: '#5E8C86' },
    foundry: { tint: '#D9B59A', accent: '#A4552E' },
    main: { tint: '#D6AFA6', accent: '#8E3B32' },
  }, BOND.paper, 0.55),
};

export const AVATARS = ['#5E8C86', '#A4552E', '#8E3B32', '#3E6470', '#2F4A3A', '#8A6A22'];
export const TYCOON_TITLES = ['The Baron', 'The Banker', 'The Cattle Queen', 'The Rail King', 'The Oilman', 'The Heiress'];
export const MIN_TARGET = 44;
