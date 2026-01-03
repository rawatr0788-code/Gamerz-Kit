
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/firebase';
import Layout from './components/Layout';
import Home from './views/Home';
import ProductDetails from './views/ProductDetails';
import AdminDashboard from './views/AdminDashboard';
import UserOrders from './views/UserOrders';
import Checkout from './views/Checkout';
import Login from './views/Login';
import Profile from './views/Profile';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Silent background auth check
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Layout user={user}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/checkout/:id" element={<Checkout user={user} />} />
          <Route path="/orders" element={<UserOrders user={user} />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/admin" element={<AdminDashboard user={user} />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
