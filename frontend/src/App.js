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
import YouTubeSection from "./components/YouTubeSection";
import AboutSection from "./components/AboutSection";
import PackagesSection from "./components/PackagesSection";
import ContactSection from "./components/ContactSection";
import FacebookSection from "./components/FacebookSection";
import SocialMediaSection from "./components/SocialMediaSection";
import Footer from "./components/Footer";
import WeddingGallery from "./pages/WeddingGallery";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSettings from "./pages/AdminSettings";
import AdminHeroCarousel from "./pages/AdminHeroCarousel";
import AdminWeddings from "./pages/AdminWeddings";
import AdminWeddingGallery from "./pages/AdminWeddingGallery";
import AdminFilms from "./pages/AdminFilms";
import AdminAbout from "./pages/AdminAbout";
import AdminPackages from "./pages/AdminPackages";
import AdminInquiries from "./pages/AdminInquiries";
import AdminFacebook from "./pages/AdminFacebook";
import AdminSocialMedia from "./pages/AdminSocialMedia";
import AdminYouTube from "./pages/AdminYouTube";
import AdminSecurity from "./pages/AdminSecurity";
import AdminSectionContent from "./pages/AdminSectionContent";
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
        <SocialMediaSection />
        <FacebookSection />
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
            <Route path="/wedding/:weddingId" element={<WeddingGallery />} />
            
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
              <Route path="hero-carousel" element={<AdminHeroCarousel />} />
              <Route path="weddings" element={<AdminWeddings />} />
              <Route path="weddings/:weddingId/gallery" element={<AdminWeddingGallery />} />
              <Route path="films" element={<AdminFilms />} />
              <Route path="about" element={<AdminAbout />} />
              <Route path="packages" element={<AdminPackages />} />
              <Route path="facebook" element={<AdminFacebook />} />
              <Route path="social-media" element={<AdminSocialMedia />} />
              <Route path="inquiries" element={<AdminInquiries />} />
            </Route>
          </Routes>
          <Toaster position="top-right" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
