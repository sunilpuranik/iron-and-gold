import * as React from 'react';
import { Wordmark } from 'iron-and-gold';
import { Paper } from './_kit';

export const Sizes = () => (
  <Paper width={360}>
    <Wordmark size={17} />
    <Wordmark size={24} />
    <Wordmark size={36} align="center" />
  </Paper>
);
