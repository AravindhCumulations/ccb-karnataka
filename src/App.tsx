
// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import UploadPage from './pages/UploadPage'; // import your new page
import MainPage from './pages/MainPage';


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/upload" element={<UploadPage />} />
        <Route path='/' element={<MainPage/>} />
      </Routes>
    </Router>
  );
};

export default App;