// The Exchange: who is acting, the companies on the table and the latest moves. Like the board game,
// it shows the facts and leaves the sums (standings, net worth, buyout bonuses) to the players.
// Shown in place of the map while other tycoons play; toggled with the Map / Exchange switch.
import { Pressable, ScrollView, View } from 'react-native';
import { Bell, Newspaper } from 'lucide-react-native';
import { useTheme } from '../../theme/theme';
import {
  Button, Money, Rule, T,
} from '../../theme/ui';
import { END_SIZE, TRUST_SIZE, company } from '../../game/data';
import {
  actorOf, activeCompanies, canClose, isTrust, price, sizes,
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
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <T v="plate" color={th.accent}>{title}</T>
          {right}
        </View>
        <Rule kind="gilt" />
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

// The companies as they stand on the table: size, share price (the price chart), the bank's stack and
// yours. Who leads, who holds the majority and what anyone is worth is left for the players to work out.
function Companies({ state, me, onCertificate }) {
  const th = useTheme();
  const sz = sizes(state);
  const active = activeCompanies(state).sort((a, b) => sz[b] - sz[a]);
  const idle = 7 - active.length;
  return (
    <Section
      title="THE COMPANIES"
      right={canClose(state) ? <T style={{ fontFamily: FONTS.money, fontSize: 11, color: th.money, letterSpacing: 1 }}>BELL MAY RING</T> : null}
    >
      {active.map((id) => {
        const fill = th.dark ? th.companies[id].fill : th.companies[id].ink;
        return (
          <Pressable
            key={id}
            onPress={() => onCertificate(id)}
            accessibilityLabel={`${company(id).name}, ${sz[id]} plots. Open share certificate.`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 }}
          >
            <CompanyMark id={id} size={28} />
            <View style={{ flex: 1, gap: 3 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <T v="strong" numberOfLines={1}>
                  {company(id).short}
                  {isTrust(sz[id]) ? <T v="small" color={th.accent}>  ◆ trust</T> : null}
                </T>
                <T v="small" color={th.inkSoft}>{sz[id]} plots</T>
              </View>
              <View>
                <Bar total={END_SIZE} parts={[{ value: sz[id], color: fill }]} height={9} />
                <View style={{ position: 'absolute', left: `${(TRUST_SIZE / END_SIZE) * 100}%`, top: -2, bottom: -2, width: 2, backgroundColor: th.accent }} />
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', minWidth: 64 }}>
              <Money amount={price(id, sz[id])} v="body" />
              <T v="small" color={th.inkSoft}>bank {state.bank[id]}{me ? ` · you ${me.shares[id]}` : ''}</T>
            </View>
          </Pressable>
        );
      })}
      {!active.length && <T v="small" color={th.inkSoft}>No company has been chartered yet.</T>}
      <T v="small" color={th.inkSoft}>
        {idle} of 7 charters unclaimed. Gold mark = trust at {TRUST_SIZE} plots. Tap a company for its certificate.
      </T>
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
      <Companies state={state} me={showMine ? state.players[mySeat] : null} onCertificate={onCertificate} />
      <Latest state={state} onTicker={onTicker} />
    </ScrollView>
  );
}
