import * as React from 'react';
import { ActionBar } from 'iron-and-gold';
import { Paper } from './_kit';

const Bar = (p: any) => <Paper width={390} pad={0}><ActionBar {...p} /></Paper>;

export const PlaceSelected = () => <Bar phase="place" mine selected="C7" />;
export const PlaceNothingPicked = () => <Bar phase="place" mine selected={null} />;
export const Buy = () => <Bar phase="buy" mine canBell />;
export const Decide = () => <Bar phase="found" mine />;
export const Waiting = () => <Bar phase="place" mine={false} actorName="Col. Barlow" />;
export const Over = () => <Bar phase="over" mine />;
