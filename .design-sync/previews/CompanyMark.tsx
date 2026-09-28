import * as React from 'react';
import {
  COMPANIES, COMPANY_IDS, CompanyMark, RN, T, useTheme,
} from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;

export const AllCompanies = () => {
  const th = useTheme();
  return (
    <Paper width={380} style={{ gap: 8 }}>
      {COMPANIES.map((c) => (
        <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <CompanyMark id={c.id} size={40} />
          <View>
            <T v="strong">{c.name}</T>
            <T v="small" color={th.inkSoft}>{c.industry}</T>
          </View>
        </View>
      ))}
    </Paper>
  );
};

export const Sizes = () => (
  <Paper width={320}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <CompanyMark id="pw" size={16} />
      <CompanyMark id="pw" size={24} />
      <CompanyMark id="pw" size={32} />
      <CompanyMark id="pw" size={48} />
    </View>
  </Paper>
);

export const Raised = () => (
  <Paper width={440}>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
      {COMPANY_IDS.map((id) => <CompanyMark key={id} id={id} size={72} raised />)}
    </View>
  </Paper>
);
