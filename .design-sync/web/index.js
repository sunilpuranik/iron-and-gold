// Web entry for the Claude Design sync: the app's public design surface, compiled for the
// browser by build-web.mjs (react-native -> react-native-web). Re-exports only; no new UI.

// Theme
export { ThemeProvider, useTheme } from '../../src/theme/theme';
export {
  FONTS, LIGHT, DARK, AVATARS, TYCOON_TITLES, MIN_TARGET, mix,
} from '../../src/theme/tokens';
export { SafeAreaProvider } from 'react-native-safe-area-context';

// Primitives
export {
  T, Money, DoubleRule, Hairline, Keyline, Card, Button, IconButton, Stepper, Screen, Ingot,
} from '../../src/theme/ui';
export {
  IronFill, GoldFill, Rivets, RailRule, Wordmark,
} from '../../src/theme/brand';

// Brand art
export { default as Avatar } from '../../src/components/Avatar';
export { default as Certificate, Seal } from '../../src/components/Certificate';
export { default as CompanyIcon, companyGlyph } from '../../src/components/CompanyIcon';
export { default as Emblem } from '../../src/components/Emblem';
export { default as Portrait, PORTRAIT_COUNT } from '../../src/components/Portrait';
export { default as RaisedTile } from '../../src/components/RaisedTile';

// Game
export { default as ActionBar } from '../../src/components/game/ActionBar';
export { default as Board } from '../../src/components/game/Board';
export { default as DeedsTab, DEED_HEIGHT } from '../../src/components/game/DeedsTab';
export { DispatchLines, DispatchToast, DispatchRecap } from '../../src/components/game/Dispatch';
export { default as EventOverlay } from '../../src/components/game/EventOverlay';
export { default as ExchangeView } from '../../src/components/game/ExchangeView';
export { default as HandoffCover } from '../../src/components/game/HandoffCover';
export { default as GameHeader } from '../../src/components/game/Header';
export { default as MarketTab } from '../../src/components/game/MarketTab';
export { default as Tabs, TAB_NAMES, TAB_BODY_HEIGHT } from '../../src/components/game/Tabs';
export { default as Tile } from '../../src/components/game/Tile';
export { default as TycoonsTab } from '../../src/components/game/TycoonsTab';
export { default as ViewSwitch } from '../../src/components/game/ViewSwitch';

// Sheets
export { default as Sheet } from '../../src/components/sheets/Sheet';
export { default as BellSheet } from '../../src/components/sheets/BellSheet';
export { default as CertificateSheet } from '../../src/components/sheets/CertificateSheet';
export { default as CharterSheet } from '../../src/components/sheets/CharterSheet';
export { default as InvestSheet } from '../../src/components/sheets/InvestSheet';
export { default as SettleSheet } from '../../src/components/sheets/SettleSheet';
export { default as SurvivorSheet } from '../../src/components/sheets/SurvivorSheet';
export { default as TickerSheet } from '../../src/components/sheets/TickerSheet';

// Game data + engine (build real game states to feed the game components)
export {
  COMPANIES, COMPANY_IDS, company, TIER_NAMES, DISTRICTS, districtOf, flavourOf, ROWS, COLS, TILES,
  START_CASH, HAND_SIZE, SHARES_PER_COMPANY, TRUST_SIZE, END_SIZE, MAX_BUY, BOT_NAMES,
} from '../../src/game/data';
export {
  newGame, applyAction, botAction, actorOf, sizes, price, isTrust, activeCompanies, classify, effectOf, netWorth,
} from '../../src/game/engine';
export { describeTurn, turnsSince, latestTurn } from '../../src/game/recap';

// The icon vocabulary the app uses (lucide), as one namespace: Icons.Hammer, Icons.Bell, ...
import {
  Bell, Bot, ChartColumn, ChevronLeft, ChevronsRight, Crown, Diamond, Factory, Fuel, Hammer, Landmark,
  Lightbulb, Map, Minus, Newspaper, Plus, RadioTower, ScrollText, Share, Ship, TrainFront, User, X,
} from 'lucide-react-native';

export const Icons = {
  Bell, Bot, ChartColumn, ChevronLeft, ChevronsRight, Crown, Diamond, Factory, Fuel, Hammer, Landmark,
  Lightbulb, Map, Minus, Newspaper, Plus, RadioTower, ScrollText, Share, Ship, TrainFront, User, X,
};

// React Native layout primitives (react-native-web), so designs lay out the way the app does:
// const { View, ScrollView, Pressable } = RN;
export * as RN from 'react-native';
