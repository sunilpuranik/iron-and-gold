// Full-screen moment for a new charter or a buyout: a stamp slams down, badges merge,
// the plot count ticks up, coins burst, and a summary of who was paid what.
import { useEffect, useRef, useState } from 'react';
import {
  Animated, Easing, View, useWindowDimensions,
} from 'react-native';
import { ChevronsRight } from 'lucide-react-native';
import { useTheme } from '../../theme/theme';
import { Button, Money, T } from '../../theme/ui';
import { FONTS } from '../../theme/tokens';
import { TIER_NAMES, company } from '../../game/data';
import Portrait from '../Portrait';
import { Border } from '../Certificate';
import { Seal } from '../../theme/brand';
import CompanyMark from '../CompanyMark';
import { feel } from '../../feel/feel';

const BADGE = 52;
const STEP = 60;
const SURV_X = 220;
const ROW_W = SURV_X + BADGE;

function useAnim(delay, config = {}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = config.spring
      ? Animated.spring(v, { toValue: 1, useNativeDriver: true, delay, bounciness: config.bounciness ?? 10, speed: config.speed ?? 12 })
      : Animated.timing(v, {
        toValue: 1, duration: config.duration ?? 450, delay, easing: config.easing ?? Easing.out(Easing.cubic), useNativeDriver: true,
      });
    a.start();
    return () => a.stop();
  }, []);
  return v;
}

function Stamp({ text, color, delay = 150, onLand }) {
  const v = useAnim(delay, { spring: true, bounciness: 6, speed: 14 });
  useEffect(() => {
    const t = setTimeout(() => onLand && onLand(), delay + 180);
    return () => clearTimeout(t);
  }, []);
  return (
    <Animated.View
      style={{
        alignSelf: 'center',
        opacity: v.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1] }),
        transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [2.6, 1] }) }, { rotate: '-3deg' }],
      }}
    >
      <View style={{ borderWidth: 3, borderColor: color, padding: 2 }}>
        <View style={{ borderWidth: 1, borderColor: color, paddingHorizontal: 16, paddingVertical: 4 }}>
          <T style={{ fontFamily: FONTS.money, fontSize: 30, letterSpacing: 4, color }}>{text}</T>
        </View>
      </View>
    </Animated.View>
  );
}

// A burst of gold coins thrown up from the card and falling away.
function Coins({ delay, count = 14 }) {
  const coins = useRef(Array.from({ length: count }, (_, i) => ({
    v: new Animated.Value(0),
    dx: (Math.random() - 0.5) * 320,
    up: 80 + Math.random() * 140,
    size: 10 + Math.random() * 8,
    spin: (Math.random() - 0.5) * 720,
    lag: i * 25,
  }))).current;
  useEffect(() => {
    const anims = coins.map((c) => Animated.timing(c.v, {
      toValue: 1, duration: 1300, delay: delay + c.lag, easing: Easing.linear, useNativeDriver: true,
    }));
    Animated.parallel(anims).start();
    return () => anims.forEach((a) => a.stop());
  }, []);
  return (
    <View style={{ position: 'absolute', left: '50%', top: '38%', pointerEvents: 'none' }}>
      {coins.map((c, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute', width: c.size, height: c.size, borderRadius: c.size / 2,
            backgroundColor: '#E2BE62', borderWidth: 1.5, borderColor: '#8A6421',
            opacity: c.v.interpolate({ inputRange: [0, 0.05, 0.8, 1], outputRange: [0, 1, 1, 0] }),
            transform: [
              { translateX: c.v.interpolate({ inputRange: [0, 1], outputRange: [0, c.dx] }) },
              { translateY: c.v.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, -c.up, 260] }) },
              { rotateY: c.v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${c.spin}deg`] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}

function Stat({ label, children }) {
  const th = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', paddingVertical: 6, borderWidth: 1, borderColor: th.rule }}>
      {children}
      <T style={{ fontFamily: FONTS.engraved, fontSize: 9, letterSpacing: 1.2, color: th.inkSoft, marginTop: 2 }}>{label}</T>
    </View>
  );
}

function FoundBody({ fx, state }) {
  const th = useTheme();
  const c = company(fx.id);
  const d = fx.detail;
  const badge = useAnim(420, { spring: true, bounciness: 14 });
  const seal = useAnim(900, { spring: true, bounciness: 8 });
  const text = useAnim(650);
  const initials = c.name.split(' ').filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).join('').slice(0, 3);
  return (
    <>
      <View style={{ alignItems: 'center', marginTop: 14 }}>
        <Animated.View
          style={{
            transform: [
              { perspective: 600 },
              { rotateX: badge.interpolate({ inputRange: [0, 1], outputRange: ['85deg', '0deg'] }) },
              { scale: badge.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
            ],
          }}
        >
          <CompanyMark raised id={fx.id} size={88} />
        </Animated.View>
        <Animated.View
          style={{
            position: 'absolute', right: 16, top: -8,
            opacity: seal,
            transform: [
              { scale: seal.interpolate({ inputRange: [0, 1], outputRange: [2, 1] }) },
              { rotate: seal.interpolate({ inputRange: [0, 1], outputRange: ['-60deg', '12deg'] }) },
            ],
          }}
        >
          <Seal kind="notary" size={52} label={initials} />
        </Animated.View>
      </View>
      <Animated.View style={{ opacity: text, transform: [{ translateY: text.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
        <T v="display" style={{ textAlign: 'center', marginTop: 10, color: th.dark ? th.ink : th.companies[fx.id].ink }}>
          {c.name}
        </T>
        <T v="accent" color={th.inkSoft} style={{ textAlign: 'center' }}>
          {c.industry} · {TIER_NAMES[c.tier]} · chartered by {state.players[d.seat].name} at {fx.tile}
        </T>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
          <Stat label="PLOTS"><T style={{ fontFamily: FONTS.money, fontSize: 20 }}>{d.size}</T></Stat>
          <Stat label="A SHARE"><Money amount={d.price} v="title" /></Stat>
          <Stat label="TO FOUNDER"><T style={{ fontFamily: FONTS.money, fontSize: 20 }}>{d.founderShare ? 1 : 0}</T></Stat>
        </View>
      </Animated.View>
    </>
  );
}

function Counter({ from, to, delay }) {
  const [n, setN] = useState(from);
  useEffect(() => {
    const v = new Animated.Value(from);
    const id = v.addListener(({ value }) => setN(Math.round(value)));
    const a = Animated.timing(v, {
      toValue: to, duration: 700, delay, easing: Easing.out(Easing.quad), useNativeDriver: false,
    });
    a.start();
    return () => {
      a.stop();
      v.removeListener(id);
    };
  }, []);
  return <T style={{ fontFamily: FONTS.money, fontSize: 26 }}>{n}</T>;
}

function BuyoutBody({ fx, state }) {
  const th = useTheme();
  const d = fx.detail;
  const merge = useAnim(750, { duration: 650, easing: Easing.inOut(Easing.cubic) });
  const pulse = useRef(new Animated.Value(1)).current;
  const trust = useAnim(2000, { spring: true, bounciness: 8 });
  const summary = useAnim(1700);
  useEffect(() => {
    const a = Animated.sequence([
      Animated.delay(1350),
      Animated.spring(pulse, { toValue: 1.3, useNativeDriver: true, speed: 30, bounciness: 0 }),
      Animated.spring(pulse, { toValue: 1, useNativeDriver: true, bounciness: 12 }),
    ]);
    a.start();
    const t = setTimeout(() => feel.build(), 1400);
    return () => {
      a.stop();
      clearTimeout(t);
    };
  }, []);

  const surv = company(fx.id);
  return (
    <>
      <View style={{ width: ROW_W, height: BADGE + 34, alignSelf: 'center', marginTop: 16 }}>
        {d.absorbed.map((a, i) => (
          <Animated.View
            key={a.co}
            style={{
              position: 'absolute', left: i * STEP, top: 0, alignItems: 'center',
              opacity: merge.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 0.6, 0] }),
              transform: [
                { translateX: merge.interpolate({ inputRange: [0, 1], outputRange: [0, SURV_X - i * STEP] }) },
                { scale: merge.interpolate({ inputRange: [0, 1], outputRange: [1, 0.35] }) },
              ],
            }}
          >
            <CompanyMark raised id={a.co} size={BADGE} depth={5} />
            <T v="small" color={th.inkSoft}>{a.size} plots</T>
          </Animated.View>
        ))}
        <Animated.View
          style={{
            position: 'absolute', left: SURV_X - 42, top: 12,
            opacity: merge.interpolate({ inputRange: [0, 0.5], outputRange: [1, 0], extrapolate: 'clamp' }),
          }}
        >
          <ChevronsRight size={28} color={th.accent} strokeWidth={1.75} />
        </Animated.View>
        <Animated.View style={{ position: 'absolute', left: SURV_X, top: 0, alignItems: 'center', transform: [{ scale: pulse }] }}>
          <CompanyMark raised id={fx.id} size={BADGE} depth={5} />
          <Animated.View style={{ opacity: merge.interpolate({ inputRange: [0, 0.6], outputRange: [1, 0], extrapolate: 'clamp' }) }}>
            <T v="small" color={th.inkSoft}>{d.before} plots</T>
          </Animated.View>
        </Animated.View>
      </View>

      <View style={{ alignItems: 'center', marginTop: 4 }}>
        <T v="display" style={{ textAlign: 'center' }}>{surv.name}</T>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Counter from={d.before} to={d.after} delay={1350} />
          <T v="plate" style={{ fontSize: 13 }}>plots · now</T>
          <Money amount={d.price} v="title" />
          <T v="plate" style={{ fontSize: 13 }}>a share</T>
        </View>
        {d.trust && (
          <Animated.View
            style={{
              marginTop: 6, backgroundColor: th.gold.leaf, paddingHorizontal: 10, paddingVertical: 2,
              opacity: trust, transform: [{ scale: trust.interpolate({ inputRange: [0, 1], outputRange: [1.8, 1] }) }],
            }}
          >
            <T style={{ fontFamily: FONTS.money, fontSize: 13, letterSpacing: 2, color: th.gold.ink }}>NOW A TRUST</T>
          </Animated.View>
        )}
      </View>

      <Animated.View style={{ opacity: summary, marginTop: 12, gap: 6 }}>
        <T v="accent" color={th.inkSoft} style={{ textAlign: 'center' }}>
          {state.players[d.seat].name} built on {fx.tile} and {surv.short} bought out{' '}
          {d.absorbed.map((a) => `${company(a.co).short} at $${a.price}`).join(' and ')} a share.
        </T>
        {d.bonuses.map((b, i) => {
          const p = state.players[b.seat];
          return (
            <View key={`${b.co}-${b.seat}-${i}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderColor: th.rule, paddingTop: 6 }}>
              <Portrait index={p.avatar} bot={p.bot} size={28} />
              <View style={{ flex: 1 }}>
                <T v="strong">{p.name}</T>
                <T v="small" color={th.inkSoft}>{b.kind} bonus · {company(b.co).short}</T>
              </View>
              <Money amount={b.amount} v="title" />
            </View>
          );
        })}
        {!d.bonuses.length && <T v="small" color={th.inkSoft} style={{ textAlign: 'center' }}>Nobody held shares — no bonuses paid.</T>}
        {d.holders > 0 && (
          <T v="small" color={th.inkSoft} style={{ textAlign: 'center' }}>Shareholders now sell, swap or hold their old shares.</T>
        )}
      </Animated.View>
    </>
  );
}

export default function EventOverlay({
  event, state, remaining = 0, onDone,
}) {
  const th = useTheme();
  const { width } = useWindowDimensions();
  const [box, setBox] = useState(null);
  const fx = event.fx;
  const buyout = fx.kind === 'buyout';
  const back = useAnim(0, { duration: 220 });
  const card = useAnim(60, { spring: true, bounciness: 7 });
  const cont = useAnim(buyout ? 2100 : 1200);
  const frame = buyout ? th.money : th.accent;

  // Stays up until the player closes it; queued moments follow one by one.
  return (
    <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, zIndex: 50, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: 'rgba(12,10,8,0.66)', opacity: back }} />
      <Animated.View
        style={{
          width: Math.min(width - 24, 390),
          opacity: card,
          transform: [{ translateY: card.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
        }}
      >
        <View
          onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
          style={{ backgroundColor: th.raised, paddingHorizontal: 30, paddingTop: 34, paddingBottom: 30 }}
        >
          {box && <Border w={box.w} h={box.h} color={frame} pid={`ev-${fx.kind}`} paper={th.raised} />}
          <Stamp
            text={buyout ? 'BUYOUT!' : 'CHARTERED'}
            color={frame}
            onLand={buyout ? undefined : () => feel.build()}
          />
          {buyout ? <BuyoutBody fx={fx} state={state} /> : <FoundBody fx={fx} state={state} />}
          <Animated.View style={{ opacity: cont, marginTop: 16 }}>
            <Button title={remaining ? `Next · ${remaining} more` : 'Continue'} onPress={onDone} />
          </Animated.View>
        </View>
      </Animated.View>
      <Coins delay={buyout ? 1400 : 500} count={buyout ? 18 : 10} />
    </View>
  );
}
