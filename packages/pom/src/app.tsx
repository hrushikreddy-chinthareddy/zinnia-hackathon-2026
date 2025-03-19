import { ProducerType } from './types';
import { HashRouter, Route, Routes } from 'react-router';
import './styles/globals.css';
import Producer from './views/producer/Producer';
import { Search } from './views/search/Search';
import { CreateProducerForm } from './views/create-producer/CreateProducerForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute,
      retry: false,
    },
  },
});
export const Pom = ({
  translations,
}: {
  translations?: (key: string) => string;
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<div>{translations?.('pomTitle')}</div>} />
          <Route path="/agents">
            <Route
              path=":id"
              element={<Producer producerType={ProducerType.INDIVIDUAL} />}
            />
          </Route>

          <Route path="/agencies">
            <Route
              path=":id"
              element={<Producer producerType={ProducerType.CORPORATION} />}
            />
          </Route>
          <Route path="/search" element={<Search />}></Route>
          <Route path="/form" element={<CreateProducerForm />}></Route>
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  );
};
