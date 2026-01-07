import React from "react";
import "./App.css";
import Navigation from "./components/Navigation";
import HeroCarousel from "./components/HeroCarousel";
import RecentWeddings from "./components/RecentWeddings";
import FilmsSection from "./components/FilmsSection";
import AboutSection from "./components/AboutSection";
import PackagesSection from "./components/PackagesSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="App">
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
    </div>
  );
}

export default App;
