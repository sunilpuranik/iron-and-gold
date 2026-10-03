import * as React from 'react';
import { FrontierScene } from 'iron-and-gold';
import { liveClock } from './_kit';

// The title block rises in and the train, riders and coins run on Animated loops.
liveClock();

export const Desktop = () => <FrontierScene width={900} height={560} />;

export const Phone = () => <FrontierScene width={390} height={460} topInset={12} />;
