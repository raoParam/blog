import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FEATURES, HOW_IT_WORKS } from '../utils/constants'

const Landing = () => {
  return (
    <div className="bg-[#0A0A0A]">
      {/* Hero Section - Clean & Professional */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white">
              Write freely.
              <br />
              Share{' '}
              <span className="text-[#3B82F6]">anonymously</span>
              <br />
              Build publicly.
            </h1>
            
            <p className="mt-6 text-lg text-[#A1A1A1] max-w-2xl mx-auto">
              A modern platform for developers to share their thoughts, 
              stories, and expertise — with or without your name.
            </p>

            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              <Link
                to="/register"
                className="px-6 py-3 bg-white text-[#0A0A0A] rounded-lg hover:bg-[#F5F5F5] transition-colors font-medium"
              >
                Start writing
              </Link>
              <Link
                to="/explore"
                className="px-6 py-3 border border-[#1E1E1E] text-[#A1A1A1] rounded-lg hover:border-[#3B82F6] hover:text-white transition-colors"
              >
                Explore blogs
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm">
              <div className="flex -space-x-2">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-[#1E1E1E] border-2 border-[#0A0A0A] flex items-center justify-center text-xs text-white">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="text-[#A1A1A1]">
                <span className="text-white font-medium">2,000+</span> developers joined
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof - Subtle */}
      <section className="py-12 border-y border-[#1E1E1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-[#A1A1A1] uppercase tracking-wider">
            Trusted by developers from
          </p>
          <div className="mt-6 flex justify-center items-center gap-12 flex-wrap">
            {['Vercel', 'Linear', 'Notion', 'Medium'].map((brand) => (
              <span key={brand} className="text-sm font-medium text-[#666666] hover:text-[#A1A1A1] transition-colors">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Clean Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-medium text-white">
              Everything you need to write better
            </h2>
            <p className="mt-4 text-[#A1A1A1] max-w-2xl mx-auto">
              Clean, fast, and built for developers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#121212] border border-[#1E1E1E] rounded-lg p-6 hover:border-[#3B82F6]/50 transition-colors"
              >
                <span className="text-2xl mb-4 block">{feature.icon}</span>
                <h3 className="text-lg font-medium text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#A1A1A1] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Simple Steps */}
      <section className="py-24 bg-[#121212]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-medium text-white">
              Get started in three steps
            </h2>
            <p className="mt-4 text-[#A1A1A1]">
              Simple, straightforward, no complexity
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {HOW_IT_WORKS.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto bg-[#1E1E1E] rounded-full flex items-center justify-center text-white font-medium mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[#A1A1A1] max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Clean & Focused */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#121212] border border-[#1E1E1E] rounded-2xl p-12"
          >
            <h2 className="text-2xl md:text-3xl font-medium text-white mb-4">
              Ready to share your thoughts?
            </h2>
            <p className="text-[#A1A1A1] mb-8">
              Join thousands of developers writing on Flagged
            </p>
            <Link
              to="/register"
              className="inline-flex px-6 py-3 bg-white text-[#0A0A0A] rounded-lg hover:bg-[#F5F5F5] transition-colors font-medium"
            >
              Start writing now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Landing