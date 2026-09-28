import * as React from 'react';
import { T, useTheme } from 'iron-and-gold';
import { Paper } from './_kit';

export const Variants = () => (
  <Paper width={380}>
    <T v="hero">The Closing Bell</T>
    <T v="display">Plains &amp; Western Railway</T>
    <T v="title">Your position</T>
    <T v="plate">Deal a local game</T>
    <T v="accent">A frontier rail town, 1881</T>
    <T v="strong">Prices rise with every plot.</T>
    <T v="body">Buy up to three shares.</T>
    <T v="label">BANK 18 OF 25 · 6 PLOTS</T>
    <T v="small">Turn 14 · 62 deeds left</T>
  </Paper>
);

export const Colours = () => {
  const th = useTheme();
  return (
    <Paper width={360}>
      <T v="strong">Ink — primary text</T>
      <T v="body" color={th.inkSoft}>Ink soft — hints and secondary lines</T>
      <T v="body" color={th.inkFaint}>Ink faint — asides</T>
      <T v="strong" color={th.money}>Money — cash and prices</T>
      <T v="plate" color={th.accent}>Accent — gilt labels</T>
      <T v="strong" color={th.jewel.carnelianText}>Carnelian — losses and errors</T>
    </Paper>
  );
};
