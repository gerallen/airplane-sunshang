import { Routes, Route } from 'react-router';
import Home from '@/pages/Home';
import DetailPage from '@/pages/DetailPage';
import TablePage from '@/pages/TablePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<TablePage />} />
      <Route path="/detail/:modelId/:recordId" element={<DetailPage />} />
    </Routes>
  );
}

export default App;
