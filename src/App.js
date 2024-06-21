// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import DrugPage from './pages/DrugPage';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/drugs/:drugName" element={<DrugPage />} />
      </Routes>
    </Router>
  );
}

export default App;
