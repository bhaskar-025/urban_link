import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { SubmitComplaint } from './pages/SubmitComplaint';
import { Community } from './pages/Community';
import { Issues } from './pages/Issues';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ComplaintDetail } from './pages/ComplaintDetail';
import { useAuthStore } from './store/useAuthStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          <Route path="dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="submit" element={
            <ProtectedRoute>
              <SubmitComplaint />
            </ProtectedRoute>
          } />

          <Route path="community" element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          } />

          <Route path="issues" element={
            <ProtectedRoute>
              <Issues />
            </ProtectedRoute>
          } />

          <Route path="complaint/:id" element={
            <ProtectedRoute>
              <ComplaintDetail />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
