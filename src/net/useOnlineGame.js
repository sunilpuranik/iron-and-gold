// Online controller: my moves show at once (the engine is deterministic, so the server computes
// the same state), then the `game` Edge Function checks and stores them.
// Bots: whoever has the table open asks the server to move the bot; if two phones ask at once
// the second gets a harmless 409. With nobody watching, bots wait, which is fine for async games.
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { actorOf, applyAction } from '../game/engine';
import { fetchRoom, gameOp, subscribeRoom } from './online';

const BOT_DELAY = 800;
const POLL_MS = 10000;

export function useOnlineGame(code, profile, initialRow) {
  const [row, setRow] = useState(initialRow);
  const [error, setError] = useState(null);
  const [hold, setHold] = useState(false); // pause bots while a big moment is on screen
  const [retry, setRetry] = useState(0); // bumps to re-nudge a bot after a network failure
  const [gone, setGone] = useState(false); // the host closed the table
  const rowRef = useRef(initialRow);
  const busy = useRef(false);

  const accept = useCallback((r, force = false) => {
    if (!r) return;
    if (force || !rowRef.current || r.seq > rowRef.current.seq) {
      rowRef.current = r;
      setRow(r);
    }
  }, []);

  // Realtime, plus a slow poll and a refresh on foreground in case an event is missed.
  useEffect(() => {
    const unsub = subscribeRoom(code, (r) => accept(r));
    // fetchRoom resolves null once the row is gone: the host deleted the table.
    const refresh = () => fetchRoom(code).then((r) => (r ? accept(r) : setGone(true))).catch(() => {});
    refresh();
    const poll = setInterval(refresh, POLL_MS);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && refresh());
    return () => {
      unsub();
      clearInterval(poll);
      sub.remove();
    };
  }, [code, accept]);

  const state = row.state;
  const mySeat = state ? state.players.findIndex((p) => p.id === profile.id) : -1;
  const isHost = row.lobby.host === profile.id;

  const send = useCallback(async (op, action, optimistic) => {
    const cur = rowRef.current;
    if (busy.current) return;
    busy.current = true;
    if (optimistic) accept({ ...cur, state: optimistic, seq: cur.seq + 1 }, true);
    try {
      const r = await gameOp(code, op, cur.seq, action);
      if (r.seq >= rowRef.current.seq) accept(r, true);
      setError(null);
    } catch (e) {
      if (e.row) accept(e.row, true);
      else if (optimistic) accept(cur, true);
      else if (op === 'bot') setTimeout(() => setRetry((n) => n + 1), POLL_MS / 2);
      // Losing a bot race is normal; only tell the player about their own moves.
      if (op !== 'bot') setError(e.status === 409 ? 'The table moved on and has been refreshed.' : e.message);
    } finally {
      busy.current = false;
    }
  }, [code, accept]);

  const dispatch = useCallback((action) => {
    const cur = rowRef.current;
    if (mySeat < 0 || !cur.state || busy.current) return null;
    const next = applyAction(cur.state, mySeat, action);
    if (!next) return null;
    send('move', action, next);
    return next;
  }, [mySeat, send]);

  useEffect(() => {
    if (hold || !state || state.phase === 'over') return undefined;
    if (!state.players[actorOf(state)].bot) return undefined;
    const seq = row.seq;
    const t = setTimeout(() => {
      if (rowRef.current.seq === seq) send('bot');
    }, BOT_DELAY);
    return () => clearTimeout(t);
  }, [row, state, hold, send, retry]);

  return {
    state, mySeat, dispatch, cover: null, onReady: null, error, isHost, setHold, gone,
  };
}
