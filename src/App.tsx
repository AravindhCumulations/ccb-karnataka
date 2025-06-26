
// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import UploadPage from './pages/UploadPage'; // import your new page
// import MainPage from './pages/MainPage';
import { OtpPage } from './pages/OtpPage';
import ThanksPage from './pages/ThanksPage';
import HomePage from './pages/HomePage';
import RehabListPage from './pages/RehabListPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/upload" element={<UploadPage />} />
        {/* <Route path='/' element={<MainPage/>} /> */}
        <Route path='/otp' element={<OtpPage/>} />
        <Route path='/thanks' element={<ThanksPage/>} />
        <Route path='/' element={<HomePage/>} />
        <Route path='/rehab-list' element={<RehabListPage/>} />
      </Routes>
    </Router>
  );
};

export default App;