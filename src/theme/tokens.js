// "Engraver's Ink" palette.

export const FONTS = {
  display: 'IMFellEnglishSC_400Regular',
  accent: 'IMFellEnglish_400Regular_Italic',
  ui: 'LibreFranklin_400Regular',
  uiMedium: 'LibreFranklin_500Medium',
  uiSemi: 'LibreFranklin_600SemiBold',
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
  districts: {
    river: { tint: '#D8C9A3', accent: '#5E8C86' },
    foundry: { tint: '#D9B59A', accent: '#A4552E' },
    main: { tint: '#D6AFA6', accent: '#8E3B32' },
  },
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
  districts: {
    river: { tint: '#2B3634', accent: '#7FAAA3' },
    foundry: { tint: '#3A2A20', accent: '#C9744A' },
    main: { tint: '#3A2322', accent: '#B85A4F' },
  },
  companies: darkCompanies(),
};

// Hard-hat avatar colours.
export const AVATARS = ['#5E8C86', '#A4552E', '#8E3B32', '#3E6470', '#2F4A3A', '#8A6A22'];

export const MIN_TARGET = 44;
