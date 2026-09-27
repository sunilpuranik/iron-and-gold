// Turn dispatches: readable summaries of what each tycoon did on their turn.

function tidy(text, name) {
  const t = text.startsWith(name + ' ') ? text.slice(name.length + 1) : text;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// { turn, seat, player, lines: [{ text, kind }] } for one recorded turn.
export function describeTurn(state, recap) {
  const player = state.players[recap.seat];
  return {
    turn: recap.turn,
    seat: recap.seat,
    player,
    lines: recap.lines.map((l) => ({ text: tidy(l.text, player.name), kind: l.kind })),
  };
}

// The turns other tycoons took since `seat` last finished a turn (newest last).
export function turnsSince(state, seat, limit = 6) {
  const turns = state.turns || [];
  let i = turns.length - 1;
  while (i >= 0 && turns[i].seat !== seat) i -= 1;
  return turns.slice(i + 1).slice(-limit).map((r) => describeTurn(state, r));
}

export function latestTurn(state) {
  const turns = state.turns || [];
  return turns.length ? turns[turns.length - 1] : null;
}
