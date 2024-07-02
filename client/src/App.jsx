import { useState } from 'react';
import TableComponent from './components/TableComponent';

function App() {
  const [refreshData, setRefreshData] = useState(false);

  const handleRefresh = () => {
    setRefreshData(!refreshData);
  };

  return (
    <>
      <TableComponent refreshData={refreshData} onRefresh={handleRefresh} />
    </>
  );
}

export default App;
