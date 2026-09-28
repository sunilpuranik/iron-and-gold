import * as React from 'react';
import { DoubleRule, T, useTheme } from 'iron-and-gold';
import { Paper } from './_kit';

export const SectionDivider = () => {
  const th = useTheme();
  return (
    <Paper width={360}>
      <T v="display">Charter a company</T>
      <T v="accent" color={th.inkSoft}>5 plots at D6 · you receive 1 founder share</T>
      <DoubleRule />
      <T v="body">Pick one of the unchartered companies below.</T>
    </Paper>
  );
};
