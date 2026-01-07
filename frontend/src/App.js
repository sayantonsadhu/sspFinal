import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/sonner";

// Public Pages
import Navigation from "./components/Navigation";
import HeroCarousel from "./components/HeroCarousel";
import RecentWeddings from "./components/RecentWeddings";
import FilmsSection from "./components/FilmsSection";
import AboutSection from "./components/AboutSection";
import PackagesSection from "./components/PackagesSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSettings from "./pages/AdminSettings";
import ProtectedRoute from "./components/ProtectedRoute";

const HomePage = () => {
  return (
    <>
      <Navigation />
      <main>
        <section id="home">
          <HeroCarousel />
        </section>
        <section id="weddings">
          <RecentWeddings />
        </section>
        <section id="films">
          <FilmsSection />
        </section>
        <section id="about">
          <AboutSection />
        </section>
        <section id="packages">
          <PackagesSection />
        </section>
        <ContactSection />
      </main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="settings" element={<AdminSettings />} />
              {/* More admin routes will be added */}
            </Route>
          </Routes>
          <Toaster position="top-right" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
