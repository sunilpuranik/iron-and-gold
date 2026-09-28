import { createContext, createElement, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { BOND_THEME, LACQUER } from './tokens';

const ThemeContext = createContext(LACQUER);

// Black lacquer is the house style; bond paper only when the system asks for light.
export function ThemeProvider({ children }) {
  const scheme = useColorScheme();
  return createElement(ThemeContext.Provider, { value: scheme === 'light' ? BOND_THEME : LACQUER }, children);
}

export function useTheme() {
  return useContext(ThemeContext);
}
