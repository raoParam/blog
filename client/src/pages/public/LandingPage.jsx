import { MotionConfig } from "framer-motion";
import NavbarLoggedOut from "../../components/layout/NavbarLoggedOut";
import Footer from "../../components/layout/Footer";
import HeroSection from "../../components/landing/HeroSection";
import FeaturesSection from "../../components/landing/FeaturesSection";
import TrendingTopics from "../../components/landing/TrendingTopics";
import BlogPreview from "../../components/landing/BlogPreview";
import FinalCTA from "../../components/landing/FinalCTA";

const LandingPage = () => {
  return (
    // reducedMotion="user" turns off movement for people who ask for less motion
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-background">
        <NavbarLoggedOut />
        <main>
          <HeroSection />
          <FeaturesSection />
          <BlogPreview />
          <TrendingTopics />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
};

export default LandingPage;
