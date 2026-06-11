import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Navbar from './components/Navbar';

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute><><Navbar /><Dashboard /></></PrivateRoute>} />
      <Route path="/transactions" element={<PrivateRoute><><Navbar /><Transactions /></></PrivateRoute>} />
      <Route path="/budgets" element={<PrivateRoute><><Navbar /><Budgets /></></PrivateRoute>} />
    </Routes>
  );
}