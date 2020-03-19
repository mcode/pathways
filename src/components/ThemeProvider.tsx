import React, { FC, createContext, useState, useCallback, useContext, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import { theme as defaultTheme, projectorTheme } from '../styles/theme';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeContext = createContext(() => {
  // this comment does nothing but make eslint happy :)
});
export const useThemeToggle = (): (() => void) => useContext(ThemeContext);

const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState(defaultTheme);
  const toggleTheme = useCallback(() => {
    setTheme(currentTheme => (currentTheme === defaultTheme ? projectorTheme : defaultTheme));
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      <ThemeContext.Provider value={toggleTheme}>{children}</ThemeContext.Provider>
    </MuiThemeProvider>
  );
};

export default ThemeProvider;
