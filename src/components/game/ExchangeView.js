// The Exchange: who is acting, standings, the company race, the closing bell and your position.
// Shown in place of the map while other tycoons play; toggled with the Map / Exchange switch.
import { Pressable, ScrollView, View } from 'react-native';
import { Bell, Crown, Newspaper } from 'lucide-react-native';
import { useTheme } from '../../theme/theme';
import { Button, Money, T } from '../../theme/ui';
import { END_SIZE, TRUST_SIZE, company } from '../../game/data';
import {
  actorOf, activeCompanies, bonusesFor, canClose, isTrust, netWorth, price, sizes,
} from '../../game/engine';
import { FONTS } from '../../theme/tokens';
import { describeTurn } from '../../game/recap';
import Portrait from '../Portrait';
import CompanyMark from '../CompanyMark';
import Dispatch from './Dispatch';

const DOING = {
  place: 'is building…',
  found: 'is chartering a company…',
  survivor: 'is choosing a survivor…',
  dispose: 'is settling shares…',
  buy: 'is investing…',
};
const MINE = {
  place: 'Build a deed',
  found: 'Charter a company',
  survivor: 'Choose the surviving company',
  dispose: 'Settle your shares',
  buy: 'Invest — up to 3 shares',
};

function Section({ title, right, children }) {
  const th = useTheme();
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <T style={{ fontFamily: FONTS.engraved, fontSize: 12, letterSpacing: 1.6, color: th.ink }}>{title}</T>
        <View style={{ flex: 1, height: 1, backgroundColor: th.rule }} />
        {right}
      </View>
      {children}
    </View>
  );
}

function Bar({ parts, total, height = 10 }) {
  const th = useTheme();
  return (
    <View style={{ flexDirection: 'row', height, backgroundColor: th.raised, borderWidth: 1, borderColor: th.rule, overflow: 'hidden' }}>
      {parts.map((p, i) => (p.value > 0 ? (
        <View key={i} style={{ width: `${Math.min(100, (p.value / total) * 100)}%`, backgroundColor: p.color }} />
      ) : null))}
    </View>
  );
}

function NowCard({ state, mySeat, mine, onMap }) {
  const th = useTheme();
  const over = state.phase === 'over';
  const seat = over ? -1 : actorOf(state);
  const p = seat >= 0 ? state.players[seat] : null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: th.plate, borderWidth: 1, borderColor: th.rule }}>
      {p ? <Portrait index={p.avatar} bot={p.bot} size={56} ring={mine} /> : <Bell size={40} color={th.accent} strokeWidth={1.5} />}
      <View style={{ flex: 1 }}>
        {p ? (
          <>
            <T v="title" numberOfLines={1}>{mine ? 'Your turn' : p.name}</T>
            <T v="accent" color={th.inkSoft}>{mine ? MINE[state.phase] : DOING[state.phase]}</T>
          </>
        ) : <T v="title" color={th.money}>The closing bell has rung</T>}
        {mine && <Button title="Back to the map" kind="iron" compact onPress={onMap} style={{ marginTop: 8, alignSelf: 'flex-start' }} />}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <T style={{ fontFamily: FONTS.money, fontSize: 11, letterSpacing: 1.4, color: th.inkSoft }}>TURN</T>
        <T style={{ fontFamily: FONTS.money, fontSize: 24 }}>{state.turnNo}</T>
        <T v="small" color={th.inkSoft}>{state.pool.length} deeds left</T>
      </View>
    </View>
  );
}

function Standings({ state, mySeat }) {
  const th = useTheme();
  const sz = sizes(state);
  const rows = state.players.map((p, seat) => {
    const worth = netWorth(state, seat);
    return {
      p, seat, worth, cash: p.cash, stock: worth - p.cash,
    };
  }).sort((a, b) => b.worth - a.worth);
  const top = Math.max(1, rows[0].worth);
  return (
    <Section
      title="STANDINGS"
      right={(
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <View style={{ width: 8, height: 8, backgroundColor: th.money }} /><T v="small" color={th.inkSoft}>cash</T>
          <View style={{ width: 8, height: 8, backgroundColor: th.iron.mid }} /><T v="small" color={th.inkSoft}>shares</T>
        </View>
      )}
    >
      {rows.map((r, i) => (
        <View key={r.p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <T style={{ fontFamily: FONTS.money, fontSize: 15, width: 16, textAlign: 'center' }}>{i + 1}</T>
          <Portrait index={r.p.avatar} bot={r.p.bot} size={30} ring={i === 0} />
          <View style={{ flex: 1, gap: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <T v="strong" numberOfLines={1} style={{ flexShrink: 1 }}>{r.p.name}{r.seat === mySeat ? ' (you)' : ''}</T>
              {i === 0 && <Crown size={13} color={th.accent} strokeWidth={1.75} />}
            </View>
            <Bar total={top} parts={[{ value: r.cash, color: th.money }, { value: r.stock, color: th.iron.mid }]} />
          </View>
          <Money amount={r.worth} v="body" />
        </View>
      ))}
      <T v="small" color={th.inkSoft}>Net worth: cash plus shares at today's prices{Object.values(sz).some((n) => n >= 2) ? '' : ' (no companies yet)'}.</T>
    </Section>
  );
}

function CompanyRace({ state, onCertificate }) {
  const th = useTheme();
  const sz = sizes(state);
  const active = activeCompanies(state).sort((a, b) => sz[b] - sz[a]);
  const idle = 7 - active.length;
  return (
    <Section title="THE COMPANY RACE">
      {active.map((id) => {
        const holders = bonusesFor(state, id, price(id, sz[id]));
        const maj = holders.find((b) => b.kind === 'majority' || b.kind === 'sole' || b.kind === 'tied majority');
        const majP = maj ? state.players[maj.seat] : null;
        const fill = th.dark ? th.companies[id].fill : th.companies[id].ink;
        return (
          <Pressable
            key={id}
            onPress={() => onCertificate(id)}
            accessibilityLabel={`${company(id).name}, ${sz[id]} plots. Open share certificate.`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 40 }}
          >
            <CompanyMark id={id} size={28} />
            <View style={{ flex: 1, gap: 3 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <T v="strong" numberOfLines={1}>
                  {company(id).short}
                  {isTrust(sz[id]) ? <T v="small" color={th.accent}>  ◆ trust</T> : null}
                </T>
                <T v="small" color={th.inkSoft}>{sz[id]} / {END_SIZE} plots</T>
              </View>
              <View>
                <Bar total={END_SIZE} parts={[{ value: sz[id], color: fill }]} height={9} />
                <View style={{ position: 'absolute', left: `${(TRUST_SIZE / END_SIZE) * 100}%`, top: -2, bottom: -2, width: 2, backgroundColor: th.accent }} />
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', minWidth: 58 }}>
              <Money amount={price(id, sz[id])} v="body" />
              {majP && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <T v="small" color={th.inkSoft}>maj.</T>
                  <Portrait index={majP.avatar} bot={majP.bot} size={16} />
                </View>
              )}
            </View>
          </Pressable>
        );
      })}
      {!active.length && <T v="small" color={th.inkSoft}>No company has been chartered yet.</T>}
      <T v="small" color={th.inkSoft}>
        Gold mark = trust at {TRUST_SIZE} plots (safe from buyout). {idle} of 7 charters still unclaimed. Tap a company for its certificate.
      </T>
    </Section>
  );
}

function ClosingBell({ state }) {
  const th = useTheme();
  const sz = sizes(state);
  const active = activeCompanies(state);
  const biggest = active.reduce((b, id) => (sz[id] > (b ? sz[b] : 0) ? id : b), null);
  const trusts = active.filter((id) => isTrust(sz[id])).length;
  const ready = canClose(state);
  return (
    <Section title="THE CLOSING BELL" right={ready ? <T style={{ fontFamily: FONTS.money, fontSize: 11, color: th.money, letterSpacing: 1 }}>MAY RING</T> : null}>
      <Bar total={END_SIZE} parts={[{ value: biggest ? sz[biggest] : 0, color: th.accent }]} height={12} />
      <T v="small" color={th.inkSoft}>
        {biggest ? `Largest: ${company(biggest).short} at ${sz[biggest]} of ${END_SIZE} plots. ` : ''}
        {active.length ? `${trusts} of ${active.length} active companies are trusts.` : ''}
        {' '}
        {ready ? 'Any tycoon may now end the game on their buy step.' : 'The bell may ring at 41 plots, or once every company is a trust.'}
      </T>
    </Section>
  );
}

function YourPosition({ state, mySeat }) {
  const th = useTheme();
  const me = state.players[mySeat];
  const sz = sizes(state);
  const worth = netWorth(state, mySeat);
  const rank = state.players.filter((_, i) => netWorth(state, i) > worth).length + 1;
  const stakes = activeCompanies(state).map((id) => {
    const b = bonusesFor(state, id, price(id, sz[id])).find((x) => x.seat === mySeat);
    return b ? { id, ...b } : null;
  }).filter(Boolean);
  const Cell = ({ label, children }) => (
    <View style={{ flex: 1, alignItems: 'center', paddingVertical: 6, borderWidth: 1, borderColor: th.rule, backgroundColor: th.raised }}>
      {children}
      <T style={{ fontFamily: FONTS.engraved, fontSize: 9, letterSpacing: 1.2, color: th.inkSoft }}>{label}</T>
    </View>
  );
  return (
    <Section title="YOUR POSITION">
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <Cell label="CASH"><Money amount={me.cash} v="body" /></Cell>
        <Cell label="SHARES"><Money amount={worth - me.cash} v="body" /></Cell>
        <Cell label="NET WORTH"><Money amount={worth} v="body" /></Cell>
        <Cell label="RANK"><T style={{ fontFamily: FONTS.money, fontSize: 14 }}>{rank} of {state.players.length}</T></Cell>
      </View>
      {stakes.map((s) => (
        <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <CompanyMark id={s.id} size={20} />
          <T v="body" style={{ flex: 1 }}>{company(s.id).short}: {s.kind} holder ({me.shares[s.id]} shares)</T>
          <T v="small" color={th.inkSoft}>bonus </T>
          <Money amount={s.amount} v="body" />
        </View>
      ))}
      {!stakes.length && <T v="small" color={th.inkSoft}>You hold no majority or minority stake yet.</T>}
    </Section>
  );
}

function Latest({ state, onTicker }) {
  const th = useTheme();
  const turns = (state.turns || []).slice(-3).reverse().map((r) => describeTurn(state, r));
  return (
    <Section title="LATEST DISPATCHES">
      {turns.map((d) => (
        <View key={d.turn} style={{ flexDirection: 'row', gap: 10 }}>
          <Portrait index={d.player.avatar} bot={d.player.bot} size={28} />
          <View style={{ flex: 1 }}>
            <T v="strong">{d.player.name} <T v="small" color={th.inkSoft}>· turn {d.turn}</T></T>
            <Dispatch as="lines" dispatch={d} max={3} />
          </View>
        </View>
      ))}
      <Button title="Open the full ticker" kind="ghost" icon={Newspaper} onPress={onTicker} />
    </Section>
  );
}

export default function ExchangeView({
  state, mySeat, mine, showMine, onMap, onCertificate, onTicker,
}) {
  return (
    <ScrollView contentContainerStyle={{ padding: 12, gap: 18 }}>
      <NowCard state={state} mySeat={mySeat} mine={mine} onMap={onMap} />
      <Standings state={state} mySeat={showMine ? mySeat : -1} />
      {showMine && <YourPosition state={state} mySeat={mySeat} />}
      <CompanyRace state={state} onCertificate={onCertificate} />
      <ClosingBell state={state} />
      <Latest state={state} onTicker={onTicker} />
    </ScrollView>
  );
}
