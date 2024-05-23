'use client';

import React, { useState, PropsWithChildren } from 'react';

import { Pii } from '@/types/pii';

import { PiiContext } from './PiiContext';

interface PiiProviderProps extends PropsWithChildren {
  pii: Pii | undefined;
}

const PiiProvider: React.FC<PiiProviderProps> = ({
  pii: initialPii,
  children,
}) => {
  const [pii] = useState<Pii | undefined>(initialPii);

  return <PiiContext.Provider value={pii}>{children}</PiiContext.Provider>;
};

export { PiiProvider };
