import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/theme';
import { T } from '../theme/ui';
import { actorOf, canClose } from '../game/engine';
import { feel, playSting } from '../feel/feel';
import Header from '../components/game/Header';
import StatusStrip from '../components/game/StatusStrip';
import Board from '../components/game/Board';
import Tabs, { TAB_BODY_HEIGHT } from '../components/game/Tabs';
import DeedsTab from '../components/game/DeedsTab';
import MarketTab from '../components/game/MarketTab';
import TycoonsTab from '../components/game/TycoonsTab';
import ActionBar from '../components/game/ActionBar';
import HandoffCover from '../components/game/HandoffCover';
import CharterSheet from '../components/sheets/CharterSheet';
import SurvivorSheet from '../components/sheets/SurvivorSheet';
import SettleSheet from '../components/sheets/SettleSheet';
import InvestSheet from '../components/sheets/InvestSheet';
import BellSheet from '../components/sheets/BellSheet';
import TickerSheet from '../components/sheets/TickerSheet';
import { DispatchToast } from '../components/game/Dispatch';
import { describeTurn, latestTurn, turnsSince } from '../game/recap';

const DECISIONS = ['found', 'survivor', 'dispose'];

export default function GameScreen({
  ctl, onExit, dispatches = true, onDispatches,
}) {
  const th = useTheme();
  const {
    state, mySeat, dispatch, cover, onReady, error,
  } = ctl;
  const me = mySeat >= 0 ? state.players[mySeat] : null;
  const over = state.phase === 'over';
  const actor = over ? -1 : actorOf(state);
  const mine = !cover && actor === mySeat && mySeat >= 0;

  const [tab, setTab] = useState('Deeds');
  const [selected, setSelected] = useState(null);
  const [sheet, setSheet] = useState(over ? 'results' : null);
  const [dismissed, setDismissed] = useState(-1);
  const [toast, setToast] = useState(null);

  // Turn dispatches: after another tycoon finishes a turn, drop in a telegram of what they did.
  const seenTurn = useRef(latestTurn(state) ? latestTurn(state).turn : 0);
  useEffect(() => {
    const last = latestTurn(state);
    if (!last || last.turn <= seenTurn.current) return;
    const missed = state.turns.filter((r) => r.turn > seenTurn.current && r.seat !== mySeat).length;
    seenTurn.current = last.turn;
    if (!dispatches || cover || last.seat === mySeat) return;
    feel.select();
    setToast({ dispatch: describeTurn(state, last), extra: Math.max(0, missed - 1) });
  }, [state.turns]);

  // Clear a stale selection.
  useEffect(() => {
    if (selected && (!mine || state.phase !== 'place' || !me.hand.includes(selected))) setSelected(null);
  }, [state, mine]);

  // Feel for shared moments: buyouts and the closing bell.
  const lastFx = useRef(state.fx ? state.fx.seq : -1);
  useEffect(() => {
    const fx = state.fx;
    if (!fx || fx.seq === lastFx.current) return;
    lastFx.current = fx.seq;
    if (fx.kind === 'buyout') {
      feel.buyout();
      playSting();
    } else if (fx.kind === 'bell') {
      feel.bell();
      setSheet('results');
    }
  }, [state.fx]);

  // Close the invest sheet when the turn moves on.
  useEffect(() => {
    if (sheet === 'invest' && !(mine && state.phase === 'buy')) setSheet(null);
  }, [state.phase, mine]);

  const build = useCallback((tile) => {
    if (dispatch({ type: 'place', tile })) feel.build();
    setSelected(null);
  }, [dispatch]);

  const onDeed = useCallback((tile) => {
    if (!mine || state.phase !== 'place') return;
    if (selected === tile) {
      build(tile);
    } else {
      feel.select();
      setSelected(tile);
    }
  }, [mine, state.phase, selected, build]);

  const buy = (cart) => {
    if (dispatch({ type: 'buy', cart })) {
      if (Object.values(cart).some((n) => n > 0)) feel.buy();
    }
    setSheet(null);
  };

  const ringBell = () => {
    const ring = () => dispatch({ type: 'close', cart: {} });
    if (Platform.OS === 'web') {
      if (window.confirm('Ring the closing bell? Final bonuses are paid and the game ends.')) ring();
      return;
    }
    Alert.alert('Ring the closing bell?', 'Final bonuses are paid, every share is sold, and the richest tycoon wins.', [
      { text: 'Not yet', style: 'cancel' },
      { text: 'Ring it', style: 'destructive', onPress: ring },
    ]);
  };

  const decisionVisible = mine && DECISIONS.includes(state.phase) && dismissed !== state.seq;
  const closeDecision = () => setDismissed(state.seq);

  let body;
  if (tab === 'Deeds') {
    body = (
      <DeedsTab
        state={state}
        hand={cover ? null : me && me.hand}
        selected={selected}
        canBuild={mine && state.phase === 'place'}
        onDeed={onDeed}
      />
    );
  } else if (tab === 'Market') body = <MarketTab state={state} me={me} />;
  else body = <TycoonsTab state={state} mySeat={mySeat} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.paper }} edges={['top', 'bottom', 'left', 'right']}>
      <Header state={state} me={cover ? null : me} onHome={onExit} onTicker={() => setSheet('ticker')} />
      <StatusStrip state={state} mySeat={cover ? -1 : mySeat} />
      {error ? (
        <View style={{ paddingHorizontal: 12, paddingVertical: 4, backgroundColor: th.ledger }}>
          <T v="small" color={th.inkSoft}>{error}</T>
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Board
          state={state}
          myHand={!cover && me && !over ? me.hand : null}
          canPick={mine && state.phase === 'place'}
          selected={selected}
          onTilePress={onDeed}
        />
        {toast && !cover && (
          <DispatchToast dispatch={toast.dispatch} extra={toast.extra} onDone={() => setToast(null)} />
        )}
      </View>
      <Tabs tab={tab} onTab={setTab} />
      <View style={{ height: TAB_BODY_HEIGHT, backgroundColor: th.paper }}>{body}</View>
      <ActionBar
        phase={state.phase}
        mine={mine}
        actorName={actor >= 0 ? state.players[actor].name : ''}
        selected={selected}
        canBell={canClose(state)}
        onBuild={build}
        onInvest={() => setSheet('invest')}
        onPass={() => buy({})}
        onBell={ringBell}
        onDecide={() => setDismissed(-1)}
        onResults={() => setSheet('results')}
      />

      <CharterSheet
        visible={decisionVisible && state.phase === 'found'}
        state={state}
        onPick={(company) => { if (dispatch({ type: 'found', company })) feel.build(); }}
        onClose={closeDecision}
      />
      <SurvivorSheet
        visible={decisionVisible && state.phase === 'survivor'}
        state={state}
        me={me}
        onPick={(company) => dispatch({ type: 'survivor', company })}
        onClose={closeDecision}
      />
      <SettleSheet
        visible={decisionVisible && state.phase === 'dispose'}
        state={state}
        me={me}
        onSettle={(a) => dispatch({ type: 'dispose', ...a })}
        onClose={closeDecision}
      />
      <InvestSheet
        visible={sheet === 'invest' && mine && state.phase === 'buy'}
        state={state}
        me={me}
        onBuy={buy}
        onClose={() => setSheet(null)}
      />
      <BellSheet
        visible={sheet === 'results' && over}
        state={state}
        mySeat={mySeat}
        onHome={onExit}
        onClose={() => setSheet(null)}
      />
      <TickerSheet
        visible={sheet === 'ticker'}
        state={state}
        dispatches={dispatches}
        onDispatches={onDispatches}
        onClose={() => setSheet(null)}
      />
      <HandoffCover
        player={cover}
        recap={cover && dispatches ? turnsSince(state, actor) : []}
        onReady={onReady}
      />
    </SafeAreaView>
  );
}
