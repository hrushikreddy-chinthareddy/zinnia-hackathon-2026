import './App.css';
import { Layout } from './components/Layout/Layout';
import { mockNavGroups } from './stories/mocks';

function App() {
  return (
    <>
      <Layout navGroups={mockNavGroups}>
        <h1>Vite + React</h1>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </Layout>
    </>
  );
}

export default App;
