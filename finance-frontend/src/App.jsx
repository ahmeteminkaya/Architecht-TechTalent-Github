import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import UserProfile from './pages/UserProfile';
import MakeTransferPage from './pages/MakeTransferPage';
import MakeTransactionPage from './pages/MakeTransactionPage';
import TransactionsPage from './pages/TransactionsPage';
import EditTransactionPage from './pages/EditTransactionPage';
import TransfersPage from './pages/TransfersPage';
import EditTransferPage from './pages/EditTransferPage';
import EditUserPage from './pages/EditUserPage';
import './index.css';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/transfer" element={<MakeTransferPage />} />
            <Route path="/transaction" element={<MakeTransactionPage />} />
            <Route path="/mytransactions" element={<TransactionsPage />} />
            <Route path="/editTransaction/:id" element={<EditTransactionPage />} />
            <Route path="/mytransfers" element={<TransfersPage />} />
            <Route path="/editTransfer/:id" element={<EditTransferPage />} />
            <Route path="/editUser/:id" element={<EditTransferPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
