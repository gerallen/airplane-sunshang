import { Routes, Route } from 'react-router';
import { FleetProvider } from '@/context/FleetContext';
import { DetailPage } from '@/pages/DetailPage';
import TablePage from '@/pages/TablePage';

function App() {
  return (
    <FleetProvider>
      <Routes>
        <Route path="/" element={<TablePage />} />
        <Route path="/detail/:aircraftId" element={<DetailPage />} />
      </Routes>
    </FleetProvider>
  );
}

export default App;
