import { useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme/theme';
import { Button, Money, Stepper, T } from '../../theme/ui';
import { MAX_BUY, company } from '../../game/data';
import { activeCompanies, price, sizes } from '../../game/engine';
import CompanyIcon from '../CompanyIcon';
import Sheet from './Sheet';

function Invest({ state, me, onBuy }) {
  const th = useTheme();
  const sz = sizes(state);
  const active = activeCompanies(state);
  const [cart, setCart] = useState({});
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const cost = active.reduce((a, c) => a + (cart[c] || 0) * price(c, sz[c]), 0);
  const after = me.cash - cost;

  if (!active.length) {
    return (
      <>
        <T v="accent" color={th.inkSoft}>No companies are chartered yet — nothing to buy.</T>
        <Button title="End turn" onPress={() => onBuy({})} />
      </>
    );
  }

  return (
    <>
      {active.map((c) => {
        const p = price(c, sz[c]);
        const n = cart[c] || 0;
        const max = Math.min(state.bank[c], n + (MAX_BUY - count), n + Math.floor(after / p));
        return (
          <View key={c} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48 }}>
            <CompanyIcon id={c} size={32} />
            <View style={{ flex: 1 }}>
              <T v="strong" numberOfLines={1}>{company(c).short}</T>
              <T v="small" color={th.inkSoft}>
                <Money amount={p} v="small" /> · bank {state.bank[c]} · you {me.shares[c]}
              </T>
            </View>
            <Stepper label={company(c).short} value={n} max={max} onChange={(v) => setCart({ ...cart, [c]: v })} />
          </View>
        );
      })}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 4 }}>
        <T v="body" color={th.inkSoft}>{count} of {MAX_BUY} shares · cost <Money amount={cost} v="body" /></T>
        <T v="body" color={th.inkSoft}>Cash after <Money amount={after} v="title" /></T>
      </View>
      <Button title={count ? `Buy ${count} share${count > 1 ? 's' : ''} & end turn` : 'Buy nothing & end turn'} onPress={() => onBuy(cart)} />
    </>
  );
}

export default function InvestSheet({ visible, state, me, onBuy, onClose }) {
  if (state.phase !== 'buy' || !me) return null;
  return (
    <Sheet visible={visible} title="Invest" subtitle="Buy up to 3 shares among chartered companies" onClose={onClose}>
      <Invest key={state.seq} state={state} me={me} onBuy={onBuy} />
    </Sheet>
  );
}
