import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import FluidBackground from 'components/FluidBackground';
import { DimensionalForm } from 'components/DimensionalForm';
import { DimensionalInput } from 'components/DimensionalInput';
import { DimensionalButton } from 'components/DimensionalButton';
import { DimensionalDivider } from 'components/DimensionalDivider';
import { SocialLoginButtons } from 'components/SocialLoginButtons';
import { registerWithEmail } from 'utils/firebase';

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      await registerWithEmail(email, password);
      navigate('/');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLoginStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleSocialLoginEnd = (error?: Error) => {
    setLoading(false);
    if (error) {
      console.error('Social login error:', error);
      setError(error.message || 'Failed to login');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <FluidBackground />
      
      {/* Content */}
      <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative z-10">
        {/* Logo */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link to="/">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              YAEGER<span className="text-purple-500">.</span>
            </h1>
          </Link>
        </motion.div>
        
        {/* Register Form */}
        <DimensionalForm title="Register" subtitle="Join your dimensional space">
          {error && (
            <motion.div 
              className="mb-4 p-3 bg-pink-500/20 border border-pink-500/30 text-white rounded-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              {error}
            </motion.div>
          )}
          
          <form onSubmit={handleRegister}>
            <DimensionalInput
              label="Email"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
              required
            />
            
            <DimensionalInput
              label="Password"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
            
            <DimensionalInput
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
            
            <div className="mt-6">
              <DimensionalButton type="submit" isLoading={loading}>
                Register
              </DimensionalButton>
            </div>
          </form>
          
          <DimensionalDivider text="or" />
          
          <SocialLoginButtons 
            onLoginStart={handleSocialLoginStart} 
            onLoginEnd={handleSocialLoginEnd} 
          />
          
          <motion.div 
            className="mt-6 text-center text-white/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 transition">
              Login
            </Link>
          </motion.div>
        </DimensionalForm>
      </div>
    </div>
  );
}
