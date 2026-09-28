import { createContext, createElement, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { BOND_THEME, LACQUER } from './tokens';

const ThemeContext = createContext(LACQUER);

// Black lacquer is the house style; bond paper only when the system asks for light.
// `scheme` pins one ('dark' | 'light') regardless of the system setting.
export function ThemeProvider({ scheme, children }) {
  const system = useColorScheme();
  const light = (scheme || system) === 'light';
  return createElement(ThemeContext.Provider, { value: light ? BOND_THEME : LACQUER }, children);
}

export function useTheme() {
  return useContext(ThemeContext);
}
