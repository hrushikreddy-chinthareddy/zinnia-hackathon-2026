'use client';

import React, { useState, PropsWithChildren } from 'react';

import { User } from '@/types/auth';

import { UserContext } from './UserContext';

interface UserProviderProps extends PropsWithChildren {
  user: User | undefined;
}

const UserProvider: React.FC<UserProviderProps> = ({
  user: initialUser,
  children,
}) => {
  const [user] = useState<User | undefined>(initialUser);

  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
};

export { UserProvider };
