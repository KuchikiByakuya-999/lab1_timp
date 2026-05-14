import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Home from './pages/Home';
import Detail from './pages/Detail';
import SiteForm from './pages/SiteForm';
import Blocks from './pages/Blocks';
import BlockDetail from './pages/BlockDetail';
import BlockForm from './pages/BlockForm';

function Navbar({ onLogout }) {
  const { pathname } = useLocation();
  return (
    <nav className="navbar">
      <span className="navbar-brand">     </span>
      <Link to="/" className={pathname === '/' ? 'nav-link active' : 'nav-link'}>Сайты</Link>
      <Link to="/blocks" className={pathname === '/blocks' ? 'nav-link active' : 'nav-link'}>Блокировки</Link>
      <button onClick={onLogout} className="btn btn-danger btn-small" style={{ marginLeft: 'auto' }}>
        Выйти
      </button>
    </nav>
  );
}

function PrivateRoute({ isAuth, children }) {
  return isAuth ? children : <Navigate to="/login" />;
}

function App() {
  const [isAuth, setIsAuth] = useState(Boolean(localStorage.getItem('auth_token')));

  const handleLogin = () => setIsAuth(true);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuth(false);
  };

  return (
    <BrowserRouter>
      {isAuth && <Navbar onLogout={handleLogout} />}
      <div className={isAuth ? 'container' : ''}>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/" element={<PrivateRoute isAuth={isAuth}><Home /></PrivateRoute>} />
          <Route path="/detail/:id" element={<PrivateRoute isAuth={isAuth}><Detail /></PrivateRoute>} />
          <Route path="/add" element={<PrivateRoute isAuth={isAuth}><SiteForm /></PrivateRoute>} />
          <Route path="/edit/:id" element={<PrivateRoute isAuth={isAuth}><SiteForm /></PrivateRoute>} />
          <Route path="/blocks" element={<PrivateRoute isAuth={isAuth}><Blocks /></PrivateRoute>} />
          <Route path="/block/:id" element={<PrivateRoute isAuth={isAuth}><BlockDetail /></PrivateRoute>} />
          <Route path="/block/add" element={<PrivateRoute isAuth={isAuth}><BlockForm /></PrivateRoute>} />
          <Route path="/block/edit/:id" element={<PrivateRoute isAuth={isAuth}><BlockForm /></PrivateRoute>} />
          <Route path="*" element={<Navigate to={isAuth ? '/' : '/login'} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;