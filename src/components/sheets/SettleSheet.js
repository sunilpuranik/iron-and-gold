import { useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme/theme';
import { Button, Money, Stepper, T } from '../../theme/ui';
import { company } from '../../game/data';
import CompanyMark from '../CompanyMark';
import Sheet from './Sheet';

function Row({ label, hint, children }) {
  const th = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48 }}>
      <View style={{ flex: 1 }}>
        <T v="strong">{label}</T>
        <T v="small" color={th.inkSoft}>{hint}</T>
      </View>
      {children}
    </View>
  );
}

function Settle({ state, me, onSettle }) {
  const th = useTheme();
  const { co } = state.pending.queue[0];
  const surv = state.pending.survivor;
  const held = me.shares[co];
  const info = state.pending.absorbed.find((a) => a.co === co);
  const bankRoom = state.bank[surv] * 2;
  const [sell, setSell] = useState(0);
  const [swap, setSwap] = useState(() => Math.min(Math.floor(held / 2) * 2, bankRoom));
  const hold = held - sell - swap;
  const maxSwap = Math.min(Math.floor((held - sell) / 2) * 2, bankRoom);

  const seg = (n, color, border) => (n > 0 ? (
    <View style={{ flex: n, backgroundColor: color, borderRightWidth: border ? 1 : 0, borderColor: th.ink }} />
  ) : null);

  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <CompanyMark id={co} size={36} />
        <View style={{ flex: 1 }}>
          <T v="strong">{company(co).name}</T>
          <T v="small" color={th.inkSoft}>You hold {held} · absorbed at <Money amount={info.price} v="small" /> a share</T>
        </View>
      </View>
      <View style={{ flexDirection: 'row', height: 14, borderWidth: 1, borderColor: th.ink }}>
        {seg(sell, th.gilt, swap + hold > 0)}
        {seg(swap, th.dark ? th.companies[surv].fill : th.companies[surv].ink, hold > 0)}
        {seg(hold, th.rule, false)}
      </View>
      <Row label={`Sell ${sell}`} hint={<>for <Money amount={sell * info.price} v="small" /></>}>
        <Stepper label="sell" value={sell} max={held - swap} onChange={setSell} />
      </Row>
      <Row label={`Swap ${swap}`} hint={`2-for-1 into ${company(surv).short} → ${swap / 2} shares (bank ${state.bank[surv]})`}>
        <Stepper label="swap" value={swap} max={maxSwap} step={2} onChange={setSwap} />
      </Row>
      <Row label={`Hold ${hold}`} hint={`Keep ${company(co).short} in case it is chartered again`} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button title="Sell all" kind="ghost" compact onPress={() => { setSwap(0); setSell(held); }} style={{ flex: 1 }} />
        <Button
          title="Swap max"
          kind="ghost"
          compact
          onPress={() => {
            const s = Math.min(Math.floor(held / 2) * 2, bankRoom);
            setSwap(s);
            setSell(held - s);
          }}
          style={{ flex: 1 }}
        />
      </View>
      <Button title="Settle shares" onPress={() => onSettle({ sell, trade: swap })} />
    </>
  );
}

export default function SettleSheet({ visible, state, me, onSettle, onClose }) {
  if (state.phase !== 'dispose' || !me) return null;
  const q = state.pending.queue;
  return (
    <Sheet
      visible={visible}
      title="Settle shares"
      subtitle={`Buyout by ${company(state.pending.survivor).name}`}
      onClose={onClose}
    >
      <Settle key={`${state.seq}-${q.length}`} state={state} me={me} onSettle={onSettle} />
    </Sheet>
  );
}
