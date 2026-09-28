import * as React from 'react';
import { T, useTheme } from 'iron-and-gold';
import { Paper } from './_kit';

export const Variants = () => (
  <Paper width={360}>
    <T v="display">Closing bell</T>
    <T v="title">Plains &amp; Western Railway</T>
    <T v="accent">The town telegraph, newest first</T>
    <T v="plate">Share register</T>
    <T v="strong">Eleanor Vance builds on C7</T>
    <T v="body">Col. Barlow buys 2 shares of Red Mesa Oil.</T>
    <T v="label">FOUNDRY ROW</T>
    <T v="small">Turn 14 · 62 deeds left</T>
  </Paper>
);

export const Colours = () => {
  const th = useTheme();
  return (
    <Paper width={360}>
      <T v="strong">Ink — primary text</T>
      <T v="body" color={th.inkSoft}>Ink soft — hints and secondary lines</T>
      <T v="strong" color={th.gilt}>Gilt — money and highlights</T>
      <T v="accent" color={th.districts.main.accent}>Main Street accent</T>
    </Paper>
  );
};
