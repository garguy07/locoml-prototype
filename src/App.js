import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import PipelinePlayground from './components/PipelinePlayground';
import PipelineHub from './components/PipelineHub';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/playground" element={<PipelinePlayground />} />
        <Route path="/pipeline-hub" element={<PipelineHub />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;