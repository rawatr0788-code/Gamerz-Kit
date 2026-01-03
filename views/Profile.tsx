
import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Fingerprint, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface ProfileProps {
  user: any;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 font-orbitron">
        <p className="text-red-500">SESSION EXPIRED. PLEASE RE-AUTHENTICATE.</p>
        <Link to="/login" className="bg-[#39ff14] text-black px-6 py-2 uppercase tracking-tighter font-bold">Login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
      <button 
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-gray-400 hover:text-[#39ff14] transition-colors font-orbitron text-xs uppercase tracking-widest mb-10 group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/5 border border-white/10 p-8 md:p-12 relative overflow-hidden"
      >
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#39ff14]/30" />
        
        <div className="flex flex-col items-center mb-12">
          <div className="w-24 h-24 bg-[#39ff14]/10 flex items-center justify-center rounded-full border-2 border-[#39ff14]/20 mb-6 relative">
            <User size={48} className="text-[#39ff14]" />
            <div className="absolute -bottom-1 -right-1 bg-black p-1 border border-[#39ff14]/30 rounded-full">
              <Shield size={16} className="text-[#39ff14]" />
            </div>
          </div>
          <h1 className="font-orbitron text-3xl font-black text-white uppercase tracking-tighter text-center">
            User <span className="text-[#39ff14]">Profile</span>
          </h1>
          <p className="text-gray-500 text-xs tracking-widest uppercase mt-2">Authorized Access Granted</p>
        </div>

        <div className="space-y-8">
          <div className="space-y-2 group">
            <label className="text-[10px] font-orbitron text-gray-500 uppercase tracking-[0.2em] font-bold group-hover:text-[#39ff14] transition-colors">Tactical Handle (Name)</label>
            <div className="flex items-center gap-4 bg-black border border-white/10 p-4 transition-all group-hover:border-[#39ff14]/30">
              <User size={18} className="text-[#39ff14]/50" />
              <span className="text-white font-orbitron uppercase tracking-wide">{user.displayName || "Unknown Operative"}</span>
            </div>
          </div>

          <div className="space-y-2 group">
            <label className="text-[10px] font-orbitron text-gray-500 uppercase tracking-[0.2em] font-bold group-hover:text-[#39ff14] transition-colors">Communication Link (Email)</label>
            <div className="flex items-center gap-4 bg-black border border-white/10 p-4 transition-all group-hover:border-[#39ff14]/30">
              <Mail size={18} className="text-[#39ff14]/50" />
              <span className="text-white font-mono">{user.email}</span>
            </div>
          </div>

          <div className="space-y-2 group">
            <label className="text-[10px] font-orbitron text-gray-500 uppercase tracking-[0.2em] font-bold group-hover:text-[#39ff14] transition-colors">System ID (UID)</label>
            <div className="flex items-center gap-4 bg-black border border-white/10 p-4 transition-all group-hover:border-[#39ff14]/30">
              <Fingerprint size={18} className="text-[#39ff14]/50" />
              <span className="text-gray-400 font-mono text-xs">{user.uid}</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-[9px] font-orbitron text-gray-600 uppercase tracking-[0.4em]">Account security maintained by Gamerz Kit Central</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
