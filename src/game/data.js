// Static game data: the board, districts, flavour text and companies.

export const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
export const COLS = 12;

export const START_CASH = 6000;
export const HAND_SIZE = 6;
export const SHARES_PER_COMPANY = 25;
export const TRUST_SIZE = 11;
export const END_SIZE = 41;
export const MAX_BUY = 3;

// Every plot id, e.g. "A1" … "I12". Row letter + column number.
export const TILES = [];
for (const r of ROWS) for (let c = 1; c <= COLS; c++) TILES.push(r + c);

export function parseTile(id) {
  return { r: ROWS.indexOf(id[0]), c: parseInt(id.slice(1), 10) };
}

export function tileId(r, c) {
  return ROWS[r] + c;
}

export function neighbours(id) {
  const { r, c } = parseTile(id);
  const out = [];
  if (r > 0) out.push(tileId(r - 1, c));
  if (r < ROWS.length - 1) out.push(tileId(r + 1, c));
  if (c > 1) out.push(tileId(r, c - 1));
  if (c < COLS) out.push(tileId(r, c + 1));
  return out;
}

export function manhattan(a, b) {
  const pa = parseTile(a);
  const pb = parseTile(b);
  return Math.abs(pa.r - pb.r) + Math.abs(pa.c - pb.c);
}

export const DISTRICTS = [
  { key: 'river', name: 'River Landing', from: 1, to: 4 },
  { key: 'foundry', name: 'Foundry Row', from: 5, to: 8 },
  { key: 'main', name: 'Main Street', from: 9, to: 12 },
];

export function districtOf(id) {
  const { c } = parseTile(id);
  return DISTRICTS.find((d) => c >= d.from && c <= d.to);
}

const FLAVOUR = {
  river: [
    'Wharf', 'Ferry slip', 'Boathouse', 'Cooperage', 'Chandlery', 'Ice house',
    'Customs shed', 'Bait shop', 'Rope walk', 'Grain elevator', 'Fish market', 'Sandbar lot',
  ],
  foundry: [
    'Rail yard', 'Roundhouse', 'Smithy', 'Coal yard', 'Machine shop', 'Boiler works',
    'Brick kiln', 'Freight shed', 'Tannery', 'Pattern shop', 'Scrap lot', 'Car barn',
  ],
  main: [
    'Saloon', 'Hotel', 'Dry goods', 'Barber', 'Assay office', 'Opera house',
    'Livery', 'Print shop', 'Chapel', 'Jailhouse', 'Apothecary', 'Land office',
  ],
};

export function flavourOf(id) {
  const { r, c } = parseTile(id);
  const list = FLAVOUR[districtOf(id).key];
  return list[(r * 5 + c * 7) % list.length];
}

// tier: 0 Frontier, 1 Growth, 2 Heavy
export const COMPANIES = [
  { id: 'cw', name: 'Continental Wire', short: 'Wire', industry: 'Telegraph', tier: 0, icon: 'RadioTower' },
  { id: 'pp', name: 'Platte River Packet', short: 'Packet', industry: 'Shipping', tier: 0, icon: 'Ship' },
  { id: 'pw', name: 'Plains & Western Railway', short: 'P&W', industry: 'Railroad', tier: 1, icon: 'TrainFront' },
  { id: 'rm', name: 'Red Mesa Oil', short: 'Red Mesa', industry: 'Oil', tier: 1, icon: 'Fuel' },
  { id: 'ae', name: 'Arclight Electric', short: 'Arclight', industry: 'Electric light', tier: 1, icon: 'Lightbulb' },
  { id: 'cr', name: 'Carbon Ridge Steel', short: 'Carbon Ridge', industry: 'Steel', tier: 2, icon: 'Factory' },
  { id: 'ft', name: 'First Territorial Bank', short: 'Territorial', industry: 'Banking', tier: 2, icon: 'Landmark' },
];

export const COMPANY_IDS = COMPANIES.map((c) => c.id);
export const TIER_NAMES = ['Frontier', 'Growth', 'Heavy'];

export function company(id) {
  return COMPANIES.find((c) => c.id === id);
}

export const BOT_NAMES = ['Col. Barlow', 'Widow Pike', 'Judge Harlan', 'Doc Ambrose', 'Miss Tate', 'Mr. Quill'];
