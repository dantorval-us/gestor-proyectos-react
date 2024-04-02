import './App.css';
import Tablero from './components/tablero/Tablero';
import { DataProvider } from './context';

function App() {
  return (
    <DataProvider>
      <div className="App">
        <>
          <header className="App-header">
          </header>

          <main>
            <Tablero />
          </main>
        </>
      </div>
    </DataProvider>
  );
}

export default App;
