// Public API of the Iron & Gold design surface (hand-written from src/; the app itself is plain JS).
// Every component is React Native, rendered on the web through react-native-web: style props take
// React Native style objects (camelCase, unitless numbers), not CSS classes.
import * as React from 'react';

/** A React Native style object, or an array of them (falsy entries are ignored). */
export type RNStyle = Record<string, unknown> | Array<Record<string, unknown>>;

/** A lucide icon component (see `Icons`). Receives size / color / strokeWidth. */
export type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number; fill?: string }>;

// ---------------------------------------------------------------------------------------------
// Theme

export type CompanyId = 'cw' | 'pp' | 'pw' | 'rm' | 'ae' | 'cr' | 'ft';
export type DistrictKey = 'river' | 'foundry' | 'main';

export interface ThemePalette {
  dark: boolean;
  /** Page background. */
  paper: string;
  /** Raised surface (cards, selected tabs). */
  ledger: string;
  /** Primary text / borders. */
  ink: string;
  /** Secondary text. */
  inkSoft: string;
  /** Hairline dividers. */
  rule: string;
  /** Gilt accent (money, highlights, focus). */
  gilt: string;
  giltSoft: string;
  /** Text on an ink background. */
  onInk: string;
  /** Modal backdrop. */
  scrim: string;
  iron: { hi: string; mid: string; lo: string; rivet: string; text: string };
  goldLeaf: { hi: string; mid: string; lo: string; ink: string; emboss: string };
  moneyShadow: string;
  districts: Record<DistrictKey, { tint: string; accent: string; wash: string }>;
  companies: Record<CompanyId, { ink: string; fill: string }>;
}

/** Font family names. Use these in `fontFamily`, never a generic stack. */
export declare const FONTS: {
  display: 'IMFellEnglishSC_400Regular';
  accent: 'IMFellEnglish_400Regular_Italic';
  ui: 'LibreFranklin_400Regular';
  uiMedium: 'LibreFranklin_500Medium';
  uiSemi: 'LibreFranklin_600SemiBold';
  money: 'Cinzel_700Bold';
  engraved: 'Cinzel_600SemiBold';
};
export declare const LIGHT: ThemePalette;
export declare const DARK: ThemePalette;
/** Portrait background colours, indexed by avatar. */
export declare const AVATARS: string[];
export declare const TYCOON_TITLES: string[];
/** Minimum touch target (44). */
export declare const MIN_TARGET: number;
/** Blend two #RRGGBB colours; t = 0 -> a, 1 -> b. */
export declare function mix(a: string, b: string, t: number): string;

export interface ThemeProviderProps {
  children?: React.ReactNode;
}
/**
 * Supplies the palette (LIGHT or DARK, following the system colour scheme) to every component.
 * Wrap the whole app in it.
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

export type TextVariant = 'display' | 'title' | 'accent' | 'body' | 'label' | 'small' | 'strong' | 'plate';

export interface TProps {
  /**
   * Type style. display 22 / title 18 = IM Fell English SC; accent 15 = IM Fell italic;
   * body 14 / small 11 / label 12 / strong 14 = Libre Franklin; plate 15 = Cinzel engraved caps.
   */
  v?: TextVariant;
  /** Text colour; defaults to theme ink. */
  color?: string;
  style?: RNStyle;
  numberOfLines?: number;
  children?: React.ReactNode;
}
/** Themed text. The only text component: use it for every string. */
export declare function T(props: TProps): JSX.Element;

export interface MoneyProps {
  amount: number;
  /** Size, matching the text variants. */
  v?: 'small' | 'body' | 'strong' | 'title' | 'display';
  style?: RNStyle;
}
/** Gold-leaf money: `$1,234` in Cinzel with a faint emboss. */
export declare function Money(props: MoneyProps): JSX.Element;

export interface IngotProps {
  amount: number;
  /** Font size of the numerals. */
  size?: number;
  style?: RNStyle;
}
/** A gold ingot with engraved numerals, for headline money (player cash, winnings). */
export declare function Ingot(props: IngotProps): JSX.Element;

export interface DoubleRuleProps {
  style?: RNStyle;
}
/** Section divider drawn as a rail track (two iron rails on wooden ties), 16px tall. */
export declare function DoubleRule(props: DoubleRuleProps): JSX.Element;

export interface RailRuleProps {
  style?: RNStyle;
}
/** The rail-track divider itself (DoubleRule renders this). */
export declare function RailRule(props: RailRuleProps): JSX.Element;

export interface HairlineProps {
  style?: RNStyle;
}
/** 1px rule in the theme's rule colour. */
export declare function Hairline(props: HairlineProps): JSX.Element;

export interface KeylineProps {
  color: string;
  /** Distance from the parent's edges. */
  inset?: number;
}
/** Inset engraved border, absolutely positioned inside its parent. */
export declare function Keyline(props: KeylineProps): JSX.Element;

export interface CardProps {
  children?: React.ReactNode;
  style?: RNStyle;
}
/** Ledger card in a riveted iron frame with a gilt inner keyline. 16px padding. */
export declare function Card(props: CardProps): JSX.Element;

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  /** primary = riveted iron plate, secondary = gold leaf, tertiary = flat iron outline. */
  kind?: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
  /** Leading icon, e.g. `Icons.Hammer`. */
  icon?: IconComponent;
  /** Tighter horizontal padding, for buttons that share a row. */
  compact?: boolean;
  style?: RNStyle;
}
/** Call to action. Primary and secondary are raised 3D plates that sink when pressed. */
export declare function Button(props: ButtonProps): JSX.Element;

export interface IconButtonProps {
  icon: IconComponent;
  /** Accessibility label. */
  label: string;
  onPress?: () => void;
  color?: string;
  disabled?: boolean;
}
/** 44x44 bare icon button. */
export declare function IconButton(props: IconButtonProps): JSX.Element;

export interface StepperProps {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max: number;
  step?: number;
  label?: string;
}
/** Minus / value / plus control with square iron-bordered buttons. */
export declare function Stepper(props: StepperProps): JSX.Element;

export interface ScreenProps {
  children?: React.ReactNode;
  style?: RNStyle;
}
/** Full-height page on the paper background (flex: 1). */
export declare function Screen(props: ScreenProps): JSX.Element;

/** Brushed-iron gradient that fills its (position: relative) parent. */
export declare function IronFill(): JSX.Element;
/** Gold-leaf gradient that fills its parent. */
export declare function GoldFill(): JSX.Element;

export interface RivetsProps {
  size?: number;
  /** Distance from the parent's padding box; negative sits on the border. */
  inset?: number;
}
/** Four rivets, one per corner of the parent. */
export declare function Rivets(props: RivetsProps): JSX.Element;

export interface WordmarkProps {
  size?: number;
  align?: 'left' | 'center' | 'right';
}
/** The "Iron & Gold" wordmark: iron letters, gilt italic ampersand, gold GOLD. */
export declare function Wordmark(props: WordmarkProps): JSX.Element;

// ---------------------------------------------------------------------------------------------
// Brand art

export interface AvatarProps {
  /** Tycoon portrait, 0-5. */
  index?: number;
  size?: number;
  /** Adds a clockwork bot badge. */
  bot?: boolean;
  /** Gilt frame, e.g. for the acting player. */
  ring?: boolean;
}
/** A tycoon portrait in an ink frame on its colour ground. */
export declare function Avatar(props: AvatarProps): JSX.Element;

export interface PortraitProps {
  /** 0 Baron, 1 Banker, 2 Cattle Queen, 3 Rail King, 4 Oilman, 5 Heiress. */
  index?: number;
  size?: number;
}
/** Banknote cameo: sepia profile bust in a beaded gold oval. */
export declare function Portrait(props: PortraitProps): JSX.Element;
export declare const PORTRAIT_COUNT: number;

export interface EmblemProps {
  size?: number;
}
/** The "I&G 1881" gold coin emblem (the app icon). */
export declare function Emblem(props: EmblemProps): JSX.Element;

export interface CompanyIconProps {
  id: CompanyId;
  size?: number;
}
/** Square company badge: company fill + ink glyph. The one icon for a company everywhere. */
export declare function CompanyIcon(props: CompanyIconProps): JSX.Element;
/** The lucide glyph for a company. */
export declare function companyGlyph(id: CompanyId): IconComponent;

export interface RaisedTileProps {
  id: CompanyId;
  size?: number;
  /** Extrusion depth; defaults to 10% of size. */
  depth?: number;
}
/** A company tile with real depth: bevelled face, extruded side and a soft shadow. */
export declare function RaisedTile(props: RaisedTileProps): JSX.Element;

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
/** Engraved stock certificate on cream paper, with guilloché border, vignette, signatures and seal. */
export declare function Certificate(props: CertificateProps): JSX.Element;

export interface SealProps {
  size?: number;
  /** Initials engraved in the seal. */
  label: string;
}
/** Gold notarial seal. */
export declare function Seal(props: SealProps): JSX.Element;

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
export interface Dispatch {
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
/** Bottom action bar; its buttons follow the game phase. */
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
/** The city map: 9 x 12 plots in three district bands. Fills its parent; give it a height. */
export declare function Board(props: BoardProps): JSX.Element;

export interface TileProps {
  /** Plot id, e.g. "C7". */
  id: string;
  w: number;
  h: number;
  owner?: CompanyId | 'x';
  companySize?: number;
  district: DistrictKey;
  mine?: boolean;
  selected?: boolean;
  trust?: boolean;
  last?: boolean;
  delay?: number;
  onPress?: (id: string) => void;
}
/** One plot on the city map. */
export declare function Tile(props: TileProps): JSX.Element;

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

export interface TabsProps {
  tab: 'Deeds' | 'Market' | 'Tycoons';
  onTab: (tab: 'Deeds' | 'Market' | 'Tycoons') => void;
}
/** Deeds / Market / Tycoons tab strip with a gilt underline. */
export declare function Tabs(props: TabsProps): JSX.Element;
export declare const TAB_NAMES: Array<'Deeds' | 'Market' | 'Tycoons'>;
export declare const TAB_BODY_HEIGHT: number;

export interface ViewSwitchProps {
  view: 'map' | 'exchange';
  onView: (view: 'map' | 'exchange') => void;
  /** Flags the map segment when it's your turn. */
  mine?: boolean;
}
/** Compact Map / Exchange segmented switch. */
export declare function ViewSwitch(props: ViewSwitchProps): JSX.Element;

export interface GameHeaderProps {
  state: GameState;
  me?: Player | null;
  onHome?: () => void;
  view: 'map' | 'exchange';
  onView: (view: 'map' | 'exchange') => void;
  mine?: boolean;
  over?: boolean;
}
/** Game header: emblem, wordmark with turn line, view switch and your cash ingot. */
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

export interface DispatchLinesProps {
  d: Dispatch;
  max?: number;
}
/** The lines of one turn dispatch. */
export declare function DispatchLines(props: DispatchLinesProps): JSX.Element;

export interface DispatchToastProps {
  dispatch: Dispatch | null;
  /** Count of earlier dispatches folded into this one. */
  extra?: number;
  onDone: () => void;
}
/** Telegram card that drops in from the top after another tycoon's turn. Absolutely positioned. */
export declare function DispatchToast(props: DispatchToastProps): JSX.Element | null;

export interface DispatchRecapProps {
  dispatches: Dispatch[];
}
/** "Since your last turn" list. */
export declare function DispatchRecap(props: DispatchRecapProps): JSX.Element | null;

export interface HandoffCoverProps {
  player: Player | null;
  recap?: Dispatch[];
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
/** Bottom sheet on a Modal: iron top edge, display title, rail divider, scrolling body. Needs SafeAreaProvider. */
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
/** Company picker, share certificate and share register. */
export declare function CertificateSheet(props: CertificateSheetProps): JSX.Element | null;

export interface CharterSheetProps {
  visible: boolean;
  state: GameState;
  onPick?: (id: CompanyId) => void;
  onClose?: () => void;
}
/** Choose which company to charter. Renders only in the 'found' phase. */
export declare function CharterSheet(props: CharterSheetProps): JSX.Element | null;

export interface InvestSheetProps {
  visible: boolean;
  state: GameState;
  me: Player | null;
  onBuy?: (cart: Partial<Record<CompanyId, number>>) => void;
  onClose?: () => void;
}
/** Buy up to 3 shares. Renders only in the 'buy' phase. */
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

export interface SurvivorSheetProps {
  visible: boolean;
  state: GameState;
  me?: Player | null;
  onPick?: (id: CompanyId) => void;
  onClose?: () => void;
}
/** Name the survivor of a tied buyout. Renders only in the 'survivor' phase. */
export declare function SurvivorSheet(props: SurvivorSheetProps): JSX.Element | null;

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
export declare function describeTurn(state: GameState, recap: any): Dispatch;
export declare function turnsSince(state: GameState, seat: number, limit?: number): Dispatch[];
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
