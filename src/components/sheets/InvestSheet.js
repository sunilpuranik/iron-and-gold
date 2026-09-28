import { Fragment, useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme/theme';
import {
  Button, Money, Rule, Stepper, T,
} from '../../theme/ui';
import { MAX_BUY, company } from '../../game/data';
import {
  activeCompanies, isTrust, price, sizes,
} from '../../game/engine';
import CompanyMark from '../CompanyMark';
import Sheet from './Sheet';

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five'];

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
      {active.map((c, i) => {
        const p = price(c, sz[c]);
        const n = cart[c] || 0;
        const max = Math.min(state.bank[c], n + (MAX_BUY - count), n + Math.floor(after / p));
        return (
          <Fragment key={c}>
            {i > 0 && <Rule />}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 }}>
              <CompanyMark id={c} size={40} />
              <View style={{ flex: 1 }}>
                <T v="strong" numberOfLines={1} style={{ fontSize: 14 }}>{company(c).short}</T>
                <T v="small" color={th.inkSoft}>
                  {sz[c]} plots · {isTrust(sz[c]) ? <T v="small" color={th.money}>trust</T> : `bank ${state.bank[c]}`}
                  {me.shares[c] ? ` · you ${me.shares[c]}` : ''}
                </T>
              </View>
              <Money amount={p} size={15} />
              <Stepper label={company(c).short} value={n} max={max} onChange={(v) => setCart({ ...cart, [c]: v })} />
            </View>
          </Fragment>
        );
      })}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6 }}>
        <View>
          <T v="label" color={th.inkSoft}>Cash after</T>
          <Money amount={after} v="title" />
        </View>
        {count > 0 && <Money amount={cost} v="ingot" size={18} />}
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button title="Pass" kind="iron" onPress={() => onBuy({})} style={{ width: 104 }} />
        <Button
          title={count ? `Buy ${count} share${count > 1 ? 's' : ''}` : 'Choose shares'}
          disabled={!count}
          onPress={() => onBuy(cart)}
          style={{ flex: 1 }}
        />
      </View>
    </>
  );
}

export default function InvestSheet({ visible, state, me, onBuy, onClose }) {
  if (state.phase !== 'buy' || !me) return null;
  return (
    <Sheet visible={visible} title="Buy shares" subtitle={`Up to ${WORDS[MAX_BUY] || MAX_BUY} this turn`} onClose={onClose}>
      <Invest key={state.seq} state={state} me={me} onBuy={onBuy} />
    </Sheet>
  );
}
