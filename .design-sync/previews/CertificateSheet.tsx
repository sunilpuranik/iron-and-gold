import * as React from 'react';
import { COMPANY_IDS, CertificateSheet } from 'iron-and-gold';
import { midGame } from './_kit';

export const Register = () => {
  const s = midGame();
  const me = s.players[0];
  // Open on a company the viewer holds, so the certificate is registered to them.
  const held = COMPANY_IDS.slice().sort((a, b) => me.shares[b] - me.shares[a])[0];
  const [id, setId] = React.useState(held);
  return <CertificateSheet visible state={s} id={id} me={me} mySeat={0} onPick={setId} onClose={() => {}} />;
};
