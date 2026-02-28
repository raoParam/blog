import React from 'react'
import NavbarLoggedOut from '../../components/layout/NavbarLoggedOut'
import Footer from '../../components/layout/Footer'
import HeroSection from '../../components/landing/HeroSection'
import FeaturesSection from '../../components/landing/FeaturesSection'
import TrendingTopics from '../../components/landing/TrendingTopics'
import BlogPreview from '../../components/landing/BlogPreview'
import FinalCTA from '../../components/landing/FinalCTA'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavbarLoggedOut />
      <HeroSection />
      <FeaturesSection />
      <TrendingTopics />
      <BlogPreview />
      <FinalCTA />
      <Footer />
    </div>
  )
}

export default LandingPage