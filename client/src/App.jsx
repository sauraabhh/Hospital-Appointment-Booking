import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Doctors from './pages/Doctors';
import MyAppointments from './pages/MyAppointments';
import Admin from './pages/Admin';

const getUser = () => JSON.parse(localStorage.getItem('user') || 'null');

export default function App() {
  const user = getUser();

  const logout = () => {
    localStorage.clear();
    window.location = '/';
  };

  return (
    <BrowserRouter>
      <nav className="nav">
        <span className="brand">🏥 CityCare Hospital</span>
        {user ? (
          <>
            <NavLink to="/doctors">Doctors</NavLink>
            <NavLink to="/my">My Appointments</NavLink>
            {user.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
            <span className="spacer"></span>
            <span className="user-chip">👤 {user.name}</span>
            <button className="btn btn-light" onClick={logout}>Logout</button>
          </>
        ) : (
          <NavLink to="/">Login</NavLink>
        )}
      </nav>

      <main className="container">
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/doctors" element={user ? <Doctors /> : <Navigate to="/" />} />
          <Route path="/my" element={user ? <MyAppointments /> : <Navigate to="/" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}