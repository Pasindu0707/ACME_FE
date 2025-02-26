import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import AddMainCat from './pages/AddMainCat';
import AddSubCat from './pages/AddSubCat';
import Companies from './pages/Companies';
import CompanyDetails from './pages/CompanyDetails';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/companies" element={<Companies/>}/>
        <Route path="/companies/:_id" element={<CompanyDetails/>}/>
        <Route path="/dashboard/addmain" element={<AddMainCat/>}/>
        <Route path="/dashboard/addsub" element={<AddSubCat/>}/>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
