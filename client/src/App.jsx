import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import DashboardLayout from './layouts/DashboardLayout';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Faqs from './pages/Faqs';
import ForgotPassword from './pages/ForgotPassword';
import Garage from './pages/Garage';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import Login from './pages/Login';
import Repairs from './pages/Repairs';
import ResetPassword from './pages/ResetPassword';
import Services from './pages/Services';
import Track from './pages/Track';
import WhyUs from './pages/WhyUs';

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <div className="app-shell">
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route index element={<Home />} />
            <Route path="services" element={<Services />} />
            <Route path="why-us" element={<WhyUs />} />
            <Route path="faqs" element={<Faqs />} />
            <Route path="contact" element={<Contact />} />
            <Route path="track" element={<Track />} />
            <Route
              path="garage"
              element={
                <ProtectedRoute roles={['CUSTOMER']}>
                  <Garage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute roles={['ADMIN', 'MECHANIC']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="repairs"
              element={
                <ProtectedRoute roles={['ADMIN', 'MECHANIC']}>
                  <Repairs />
                </ProtectedRoute>
              }
            />
            <Route
              path="inventory"
              element={
                <ProtectedRoute roles={['ADMIN', 'MECHANIC']}>
                  <Inventory />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}
