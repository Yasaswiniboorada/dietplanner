import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navigation from './components/common/Navigation';
import ProfileSetup from './pages/Profile/Setup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MealPlanPage from './pages/MealPlan';
import MealRecommendationsPage from './pages/MealRecommendations';
import Progress from './pages/Progress';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/profile/setup"
            element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Profile />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/meal-plan"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <MealPlanPage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/meal-recommendations"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <MealRecommendationsPage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Progress />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirect root to dashboard if logged in, otherwise to login */}
          <Route
            path="/"
            element={
              localStorage.getItem('user') ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
