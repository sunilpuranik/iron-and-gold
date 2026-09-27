import { View } from 'react-native';
import { useTheme } from '../../theme/theme';
import { T } from '../../theme/ui';
import Avatar from '../Avatar';
import { actorOf } from '../../game/engine';

const DOING = {
  place: 'is building…',
  found: 'is chartering a company…',
  survivor: 'is choosing a survivor…',
  dispose: 'is settling shares…',
  buy: 'is investing…',
};

const MINE = {
  place: 'Your turn — build a deed',
  found: 'Charter a company',
  survivor: 'Choose the surviving company',
  dispose: 'Settle your shares',
  buy: 'Invest — up to 3 shares',
};

export default function StatusStrip({ state, mySeat }) {
  const th = useTheme();
  if (state.phase === 'over') {
    return (
      <View style={{ backgroundColor: th.ledger, paddingHorizontal: 12, minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <T v="accent" color={th.gilt}>The closing bell has rung</T>
      </View>
    );
  }
  const seat = actorOf(state);
  const actor = state.players[seat];
  const mine = seat === mySeat;
  return (
    <View
      style={{
        backgroundColor: mine ? th.ink : th.ledger,
        paddingHorizontal: 12, minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10,
        borderBottomWidth: 1, borderColor: th.rule,
      }}
    >
      <Avatar index={actor.avatar} bot={actor.bot} size={34} />
      <T v="strong" color={mine ? th.onInk : th.ink} numberOfLines={1} style={{ flex: 1 }}>
        {mine ? MINE[state.phase] : `${actor.name} ${DOING[state.phase]}`}
      </T>
    </View>
  );
}
