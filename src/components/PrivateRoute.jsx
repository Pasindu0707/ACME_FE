import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from './AuthContext';

const PrivateRoute = () => {
  const { auth } = useContext(AuthContext);

  const isAuth = auth || localStorage.getItem('accessToken');

  return isAuth ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoute;
