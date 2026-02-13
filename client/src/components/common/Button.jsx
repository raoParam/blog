import { motion } from 'framer-motion'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  href,
  onClick,
  className = '',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200'
  
  const variants = {
    primary: 'bg-white text-[#0A0A0A] hover:bg-[#F5F5F5]',
    secondary: 'bg-[#121212] border border-[#1E1E1E] text-[#A1A1A1] hover:border-[#3B82F6] hover:text-white',
    ghost: 'text-[#A1A1A1] hover:text-white'
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  const Component = href ? 'a' : motion.button
  
  return (
    <Component
      href={href}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}

export default Button