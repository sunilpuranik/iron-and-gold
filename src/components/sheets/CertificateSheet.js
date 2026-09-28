// Share certificate for a company, plus its share register (who holds what).
import { Pressable, ScrollView, View } from 'react-native';
import { useTheme } from '../../theme/theme';
import { Money, Rule, T } from '../../theme/ui';
import { FONTS } from '../../theme/tokens';
import { COMPANY_IDS, company } from '../../game/data';
import { bonusesFor, price, sizes } from '../../game/engine';
import Certificate from '../Certificate';
import CompanyMark from '../CompanyMark';
import Portrait from '../Portrait';
import Sheet from './Sheet';
import { feel } from '../../feel/feel';

const MARK = 40;

function Register({ state, id }) {
  const th = useTheme();
  const sz = sizes(state)[id];
  const holders = state.players
    .map((p, seat) => ({ p, seat, n: p.shares[id] }))
    .filter((h) => h.n > 0)
    .sort((a, b) => b.n - a.n);
  const bonus = {};
  if (sz >= 2) for (const b of bonusesFor(state, id, price(id, sz))) bonus[b.seat] = b;
  return (
    <View style={{ gap: 6 }}>
      <T v="plate" color={th.accent}>Holders</T>
      <Rule kind="gilt" />
      {holders.map((h) => (
        <View key={h.p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, borderBottomWidth: 1, borderColor: th.rule }}>
          <Portrait index={h.p.avatar} bot={h.p.bot} size={30} />
          <View style={{ flex: 1 }}>
            <T v="strong">{h.p.name}</T>
            {bonus[h.seat] && (
              <T v="small" color={th.inkSoft}>
                {bonus[h.seat].kind} · would take <Money amount={bonus[h.seat].amount} v="small" /> in a buyout
              </T>
            )}
          </View>
          <T style={{ fontFamily: FONTS.money, fontSize: 16 }}>{h.n}</T>
        </View>
      ))}
      {!holders.length && <T v="small" color={th.inkSoft}>No tycoon holds shares yet.</T>}
      <T v="small" color={th.inkSoft}>The bank holds {state.bank[id]} of 25.</T>
    </View>
  );
}

export default function CertificateSheet({
  visible, state, id, me, mySeat, onPick, onClose,
}) {
  const th = useTheme();
  if (!visible || !id) return null;
  const shares = me ? me.shares[id] : 0;
  return (
    <Sheet visible title="Share register" subtitle={company(id).name} onClose={onClose}>
      <View
        style={{
          borderWidth: 1, borderColor: th.gold.leaf,
          shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 20, shadowOffset: { width: 0, height: 20 }, elevation: 10,
        }}
      >
        <Certificate
          id={id}
          state={state}
          owner={me ? me.name : ''}
          shares={shares}
          number={(COMPANY_IDS.indexOf(id) + 1) * 100 + Math.max(0, mySeat) + 1}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 6, paddingHorizontal: 2 }}>
        {COMPANY_IDS.map((c) => {
          const on = c === id;
          return (
            <Pressable
              key={c}
              accessibilityLabel={`${company(c).name} certificate`}
              accessibilityState={{ selected: on }}
              onPress={() => { if (!on) feel.select(); onPick(c); }}
              style={{
                width: MARK + 4, height: MARK + 4, alignItems: 'center', justifyContent: 'center',
                borderWidth: 2, borderColor: on ? th.selection : 'transparent',
                shadowColor: th.selection, shadowOpacity: on ? 0.45 : 0, shadowRadius: 6, shadowOffset: { width: 0, height: 0 },
              }}
            >
              <CompanyMark id={c} size={MARK} />
            </Pressable>
          );
        })}
      </ScrollView>
      <Register state={state} id={id} />
    </Sheet>
  );
}
