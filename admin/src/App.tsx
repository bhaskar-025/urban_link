import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { ComplaintDetail } from './pages/ComplaintDetail';
import { Community } from './pages/Community';
import { useAuthStore } from './store/useAuthStore';

import { Login } from './pages/Login';
import { Register } from './pages/Register';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={
           <ProtectedRoute>
             <Layout />
           </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="map" element={<Dashboard />} />
          <Route path="complaint/:id" element={<ComplaintDetail />} />
          <Route path="community" element={<Community />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
