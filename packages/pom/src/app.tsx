import { ProducerType } from './types';
import { HashRouter, Route, Routes } from 'react-router';
import './styles/globals.css';
import Producer from './views/producer/Producer';
import { Search } from './views/search/Search';

export const Pom = ({
  translations,
}: {
  translations?: (key: string) => string;
}) => {
  return (
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
      </Routes>
    </HashRouter>
  );
};
