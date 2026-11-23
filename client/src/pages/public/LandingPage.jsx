import React from "react";
import NavbarLoggedOut from "../../components/layout/NavbarLoggedOut";
import Footer from "../../components/layout/Footer";
import HeroSection from "../../components/landing/HeroSection";
import TrendingTopics from "../../components/landing/TrendingTopics";
import FeaturesSection from "../../components/landing/FeaturesSection";
import BlogPreview from "../../components/landing/BlogPreview";
import FinalCTA from "../../components/landing/FinalCTA";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-body)] transition-colors duration-200 flex flex-col">
      <NavbarLoggedOut />
      
      <main className="flex-1">
        <HeroSection />
        <TrendingTopics />
        <FeaturesSection />
        <BlogPreview />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
