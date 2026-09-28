import * as React from 'react';
import { BellSheet } from 'iron-and-gold';
import { finished } from './_kit';

export const FinalStandings = () => <BellSheet visible state={finished()} mySeat={0} onHome={() => {}} onClose={() => {}} />;
