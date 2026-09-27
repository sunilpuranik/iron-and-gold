import { createContext, createElement, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { DARK, LIGHT } from './tokens';

const ThemeContext = createContext(LIGHT);

export function ThemeProvider({ children }) {
  const scheme = useColorScheme();
  return createElement(ThemeContext.Provider, { value: scheme === 'dark' ? DARK : LIGHT }, children);
}

export function useTheme() {
  return useContext(ThemeContext);
}
