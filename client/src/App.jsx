import { useState } from 'react';
import TableComponent from './components/TableComponent';
import SearchBar from './components/SearchBar';

function App() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <>
      <div className="p-4">
        <SearchBar searchTerm={searchTerm} onSearch={handleSearch} />
        <TableComponent searchTerm={searchTerm} />
      </div>
    </>
  );
}

export default App;
