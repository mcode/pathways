import React, { FC, createContext, useContext, ReactNode } from 'react';

interface UserContextInterface {
  user: string;
  setUser: Function;
}

export const UserContext = createContext<UserContextInterface>({
  user: '',
  setUser: () => {
    // do nothing
  }
});

interface UserProviderProps {
  children: ReactNode;
  value: UserContextInterface;
}
export const UserProvider: FC<UserProviderProps> = ({ children, value }) => {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextInterface => useContext(UserContext);
