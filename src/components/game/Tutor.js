// First-game tips: the real game, coached. The first time each moment comes up (your first build,
// charter, investment, buyout, ...) a short card explains it. A tip counts as seen once you tap
// "Got it" or once you've acted on it, and it never comes back. Stored per device, like the profile;
// "Replay first-game tips" in How to play resets them.
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Lightbulb } from 'lucide-react-native';
import { useTheme } from '../../theme/theme';
import { Button, T } from '../../theme/ui';
import { FONTS } from '../../theme/tokens';
import { MAX_BUY, TRUST_SIZE } from '../../game/data';
import { loadTutor, saveTutor } from '../../store/storage';

// In priority order; the first unseen tip whose moment it is shows. Things you must do now come
// first, then explanations of what just happened (those wait until you're not mid-move).
// `where`: 'dock' floats above the deeds; 'sheet' renders inside the open decision sheet.
export const TIPS = [
  {
    id: 'charter', where: 'sheet', when: (c) => c.mine && c.phase === 'found',
    title: 'Charter a company',
    body: 'Your deed joined loose plots, so they become a company. Pick any one: you get a free founder share, and its price rises as it grows.',
  },
  {
    id: 'survivor', where: 'sheet', when: (c) => c.mine && c.phase === 'survivor',
    title: 'You choose who survives',
    body: 'The companies are tied in size, so you decide which one buys out the other.',
  },
  {
    id: 'settle', where: 'sheet', when: (c) => c.mine && c.phase === 'dispose',
    title: 'Settle your shares',
    body: 'Sell them now at the old price, swap two for one into the buyer, or hold them in case the company is chartered again.',
  },
  {
    id: 'bell', where: 'dock', when: (c) => c.mine && c.phase === 'buy' && c.canBell,
    title: 'You can end the game',
    body: 'A company is big enough to ring the closing bell. If you\'re ahead, ring it: everything is cashed out and the most cash wins.',
  },
  {
    id: 'build', where: 'dock', when: (c) => c.mine && c.phase === 'place',
    title: 'Your move: build a deed',
    body: 'Your deeds are outlined in gold on the map and listed below. Tap one to see what it would do, then press Build.',
  },
  {
    id: 'invest', where: 'dock', when: (c) => c.mine && c.phase === 'buy',
    title: 'Invest',
    body: `Buy up to ${MAX_BUY} shares in companies on the map, or pass. Shares pay off when their company is bought out, and companies of ${TRUST_SIZE}+ plots become trusts that can't be.`,
  },
  {
    id: 'buyout', where: 'dock', when: (c) => c.sawBuyout && !c.mine && !c.event,
    title: 'That was a buyout',
    body: 'The bigger company absorbed the smaller one, and its biggest shareholders were paid 10× and 5× the share price. Holding the most shares in a company about to be bought out is how fortunes are made.',
  },
  {
    id: 'chartered', where: 'dock', when: (c) => c.sawCharter && !c.mine && !c.event,
    title: 'A company was chartered',
    body: 'Building next to a loose plot starts a company, and the builder gets a free share. New companies are cheap: buying early is how you end up the biggest holder when it\'s bought out.',
  },
  {
    id: 'waiting', where: 'dock', when: (c) => !c.mine && !c.over && !c.cover && !c.event,
    title: 'Rivals are playing',
    body: 'The Exchange shows the companies, their prices and the shares left in the bank; flip to the map with the switch up top. A telegram drops in after each rival\'s turn.',
  },
];

export function useTutor(ctx) {
  const [store, setStore] = useState(null); // { seen: {id: true}, off: bool } once loaded
  useEffect(() => { loadTutor().then(setStore); }, []);
  const update = (next) => { setStore(next); saveTutor(next); };

  const tip = store && !store.off ? TIPS.find((t) => !store.seen[t.id] && t.when(ctx)) || null : null;

  // Acting on a tip counts as seeing it: when a shown tip's moment passes, retire it.
  const shown = useRef(null);
  useEffect(() => {
    const was = shown.current;
    shown.current = tip ? tip.id : null;
    if (was && was !== shown.current && store && !store.seen[was]) update({ ...store, seen: { ...store.seen, [was]: true } });
  }, [tip ? tip.id : null]);

  return {
    tip,
    off: !!store?.off,
    dismiss: () => tip && update({ ...store, seen: { ...store.seen, [tip.id]: true } }),
    turnOff: () => update({ ...store, off: true }),
    replay: () => update({ seen: {}, off: false }),
  };
}

export function TipCard({ tip, onDismiss, onTurnOff, style }) {
  const th = useTheme();
  if (!tip) return null;
  return (
    <View
      accessibilityRole="alert"
      style={[{
        backgroundColor: th.raised, borderWidth: 1, borderColor: th.accent, padding: 12, gap: 6,
        shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8,
      }, style]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Lightbulb size={16} color={th.accent} strokeWidth={1.8} />
        <T style={{ fontFamily: FONTS.engraved, fontSize: 11, letterSpacing: 1.6, color: th.accent }}>FIRST-GAME TIP</T>
      </View>
      <T v="strong">{tip.title}</T>
      <T v="small" color={th.inkSoft} style={{ fontSize: 13, lineHeight: 18 }}>{tip.body}</T>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 2 }}>
        <Button title="Turn off tips" kind="ghost" compact onPress={onTurnOff} />
        <Button title="Got it" kind="iron" compact onPress={onDismiss} />
      </View>
    </View>
  );
}
