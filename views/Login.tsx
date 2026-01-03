
import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const getFriendlyErrorMessage = (err: any) => {
    const code = err.code || '';
    // Catch common "invalid-credential" or "wrong-password" errors
    if (code.includes('auth/invalid-credential') || 
        code.includes('auth/wrong-password') || 
        code.includes('auth/user-not-found') ||
        code.includes('auth/invalid-email')) {
      return "Wrong password or email. Please check your credentials and try again.";
    }
    if (code.includes('auth/email-already-in-use')) {
      return "This email is already registered in our system.";
    }
    if (code.includes('auth/weak-password')) {
      return "Security Alert: Your password must be at least 6 characters.";
    }
    if (code.includes('auth/too-many-requests')) {
      return "Too many failed attempts. Access temporarily locked for security.";
    }
    return "System Error: Unable to authenticate. Please verify your connection.";
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullName });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (err: any) {
      console.error("Auth Exception:", err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/5 border border-white/10 p-8 md:p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-[#39ff14]/20" />
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[#39ff14]/10 flex items-center justify-center rounded-full text-[#39ff14] mb-4 border border-[#39ff14]/20">
            <ShieldCheck size={32} />
          </div>
          <h1 className="font-orbitron text-2xl font-black text-white uppercase tracking-tighter">
            {isRegister ? 'New Operative' : 'System Login'}
          </h1>
          <p className="text-gray-500 text-[10px] tracking-[0.4em] uppercase mt-2 text-center leading-relaxed">
            Authorized Personnel Only
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {isRegister && (
            <div className="space-y-2">
              <label className="text-[10px] font-orbitron text-gray-400 uppercase tracking-[0.2em] font-bold">Tactical Handle</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  required 
                  type="text" 
                  placeholder="Full Name"
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-black border border-white/10 p-4 pl-12 text-sm focus:border-[#39ff14] outline-none transition-all placeholder:text-gray-800 text-white"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-orbitron text-gray-400 uppercase tracking-[0.2em] font-bold">Comm-Link ID (Email)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                required 
                type="email" 
                placeholder="operative@gamerzkit.com"
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-black border border-white/10 p-4 pl-12 text-sm focus:border-[#39ff14] outline-none transition-all placeholder:text-gray-800 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-orbitron text-gray-400 uppercase tracking-[0.2em] font-bold">Access Key (Password)</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                required 
                type="password" 
                placeholder="••••••••"
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-black border border-white/10 p-4 pl-12 text-sm focus:border-[#39ff14] outline-none transition-all placeholder:text-gray-800 text-white"
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 p-3 flex items-center gap-3 text-red-500"
            >
              <AlertCircle size={16} className="shrink-0" />
              <p className="text-[10px] font-orbitron font-bold uppercase tracking-widest">{error}</p>
            </motion.div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#39ff14] text-black font-orbitron font-black py-4 uppercase tracking-[0.2em] hover:brightness-110 transition-all disabled:opacity-50 text-xs shadow-[0_0_20px_rgba(57,255,20,0.3)]"
          >
            {loading ? 'SYNCHRONIZING...' : (isRegister ? 'INITIALIZE OPERATIVE' : 'ESTABLISH LINK')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-gray-500 hover:text-[#39ff14] text-[9px] font-orbitron uppercase tracking-[0.3em] transition-colors"
          >
            {isRegister ? 'Back to standard login' : 'Request new credentials'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
