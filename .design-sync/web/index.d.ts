// Public API of the Iron & Gold design surface (hand-written from src/; the app itself is plain JS).
// Every component is React Native, rendered on the web through react-native-web: style props take
// React Native style objects (camelCase, unitless numbers), not CSS classes.
import * as React from 'react';

/** A React Native style object, or an array of them (falsy entries are ignored). */
export type RNStyle = Record<string, unknown> | Array<Record<string, unknown>>;

/** A lucide icon component (see `Icons`). Receives size / color / strokeWidth. */
export type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number; fill?: string }>;

// ---------------------------------------------------------------------------------------------
// Theme — "The Gilded Standard": black lacquer, riveted iron, one gold, bond paper for documents.

export type CompanyId = 'cw' | 'pp' | 'pw' | 'rm' | 'ae' | 'cr' | 'ft';
export type DistrictKey = 'river' | 'foundry' | 'main';

export interface GoldLeaf {
  shine: string; bright: string; leaf: string; deep: string; burnish: string; ink: string;
  /** Border of gold plates and buttons, and their 4px base. */
  edge: string;
  /** Light text-shadow for lettering struck on gold. */
  emboss: string;
  /** Gradient stops top to bottom (offsets 0, .18, .5, 1). */
  stops: [string, string, string, string];
}
export interface IronPalette { hi: string; mid: string; lo: string; edge: string; rivet: string; text: string }
export interface BondPalette { paper: string; vellum: string; ink: string; rule: string }
export interface JewelPalette {
  /** You, your turn, selection. */
  lapis: string;
  /** Loss, errors, bell warning (fills). */
  carnelian: string;
  /** Carnelian that reads as text on lacquer. */
  carnelianText: string;
}

export interface ThemePalette {
  dark: boolean;
  /** Page background (black lacquer, or bond paper in the light theme). */
  ground: string;
  /** Raised surface: sheets, selected tabs, rows. */
  raised: string;
  /** Plate surface: panels (see Plate). */
  plate: string;
  /** Hairline dividers and panel borders. */
  rule: string;
  /** Input and control borders. */
  field: string;
  ink: string;
  inkSoft: string;
  inkFaint: string;
  /** Money text. */
  money: string;
  /** Gilt decoration: rules, keylines, section labels. */
  accent: string;
  /** Selected / current item highlight. */
  selection: string;
  /** Modal backdrop. */
  scrim: string;
  gold: GoldLeaf;
  iron: IronPalette;
  bond: BondPalette;
  jewel: JewelPalette;
  districts: Record<DistrictKey, { tint: string; accent: string; wash: string }>;
  companies: Record<CompanyId, { fill: string; ink: string; rim: string }>;
}

/** Font family names. Use these in `fontFamily`, never a generic stack. Cinzel carries every engraved capital. */
export declare const FONTS: {
  display: 'Cinzel_700Bold';
  engraved: 'Cinzel_600SemiBold';
  money: 'Cinzel_700Bold';
  accent: 'IMFellEnglish_400Regular_Italic';
  ui: 'LibreFranklin_400Regular';
  uiMedium: 'LibreFranklin_500Medium';
  uiSemi: 'LibreFranklin_600SemiBold';
};
export type TextVariant = 'hero' | 'display' | 'title' | 'plate' | 'accent' | 'body' | 'strong' | 'label' | 'small';
/** The type scale behind `T` (fontFamily, fontSize, letterSpacing per variant). */
export declare const TYPE: Record<TextVariant, { fontFamily: string; fontSize: number; letterSpacing?: number }>;
/** One gold, identical in both themes. */
export declare const GOLD: GoldLeaf;
export declare const IRON: IronPalette;
/** Bond paper — documents only (certificates, deeds, the final ledger). */
export declare const BOND: BondPalette;
export declare const JEWEL: JewelPalette;
/** Spacing scale: 0, 4, 8, 12, 16, 24, 32, 48. */
export declare const SPACE: number[];
/** The gilt keyline every plate carries. */
export declare const KEYLINE: { color: string; inset: number };
/** Corner radius: 0. Square, engraved corners everywhere. */
export declare const RADIUS: 0;
/** The default theme: black lacquer and gold leaf. */
export declare const LACQUER: ThemePalette;
/** The light theme: bond paper. */
export declare const BOND_THEME: ThemePalette;
/** Portrait background colours, indexed by avatar. */
export declare const AVATARS: string[];
export declare const TYCOON_TITLES: string[];
/** Splash wanted-poster epithets, one per portrait (same order as TYCOON_TITLES). */
export declare const TYCOON_EPITHETS: string[];
/** Splash wanted-poster mottos, one per portrait (same order as TYCOON_TITLES). */
export declare const TYCOON_MOTTOS: string[];
/** Minimum touch target (44). */
export declare const MIN_TARGET: number;
/** Blend two #RRGGBB colours; t = 0 -> a, 1 -> b. */
export declare function mix(a: string, b: string, t: number): string;

export interface ThemeProviderProps {
  /** Pin the theme: 'dark' = LACQUER (the house style), 'light' = BOND_THEME. Omit to follow the system colour scheme. */
  scheme?: 'dark' | 'light';
  children?: React.ReactNode;
}
/**
 * Supplies the palette to every component. Wrap the whole app in it - use scheme="dark" for the Gilded Standard look.
 */
export declare function ThemeProvider(props: ThemeProviderProps): JSX.Element;
/** The active palette. */
export declare function useTheme(): ThemePalette;

export interface SafeAreaProviderProps {
  children?: React.ReactNode;
}
/** Required above any `Sheet` (it reads safe-area insets). Re-exported from react-native-safe-area-context. */
export declare function SafeAreaProvider(props: SafeAreaProviderProps): JSX.Element;

// ---------------------------------------------------------------------------------------------
// Primitives

export interface TProps {
  /**
   * Type style. hero 34 (gilt) / display 24 / title 18 = Cinzel 700; plate 13 = Cinzel 600, always
   * uppercase, wide tracking; accent 17 = IM Fell italic; body 15 / strong 15 / label 12 / small 11 = Libre Franklin.
   */
  v?: TextVariant;
  /** Text colour; defaults to theme ink (hero: theme money). */
  color?: string;
  style?: RNStyle;
  numberOfLines?: number;
  children?: React.ReactNode;
}
/** Themed text. The only text component: use it for every string. */
export declare function T(props: TProps): JSX.Element;

export interface MoneyProps {
  amount: number;
  /**
   * ingot = headline cash only (your wallet, winnings): engraved numerals on a gold ingot.
   * title 18 / body 14 / small 11 = gold Cinzel numerals.
   */
  v?: 'ingot' | 'title' | 'body' | 'small';
  /** Show a sign: +$300 in gold, −$300 in carnelian. Negative amounts are carnelian regardless. */
  delta?: boolean;
  /** Font size override (ingot defaults to 20). */
  size?: number;
  style?: RNStyle;
}
/** Money in engraved capitals with lining numerals. Never format dollars with plain text. */
export declare function Money(props: MoneyProps): JSX.Element;

export interface RuleProps {
  /** hair = 1px between rows; gilt = double gold rule under section titles; ornament = fading gold lines around a diamond; rail = rail track, the map only. */
  kind?: 'hair' | 'gilt' | 'ornament' | 'rail';
  style?: RNStyle;
}
/** Divider. */
export declare function Rule(props: RuleProps): JSX.Element;

export interface PlateProps {
  /** lacquer (default) = raised black panel; iron = brushed iron; gold = gold leaf, wealth moments only; bond = cream paper, documents only. */
  material?: 'lacquer' | 'iron' | 'gold' | 'bond';
  /** Four rivets in the corners. */
  rivets?: boolean;
  /** Padding (default 16). */
  pad?: number;
  style?: RNStyle;
  children?: React.ReactNode;
}
/** The one surface primitive: square corners, 1px border, gilt keyline inset 5. */
export declare function Plate(props: PlateProps): JSX.Element;

export interface ButtonProps {
  /** Label, rendered in engraved capitals. Optional with iconOnly. */
  title?: string;
  onPress?: () => void;
  /**
   * gold (default) = THE one primary action per screen: gold leaf on a 4px base;
   * iron = secondary: iron plate on a 4px base; ghost = tertiary: gilt outline.
   */
  kind?: 'gold' | 'iron' | 'ghost';
  /** A bare 44x44 icon button (tertiary). Needs `icon` and `label`. */
  iconOnly?: boolean;
  /** Leading icon, e.g. `Icons.Hammer`. */
  icon?: IconComponent;
  /** Accessibility label (iconOnly). */
  label?: string;
  /** Icon/label colour override for ghost and iconOnly. */
  color?: string;
  disabled?: boolean;
  /** Tighter horizontal padding, for buttons that share a row. */
  compact?: boolean;
  style?: RNStyle;
}
/** Call to action. Gold and iron are raised plates that sink onto their base when pressed. */
export declare function Button(props: ButtonProps): JSX.Element;

export interface StepperProps {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max: number;
  step?: number;
  label?: string;
}
/** Minus / value / plus with square 44pt buttons; plus carries the gilt border. */
export declare function Stepper(props: StepperProps): JSX.Element;

export interface ScreenProps {
  children?: React.ReactNode;
  style?: RNStyle;
}
/** Full-height page on the theme ground (flex: 1). */
export declare function Screen(props: ScreenProps): JSX.Element;

export interface WordmarkProps {
  size?: number;
  align?: 'left' | 'center' | 'right';
}
/** "IRON & GOLD" in Cinzel: IRON in rivet grey, a gilt italic ampersand, GOLD in gold leaf. */
export declare function Wordmark(props: WordmarkProps): JSX.Element;

export interface SealProps {
  /** notary (default) = the company stamp on certificates; coin = the Iron & Gold emblem (IG 1881). */
  kind?: 'notary' | 'coin';
  size?: number;
  /** Letters struck in the seal (notary: company initials; coin: defaults to "IG"). */
  label?: string;
}
/** Struck gold seal. */
export declare function Seal(props: SealProps): JSX.Element;

// ---------------------------------------------------------------------------------------------
// Brand art

export interface PortraitProps {
  /** 0 Baron, 1 Banker, 2 Cattle Queen, 3 Rail King, 4 Oilman, 5 Heiress. */
  index?: number;
  size?: number;
  /** Adds a clockwork bot badge. */
  bot?: boolean;
  /** Gold halo for the acting or chosen tycoon. */
  ring?: boolean;
}
/** A tycoon: banknote cameo in a round gold-rimmed frame on its colour ground. One cameo at every size. */
export declare function Portrait(props: PortraitProps): JSX.Element;
export declare const PORTRAIT_COUNT: number;

export interface CompanyMarkProps {
  id: CompanyId;
  size?: number;
  /** A raised block with bevel, extruded side and shadow — for hero moments (charters, buyouts). */
  raised?: boolean;
  /** Extrusion depth when raised; defaults to 10% of size. */
  depth?: number;
}
/** The one mark for a company everywhere: company fill, ink glyph, gold rim, square. */
export declare function CompanyMark(props: CompanyMarkProps): JSX.Element;
/** The lucide glyph for a company. */
export declare function companyGlyph(id: CompanyId): IconComponent;

export interface CertificateProps {
  id: CompanyId;
  state: GameState;
  /** Registered owner's name. */
  owner?: string;
  /** Share count; 0 prints a SPECIMEN certificate. */
  shares: number;
  /** Certificate number. */
  number: number;
}
/** Engraved stock certificate on bond paper: guilloché in the company ink, vignette, signatures, notary seal. */
export declare function Certificate(props: CertificateProps): JSX.Element;

// ---------------------------------------------------------------------------------------------
// Game

export interface Player {
  id: string;
  name: string;
  avatar: number;
  bot: boolean;
  cash: number;
  hand: string[];
  shares: Record<CompanyId, number>;
}
export interface LogLine {
  text: string;
  kind?: 'turn' | 'money' | 'buyout' | 'bell' | string;
  turn: number;
  seq: number;
}
/** A full game state, from `newGame` then `applyAction` / `botAction`. */
export interface GameState {
  players: Player[];
  /** Plot id -> company id, or 'x' for a loose (unowned) building. */
  board: Record<string, CompanyId | 'x'>;
  pool: string[];
  bank: Record<CompanyId, number>;
  turn: number;
  turnNo: number;
  phase: 'place' | 'found' | 'survivor' | 'dispose' | 'buy' | 'over';
  pending: any;
  last: string | null;
  log: LogLine[];
  turns: any[];
  fx: any;
  seq: number;
  reason?: string;
  results: Array<{ seat: number; rank: number; cash: number }> | null;
}
/** What one tycoon did on one turn (from describeTurn / turnsSince). */
export interface TurnDispatch {
  turn: number;
  seat: number;
  player: Player;
  lines: Array<{ text: string; kind?: string }>;
}

export interface ActionBarProps {
  phase: GameState['phase'];
  /** Whether it's the viewer's turn. */
  mine: boolean;
  actorName?: string;
  /** Selected plot id in the place phase. */
  selected?: string | null;
  canBell?: boolean;
  onBuild?: (tile: string) => void;
  onInvest?: () => void;
  onPass?: () => void;
  onBell?: () => void;
  onDecide?: () => void;
  onResults?: () => void;
}
/** Bottom action bar; its buttons follow the game phase (one gold primary, iron Bell, ghost Pass). */
export declare function ActionBar(props: ActionBarProps): JSX.Element;

export interface BoardProps {
  state: GameState;
  /** The viewer's deeds (highlighted plots). */
  myHand?: string[];
  canPick?: boolean;
  selected?: string | null;
  onTilePress?: (tile: string) => void;
  onCompanyPress?: (id: CompanyId) => void;
}
/** The city map: 9 x 12 plots in three district bands (plots are internal). Fills its parent; give it a height. */
export declare function Board(props: BoardProps): JSX.Element;

export interface DeedsTabProps {
  state: GameState;
  hand?: string[];
  selected?: string | null;
  canBuild?: boolean;
  onDeed?: (tile: string) => void;
}
/** The viewer's deed cards, three per row, tinted by district. */
export declare function DeedsTab(props: DeedsTabProps): JSX.Element;
export declare const DEED_HEIGHT: number;

export interface MarketTabProps {
  state: GameState;
  me?: Player | null;
  onCertificate?: (id: CompanyId) => void;
}
/** Company list with share price, size and holdings. */
export declare function MarketTab(props: MarketTabProps): JSX.Element;

export interface TycoonsTabProps {
  state: GameState;
  mySeat?: number;
}
/** Player list with portraits, holdings and cash. */
export declare function TycoonsTab(props: TycoonsTabProps): JSX.Element;

export interface TabItem {
  key: string;
  label: string;
  /** Required for kind="switch". */
  icon?: IconComponent;
  /** Gold dot: this segment wants attention. */
  flag?: boolean;
}
export interface TabsProps {
  /** underline (default) = engraved labels over a gold underline; switch = compact icon segments, the lit one iron. */
  kind?: 'underline' | 'switch';
  /** Tab names, or items. Defaults to TAB_NAMES. */
  items?: Array<string | TabItem>;
  value: string;
  onChange: (key: string) => void;
}
/** Tabs: the Deeds / Market / Tycoons strip, or the header's Map / Exchange switch. */
export declare function Tabs(props: TabsProps): JSX.Element;
export declare const TAB_NAMES: Array<'Deeds' | 'Market' | 'Tycoons'>;
export declare const TAB_BODY_HEIGHT: number;

export interface GameHeaderProps {
  state: GameState;
  me?: Player | null;
  onHome?: () => void;
  view: 'map' | 'exchange';
  onView: (view: 'map' | 'exchange') => void;
  mine?: boolean;
  over?: boolean;
}
/** Game header: coin seal, wordmark with turn line, Map / Exchange switch, your cash ingot, rail rule. */
export declare function GameHeader(props: GameHeaderProps): JSX.Element;

export interface ExchangeViewProps {
  state: GameState;
  mySeat: number;
  mine?: boolean;
  showMine?: boolean;
  onMap?: () => void;
  onCertificate?: (id: CompanyId) => void;
  onTicker?: () => void;
}
/** The exchange: standings, your position, company race, closing bell and latest moves. */
export declare function ExchangeView(props: ExchangeViewProps): JSX.Element;

export interface DispatchProps {
  /**
   * toast (default) = telegram card that drops in from the top after another tycoon's turn (absolutely positioned);
   * recap = "since your last turn" list; lines = just the lines of one dispatch.
   */
  as?: 'toast' | 'recap' | 'lines';
  /** toast, lines. */
  dispatch?: TurnDispatch | null;
  /** recap. */
  dispatches?: TurnDispatch[];
  /** toast: count of earlier dispatches folded into this one. */
  extra?: number;
  /** lines: how many lines to show. */
  max?: number;
  /** toast: called when dismissed or timed out. */
  onDone?: () => void;
}
/** Turn dispatches. */
export declare function Dispatch(props: DispatchProps): JSX.Element | null;

export interface HandoffCoverProps {
  player: Player | null;
  recap?: TurnDispatch[];
  onReady?: () => void;
}
/** Full-screen pass-and-play cover (a Modal). */
export declare function HandoffCover(props: HandoffCoverProps): JSX.Element;

export interface EventOverlayProps {
  /** An event carrying `fx` from the game state (a charter or a buyout). */
  event: { fx: any };
  state: GameState;
  remaining?: number;
  onDone?: () => void;
}
/** Celebration card for a charter or buyout, with stamp and falling coins. Absolutely positioned. */
export declare function EventOverlay(props: EventOverlayProps): JSX.Element;

// ---------------------------------------------------------------------------------------------
// Splash (the home screen: the "Splash — Gold Rush" design)

export interface FrontierSceneProps {
  width: number;
  height: number;
  /** Safe-area top inset; pads the title block down from the notch. */
  topInset?: number;
}
/**
 * The splash hero: dusk over the frontier (sunburst, mesas, saguaros), a train and riders crossing on a
 * scrolling rail line, falling gold coins, and the title block (coin Seal, Wordmark, tagline, "A FRONTIER
 * RAIL TOWN · 1881"). Animated loops; holds still with Reduce Motion. Fills exactly width × height.
 */
export declare function FrontierScene(props: FrontierSceneProps): JSX.Element;

export interface WantedPosterProps {
  /** Your alias (max 16 chars). */
  name: string;
  onName?: (name: string) => void;
  /** The chosen magnate, a Portrait index 0-5. */
  avatar: number;
  onAvatar?: (index: number) => void;
  /** Narrow-phone sizing. */
  compact?: boolean;
}
/**
 * A "WANTED" poster on bond paper (cream, double-ruled, slightly askew, foxed): the chosen magnate's large
 * portrait with an ENLISTED stamp, epithet, title and motto, an ALIAS field, and the six magnates to pick from.
 */
export declare function WantedPoster(props: WantedPosterProps): JSX.Element;

export interface NewGameCardProps {
  onPress?: () => void;
  /** Card width, for the light sweep across the gold plate. */
  width: number;
  compact?: boolean;
}
/** The primary splash action: a gold Plate "NEW BOT GAME" card with a bot ring, a chevron and a periodic shine. */
export declare function NewGameCard(props: NewGameCardProps): JSX.Element;

export interface ContinueCardProps {
  /** The saved local game. */
  saved: GameState;
  /** Your player id in that game (ranks you by net worth). */
  myId: string;
  onPress?: () => void;
  /** Shortens the title to "CONTINUE". */
  compact?: boolean;
}
/** Iron Plate "CONTINUE BOT GAME" card with an IN PLAY tag, "Turn N · you're 2nd · $12.4k" and a gold progress bar (plots dealt). */
export declare function ContinueCard(props: ContinueCardProps): JSX.Element;

export interface InviteCardProps {
  /** The 4-letter room code from the link. */
  code: string;
  /** Your alias; Join is disabled while it's empty. */
  name: string;
  onName?: (name: string) => void;
  onJoin?: () => void;
  busy?: boolean;
  compact?: boolean;
}
/** Gold "YOU'RE INVITED · TABLE ABCD" card shown at the top of Home when a friend's room link opened the app: name field + Join. */
export declare function InviteCard(props: InviteCardProps): JSX.Element;

/** An online room row as the Saloon lists it. */
export interface SaloonRoom {
  code: string;
  title?: string | null;
  status: 'lobby' | 'playing' | 'over';
  /** The uid whose move it is (status 'playing'). */
  turn_of?: string | null;
  lobby: { host: string; players: Array<{ id: string; name: string }> };
}

export interface SaloonPanelProps {
  /** false shows "Online play isn't set up in this build." */
  enabled: boolean;
  /** Your rooms; null while loading (shows a spinner). */
  tables: { uid: string; rows: SaloonRoom[] } | null;
  /** The search field; a 4-letter value is treated as a room code and offers "Join". */
  query: string;
  onQuery?: (query: string) => void;
  busy?: boolean;
  /** Error line under the panel. */
  err?: string | null;
  onHost?: () => void;
  onJoin?: (code: string) => void;
  onOpen?: (room: SaloonRoom) => void;
  /** Host only: close a table (trash button on the row). */
  onDelete?: (room: SaloonRoom) => void;
  compact?: boolean;
}
/** "THE SALOON · LOBBY": the online lobby panel — + Host, MY ROOMS, search-or-code field and room rows (IN PLAY / WAITING, OPEN / REJOIN). */
export declare function SaloonPanel(props: SaloonPanelProps): JSX.Element;

/** The splash sign-off: "Fortunes are made on the rails, and lost there too." between two gilt rules. */
export declare function FooterQuote(): JSX.Element;

// ---------------------------------------------------------------------------------------------
// Sheets

export interface SheetProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  /** Makes the sheet dismissable (close button + backdrop tap). */
  onClose?: () => void;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}
/** Bottom sheet on a Modal: raised lacquer under a gold-leaf edge, drag handle, display title, gilt rule. Needs SafeAreaProvider. */
export declare function Sheet(props: SheetProps): JSX.Element;

export interface BellSheetProps {
  visible: boolean;
  state: GameState;
  mySeat?: number;
  onHome?: () => void;
  onClose?: () => void;
}
/** Final standings. Renders only when state.phase is 'over'. */
export declare function BellSheet(props: BellSheetProps): JSX.Element | null;

export interface CertificateSheetProps {
  visible: boolean;
  state: GameState;
  id: CompanyId | null;
  me?: Player | null;
  mySeat?: number;
  onPick?: (id: CompanyId) => void;
  onClose?: () => void;
}
/** Share register: the certificate, a strip of company marks to switch it, and the holders. */
export declare function CertificateSheet(props: CertificateSheetProps): JSX.Element | null;

export interface CompanySheetProps {
  /** charter (default) = found a company, phase 'found'; survivor = name the survivor of a tied buyout, phase 'survivor'. */
  mode?: 'charter' | 'survivor';
  visible: boolean;
  state: GameState;
  /** survivor: shows your holding of each tied company. */
  me?: Player | null;
  onPick?: (id: CompanyId) => void;
  onClose?: () => void;
}
/** Choose a company. Renders only in the matching phase. */
export declare function CompanySheet(props: CompanySheetProps): JSX.Element | null;

export interface InvestSheetProps {
  visible: boolean;
  state: GameState;
  me: Player | null;
  onBuy?: (cart: Partial<Record<CompanyId, number>>) => void;
  onClose?: () => void;
}
/** "Buy shares": up to 3 among chartered companies, iron Pass beside the gold Buy. Renders only in the 'buy' phase. */
export declare function InvestSheet(props: InvestSheetProps): JSX.Element | null;

export interface SettleSheetProps {
  visible: boolean;
  state: GameState;
  me: Player | null;
  onSettle?: (choice: { sell: number; trade: number }) => void;
  onClose?: () => void;
}
/** Sell / swap / hold shares of an absorbed company. Renders only in the 'dispose' phase. */
export declare function SettleSheet(props: SettleSheetProps): JSX.Element | null;

export interface TickerSheetProps {
  visible: boolean;
  state: GameState;
  dispatches?: boolean;
  onDispatches?: (on: boolean) => void;
  onClose?: () => void;
}
/** The move log, newest first, with the dispatches toggle. */
export declare function TickerSheet(props: TickerSheetProps): JSX.Element | null;

// ---------------------------------------------------------------------------------------------
// Game data + engine

export interface Company {
  id: CompanyId;
  name: string;
  short: string;
  industry: string;
  tier: 0 | 1 | 2;
  icon: string;
}
export declare const COMPANIES: Company[];
export declare const COMPANY_IDS: CompanyId[];
export declare function company(id: CompanyId): Company;
export declare const TIER_NAMES: string[];
export declare const DISTRICTS: Array<{ key: DistrictKey; name: string; from: number; to: number }>;
export declare function districtOf(tile: string): { key: DistrictKey; name: string; from: number; to: number };
export declare function flavourOf(tile: string): string;
export declare const ROWS: string[];
export declare const COLS: number;
export declare const TILES: string[];
export declare const START_CASH: number;
export declare const HAND_SIZE: number;
export declare const SHARES_PER_COMPANY: number;
export declare const TRUST_SIZE: number;
export declare const END_SIZE: number;
export declare const MAX_BUY: number;
export declare const BOT_NAMES: string[];

/** Start a game. players: 2-6 of { id, name, avatar?, bot? }. Pass a seed for a repeatable deal. */
export declare function newGame(
  players: Array<{ id: string; name: string; avatar?: number; bot?: boolean }>,
  opts?: { seed?: number },
): GameState;
/** Apply one action for a seat; returns the next state, or null if illegal. */
export declare function applyAction(state: GameState, seat: number, action: any): GameState | null;
/** The action a bot would take now. Pair with actorOf + applyAction to advance a game. */
export declare function botAction(state: GameState): any;
/** Seat that must act now. */
export declare function actorOf(state: GameState): number;
export declare function sizes(state: GameState): Record<CompanyId, number>;
export declare function price(id: CompanyId, size: number): number;
export declare function isTrust(size: number): boolean;
export declare function activeCompanies(state: GameState): CompanyId[];
export declare function classify(state: GameState, tile: string): { kind: string; [k: string]: any };
export declare function effectOf(state: GameState, tile: string): string;
export declare function netWorth(state: GameState, seat: number): number;
export declare function describeTurn(state: GameState, recap: any): TurnDispatch;
export declare function turnsSince(state: GameState, seat: number, limit?: number): TurnDispatch[];
export declare function latestTurn(state: GameState): any;

/** The app's lucide icon set: Icons.Hammer, Icons.Bell, Icons.Landmark, ... */
export declare const Icons: {
  Bell: IconComponent; Bot: IconComponent; ChartColumn: IconComponent; ChevronLeft: IconComponent;
  ChevronsRight: IconComponent; Crown: IconComponent; Diamond: IconComponent; Factory: IconComponent;
  Fuel: IconComponent; Hammer: IconComponent; Landmark: IconComponent; Lightbulb: IconComponent;
  Map: IconComponent; Minus: IconComponent; Newspaper: IconComponent; Plus: IconComponent;
  RadioTower: IconComponent; ScrollText: IconComponent; Share: IconComponent; Ship: IconComponent;
  TrainFront: IconComponent; User: IconComponent; X: IconComponent;
};

/**
 * React Native primitives (via react-native-web) for layout glue: View, ScrollView, Pressable, Switch,
 * TextInput, Image, Modal, StyleSheet, Animated, useWindowDimensions. Style them with RN style objects.
 * Use T (not RN.Text) for all text.
 */
export declare const RN: {
  View: React.ComponentType<any>;
  ScrollView: React.ComponentType<any>;
  Pressable: React.ComponentType<any>;
  Switch: React.ComponentType<any>;
  TextInput: React.ComponentType<any>;
  Image: React.ComponentType<any>;
  Modal: React.ComponentType<any>;
  Text: React.ComponentType<any>;
  StyleSheet: { create<T>(styles: T): T; hairlineWidth: number; absoluteFill: object };
  Animated: any;
  useWindowDimensions(): { width: number; height: number };
  [name: string]: any;
};
