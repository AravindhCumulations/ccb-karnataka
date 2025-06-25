
// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import UploadPage from './pages/UploadPage'; // import your new page
// import MainPage from './pages/MainPage';
import { OtpPagev1 } from './pages/OtpPagev1';
import ThanksPage from './pages/ThanksPage';
import HomePage from './pages/HomePage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/upload" element={<UploadPage />} />
        {/* <Route path='/' element={<MainPage/>} /> */}
        <Route path='/otp' element={<OtpPagev1/>} />
        <Route path='/thanks' element={<ThanksPage/>} />
        <Route path='/' element={<HomePage/>} />
      </Routes>
    </Router>
  );
};

export default App;