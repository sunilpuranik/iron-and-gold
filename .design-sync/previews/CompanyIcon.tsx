import * as React from 'react';
import { COMPANIES, CompanyIcon, RN, T, useTheme } from 'iron-and-gold';
import { Paper } from './_kit';

const { View } = RN;

export const AllCompanies = () => {
  const th = useTheme();
  return (
    <Paper width={380} style={{ gap: 8 }}>
      {COMPANIES.map((c) => (
        <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <CompanyIcon id={c.id} size={32} />
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
      <CompanyIcon id="pw" size={16} />
      <CompanyIcon id="pw" size={22} />
      <CompanyIcon id="pw" size={32} />
      <CompanyIcon id="pw" size={48} />
    </View>
  </Paper>
);
