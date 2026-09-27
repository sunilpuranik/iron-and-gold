// Pass-and-play controller: bots move on a timer, humans share one phone.
import { useCallback, useEffect, useState } from 'react';
import { actorOf, applyAction, botAction } from './engine';
import { saveLocalGame } from '../store/storage';

const BOT_DELAY = { place: 750, found: 500, survivor: 500, dispose: 450, buy: 600 };

export function useLocalGame(initial) {
  const [state, setState] = useState(initial);
  const [hold, setHold] = useState(false); // pause bots while a big moment is on screen
  const humans = state.players.map((p, i) => (p.bot ? -1 : i)).filter((i) => i >= 0);
  const [viewer, setViewer] = useState(() => (humans.length === 1 ? humans[0] : -1));

  const actor = state.phase === 'over' ? -1 : actorOf(state);
  const actorIsBot = actor >= 0 && state.players[actor].bot;
  const cover = actor >= 0 && !actorIsBot && actor !== viewer ? state.players[actor] : null;

  useEffect(() => {
    saveLocalGame(state);
  }, [state]);

  useEffect(() => {
    if (!actorIsBot || hold) return undefined;
    const t = setTimeout(() => {
      setState((s) => {
        if (s.phase === 'over') return s;
        const a = actorOf(s);
        if (!s.players[a].bot) return s;
        return applyAction(s, a, botAction(s)) || s;
      });
    }, BOT_DELAY[state.phase] || 600);
    return () => clearTimeout(t);
  }, [state, actorIsBot, hold]);

  const dispatch = useCallback((action) => {
    if (cover || viewer < 0) return null;
    const next = applyAction(state, viewer, action);
    if (next) setState(next);
    return next;
  }, [state, viewer, cover]);

  const onReady = useCallback(() => setViewer(actor), [actor]);

  return {
    state, mySeat: viewer, dispatch, cover, onReady, error: null, setHold,
  };
}
