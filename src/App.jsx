import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthForm from "./components/auth/auth";
import Navbar from "./components/header/navbar";
import Home from "./components/home/home";
import Interview from "./components/interview/interview";
import Footer from "./components/Footer";
import InterviewPage from "./interviewPage/interviewPage";
import Feedback from "./components/interview/feedback";
import { AuthProvider } from "./components/auth/AuthContext";
import Profile from "./components/profile/Profile";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import GuestRoute from "./components/auth/GuestRoute";
import Admin from "./components/admin/Admin";
import AdminAuth from "./components/admin/AdminAuth";
import CodeAccess from "./components/code/CodeAccess";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resume" element={<Navigate to="/profile" replace />} />
          <Route
            path="/auth"
            element={
              <GuestRoute>
                <AuthForm />
              </GuestRoute>
            }
          />
          <Route
            path="/interview"
            element={
              <ProtectedRoute>
                <Interview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/interviewPage/:id" element={<InterviewPage />} />
          <Route path="/interview/:id/feedback" element={<Feedback />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route path="/code" element={<CodeAccess />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
