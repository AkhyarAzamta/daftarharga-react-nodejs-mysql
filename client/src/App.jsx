// src/App.jsx
import { useState } from 'react';
import TableView from './components/TableView';

export default function App() {
  const [refreshToggle, setRefreshToggle] = useState(false);
  return (
    <TableView
      onRefreshToggle={() => setRefreshToggle(ft => !ft)}
      key={+refreshToggle} // agar useEffect dipicu
    />
  );
}
