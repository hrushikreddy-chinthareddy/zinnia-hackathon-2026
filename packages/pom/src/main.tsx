import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Pom } from './Pom';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Pom />
  </StrictMode>
);
