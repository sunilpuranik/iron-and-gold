// "How to play": the rules on one scrolling sheet, short enough to read before a first game.
// Numbers come from the game itself (src/game), so the sheet can't drift from the rules.
import { View } from 'react-native';
import { useTheme } from '../../theme/theme';
import { Button, Money, Rule, T } from '../../theme/ui';
import { FONTS } from '../../theme/tokens';
import {
  END_SIZE, HAND_SIZE, MAX_BUY, START_CASH, TIER_NAMES, TRUST_SIZE,
} from '../../game/data';
import { price } from '../../game/rules';
import CompanyMark from '../CompanyMark';
import Sheet from './Sheet';

// A 3×3 patch of the map. '.' empty lot · 'x' surveyed (loose) plot · '*' the deed you build ·
// any other letter is a company id's first letter mapped through `cos`.
function Patch({ rows, cos = {}, caption }) {
  const th = useTheme();
  const d = th.districts.main;
  const S = 18;
  return (
    <View style={{ alignItems: 'center', gap: 6, width: 86 }}>
      <View style={{ gap: 2 }}>
        {rows.map((row, r) => (
          <View key={r} style={{ flexDirection: 'row', gap: 2 }}>
            {row.split('').map((ch, c) => {
              const co = cos[ch] ? th.companies[cos[ch]] : null;
              let bg = d.wash;
              if (ch === 'x') bg = d.tint;
              if (co) bg = co.fill;
              if (ch === '*') bg = th.gold.leaf;
              return (
                <View
                  key={c}
                  style={{
                    width: S, height: S, backgroundColor: bg,
                    borderWidth: ch === '*' ? 2 : 1, borderColor: ch === '*' ? th.gold.shine : th.rule,
                  }}
                />
              );
            })}
          </View>
        ))}
      </View>
      <T v="small" color={th.inkSoft} style={{ textAlign: 'center' }}>{caption}</T>
    </View>
  );
}

function Section({ n, title, children }) {
  const th = useTheme();
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
        <T style={{ fontFamily: FONTS.money, fontSize: 18, color: th.accent }}>{n}</T>
        <T v="title">{title}</T>
      </View>
      {children}
    </View>
  );
}

const Step = ({ k, children }) => {
  const th = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
      <View style={{ width: 22, height: 22, borderWidth: 1, borderColor: th.accent, alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
        <T style={{ fontFamily: FONTS.money, fontSize: 12, color: th.accent }}>{k}</T>
      </View>
      <T v="body" style={{ flex: 1 }}>{children}</T>
    </View>
  );
};

// Share price by company size and tier, from rules.price().
const BRACKETS = [['2', 2], ['3', 3], ['4', 4], ['5', 5], ['6–10', 6], ['11–20', 11], ['21–30', 21], ['31–40', 31], ['41+', 41]];
const TIER_EXAMPLE = ['cw', 'pw', 'ft'];

function PriceChart() {
  const th = useTheme();
  const cell = { flex: 1, paddingVertical: 4, alignItems: 'center' };
  return (
    <View style={{ borderWidth: 1, borderColor: th.rule }}>
      <View style={{ flexDirection: 'row', backgroundColor: th.plate, borderBottomWidth: 1, borderColor: th.rule }}>
        <View style={[cell, { justifyContent: 'flex-end' }]}><T v="plate" style={{ fontSize: 10, letterSpacing: 1 }}>Plots</T></View>
        {TIER_NAMES.map((t, i) => (
          <View key={t} style={[cell, { gap: 3 }]}>
            <CompanyMark id={TIER_EXAMPLE[i]} size={14} />
            <T v="plate" style={{ fontSize: 10, letterSpacing: 1 }}>{t}</T>
          </View>
        ))}
      </View>
      {BRACKETS.map(([label, size], r) => (
        <View key={label} style={{ flexDirection: 'row', borderTopWidth: r ? 1 : 0, borderColor: th.rule, backgroundColor: size >= TRUST_SIZE ? th.plate : 'transparent' }}>
          <View style={cell}><T v="small">{label}</T></View>
          {TIER_EXAMPLE.map((co) => <View key={co} style={cell}><Money amount={price(co, size)} v="small" /></View>)}
        </View>
      ))}
    </View>
  );
}

export default function RulesSheet({
  visible, onClose, tipsOff, onReplayTips,
}) {
  const th = useTheme();
  return (
    <Sheet
      visible={visible}
      title="How to play"
      subtitle="Frontier rail town, 1881 · about two minutes"
      onClose={onClose}
      footer={onReplayTips ? (
        <Button
          title={tipsOff ? 'Turn first-game tips back on' : 'Replay first-game tips'}
          kind="ghost"
          onPress={onReplayTips}
        />
      ) : null}
    >
      <Section n="I" title="The goal">
        <T v="body">
          Build the town, charter companies and buy their shares. When the closing bell rings, the tycoon with the
          most <T v="strong" color={th.money}>cash</T> wins. Everyone starts with <Money amount={START_CASH} v="body" /> and {HAND_SIZE} deeds.
        </T>
      </Section>

      <Rule kind="hair" />
      <Section n="II" title="Your turn">
        <Step k="1"><T v="strong">Build</T> one of your deeds onto the map. Your deeds are the plots outlined in gold.</Step>
        <Step k="2"><T v="strong">Invest</T>: buy up to {MAX_BUY} shares in companies on the map, or pass.</Step>
        <Step k="3"><T v="strong">Draw</T> back up to {HAND_SIZE} deeds. That happens on its own.</Step>
      </Section>

      <Rule kind="hair" />
      <Section n="III" title="What a deed does">
        <T v="body" color={th.inkSoft}>It depends on what it touches (up, down, left, right):</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 }}>
          <Patch rows={['...', '.*.', '...']} caption="Touches nothing: a surveyed plot" />
          <Patch rows={['...', 'x*.', '...']} caption="Touches loose plots: charter a company" />
          <Patch rows={['pp.', 'p*.', '...']} cos={{ p: 'pw' }} caption="Touches one company: it grows" />
          <Patch rows={['pp.', 'p*w', '..w']} cos={{ p: 'pw', w: 'cw' }} caption="Touches two: a buyout" />
        </View>
        <T v="body">
          Chartering lets you pick any company not yet on the map, and you get <T v="strong">one free founder share</T>.
        </T>
      </Section>

      <Rule kind="hair" />
      <Section n="IV" title="Buyouts: where fortunes are made">
        <T v="body">
          The bigger company buys out the smaller (on a tie, the builder chooses). Before it disappears, the smaller
          company pays its shareholders:
        </T>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1, borderWidth: 1, borderColor: th.rule, padding: 8, alignItems: 'center' }}>
            <T style={{ fontFamily: FONTS.money, fontSize: 20, color: th.money }}>10×</T>
            <T v="small" color={th.inkSoft} style={{ textAlign: 'center' }}>share price to the biggest holder</T>
          </View>
          <View style={{ flex: 1, borderWidth: 1, borderColor: th.rule, padding: 8, alignItems: 'center' }}>
            <T style={{ fontFamily: FONTS.money, fontSize: 20, color: th.money }}>5×</T>
            <T v="small" color={th.inkSoft} style={{ textAlign: 'center' }}>to the second biggest</T>
          </View>
        </View>
        <T v="body">
          Ties split the bonus; a lone holder takes both. Then everyone holding its shares chooses to <T v="strong">sell</T> them,
          <T v="strong"> swap 2-for-1</T> into the buyer, or <T v="strong">hold</T> them in case it's chartered again.
        </T>
      </Section>

      <Rule kind="hair" />
      <Section n="V" title="Share prices">
        <T v="body">Bigger companies cost more, and some industries are pricier than others:</T>
        <PriceChart />
      </Section>

      <Rule kind="hair" />
      <Section n="VI" title="Trusts">
        <T v="body">
          A company with {TRUST_SIZE}+ plots is a <T v="strong">trust</T> (gilt outline on the map). Trusts can't be bought out.
          A deed that would join two trusts is dead and gets swapped for a new one.
        </T>
      </Section>

      <Rule kind="hair" />
      <Section n="VII" title="The closing bell">
        <T v="body">
          On your invest step you may ring the bell once any company reaches {END_SIZE} plots, or every company on the
          map is a trust. Final bonuses are paid for every company, all shares are sold at their price, and the most
          cash wins.
        </T>
      </Section>
    </Sheet>
  );
}
