// Share certificate for a company, plus its share register (who holds what).
import { Pressable, View } from 'react-native';
import { useTheme } from '../../theme/theme';
import { Money, T } from '../../theme/ui';
import { MIN_TARGET } from '../../theme/tokens';
import { COMPANY_IDS, company } from '../../game/data';
import { bonusesFor, price, sizes } from '../../game/engine';
import Certificate from '../Certificate';
import CompanyIcon from '../CompanyIcon';
import Avatar from '../Avatar';
import Sheet from './Sheet';
import { feel } from '../../feel/feel';

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
      <T v="plate" style={{ fontSize: 13 }}>Share register</T>
      {holders.map((h) => (
        <View key={h.p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 40, borderBottomWidth: 1, borderColor: th.rule }}>
          <Avatar index={h.p.avatar} bot={h.p.bot} size={30} />
          <View style={{ flex: 1 }}>
            <T v="strong">{h.p.name}</T>
            {bonus[h.seat] && (
              <T v="small" color={th.inkSoft}>
                {bonus[h.seat].kind} · would take <Money amount={bonus[h.seat].amount} v="small" /> in a buyout
              </T>
            )}
          </View>
          <T style={{ fontFamily: 'Cinzel_700Bold', fontSize: 16 }}>{h.n}</T>
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
    <Sheet visible title="Share certificate" subtitle={company(id).name} onClose={onClose}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {COMPANY_IDS.map((c) => (
          <Pressable
            key={c}
            accessibilityLabel={`${company(c).name} certificate`}
            onPress={() => { feel.select(); onPick(c); }}
            style={{
              minWidth: MIN_TARGET, minHeight: MIN_TARGET, alignItems: 'center', justifyContent: 'center',
              borderBottomWidth: 3, borderColor: c === id ? th.gilt : 'transparent',
            }}
          >
            <CompanyIcon id={c} size={30} />
          </Pressable>
        ))}
      </View>
      <Certificate
        id={id}
        state={state}
        owner={me ? me.name : ''}
        shares={shares}
        number={(COMPANY_IDS.indexOf(id) + 1) * 100 + Math.max(0, mySeat) + 1}
      />
      <Register state={state} id={id} />
    </Sheet>
  );
}
