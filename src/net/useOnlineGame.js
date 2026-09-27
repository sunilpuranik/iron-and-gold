// Online controller: apply actions locally, write with an optimistic seq check.
// The host's phone drives the bots.
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { actorOf, applyAction, botAction } from '../game/engine';
import { fetchRoom, subscribeRoom, writeRoom } from './online';

const BOT_DELAY = 800;
const POLL_MS = 10000;

export function useOnlineGame(code, profile, initialRow, onRoomChange) {
  const [row, setRow] = useState(initialRow);
  const [error, setError] = useState(null);
  const [hold, setHold] = useState(false); // host pauses bots while a big moment is on screen
  const rowRef = useRef(initialRow);
  const busy = useRef(false);

  const accept = useCallback((r, force = false) => {
    if (!r) return;
    if (force || !rowRef.current || r.seq > rowRef.current.seq) {
      rowRef.current = r;
      setRow(r);
      if (onRoomChange) onRoomChange(r);
    }
  }, [onRoomChange]);

  // Realtime + a slow poll (and refresh on foreground) in case an event is missed.
  useEffect(() => {
    const unsub = subscribeRoom(code, (r) => accept(r));
    const refresh = () => fetchRoom(code).then((r) => accept(r)).catch(() => {});
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

  const commit = useCallback(async (seat, action) => {
    const cur = rowRef.current;
    if (!cur.state || busy.current) return null;
    const next = applyAction(cur.state, seat, action);
    if (!next) return null;
    busy.current = true;
    accept({ ...cur, state: next, seq: cur.seq + 1 }, true);
    try {
      const res = await writeRoom(code, cur.seq, { state: next });
      if (!res.ok) {
        accept(res.row, true);
        setError('Someone moved first — the table has been refreshed.');
      } else {
        if (res.row.seq >= rowRef.current.seq) accept(res.row, true);
        setError(null);
      }
    } catch (e) {
      accept(cur, true);
      setError(e.message || 'Network error');
    } finally {
      busy.current = false;
    }
    return next;
  }, [code, accept]);

  const dispatch = useCallback((action) => {
    if (mySeat < 0) return null;
    commit(mySeat, action);
    return true;
  }, [commit, mySeat]);

  // Host drives bots.
  useEffect(() => {
    if (!isHost || hold || !state || state.phase === 'over') return undefined;
    const a = actorOf(state);
    if (!state.players[a].bot) return undefined;
    const seq = row.seq;
    const t = setTimeout(() => {
      const cur = rowRef.current;
      if (cur.seq !== seq) return;
      commit(a, botAction(cur.state));
    }, BOT_DELAY);
    return () => clearTimeout(t);
  }, [row, isHost, state, commit, hold]);

  return {
    state, mySeat, dispatch, cover: null, onReady: null, error, isHost, setHold,
  };
}
