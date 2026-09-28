import * as React from 'react';
import { IconButton, Icons, RN, useTheme } from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;

export const Toolbar = () => {
  const th = useTheme();
  return (
    <Paper width={280}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <IconButton icon={Icons.ChevronLeft} label="Back" />
        <IconButton icon={Icons.Newspaper} label="Ticker" />
        <IconButton icon={Icons.Share} label="Share room code" />
        <IconButton icon={Icons.Crown} label="Standings" color={th.gilt} />
        <IconButton icon={Icons.X} label="Close" disabled />
      </View>
    </Paper>
  );
};
