
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// Fixed: Added ShieldCheck to the lucide-react imports
import { ShoppingCart, User, LogOut, Settings, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { auth, ADMIN_EMAIL } from '../services/firebase';
import { signOut } from 'firebase/auth';

const ASSETS = {
  LOGO: "https://res.cloudinary.com/dzrngvx33/image/upload/v1767431755/Change_backgrounf_to_2k_202601031442-Photoroom_yuscm4.png",
};

interface NavbarProps {
  user: any;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const isAdmin = user?.email === ADMIN_EMAIL;
  const isAdminView = location.pathname === '/admin';

  return (
    <nav className="fixed top-0 left-0 right-0 z-[110] backdrop-blur-xl bg-black/60 border-b border-white/5 px-4 py-2 md:px-8 flex items-center justify-between h-16">
      <Link to="/" className="flex items-center gap-2 group">
        <motion.img 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          src={ASSETS.LOGO} 
          alt="Gamerz Kit Logo" 
          className="h-8 md:h-10 drop-shadow-[0_0_8px_rgba(57,255,20,0.5)] group-hover:scale-110 transition-transform" 
        />
        <span className="font-orbitron font-black text-sm md:text-xl text-white tracking-tighter uppercase">
          Gamerz <span className="text-[#39ff14] drop-shadow-[0_0_10px_rgba(57,255,20,0.4)]">Kit</span>
        </span>
      </Link>

      <div className="flex items-center gap-3 md:gap-6">
        {isAdmin && !isAdminView && (
          <Link to="/admin" className="text-white/60 hover:text-[#39ff14] transition-colors p-2 rounded-full hover:bg-white/5">
            <Settings size={20} />
          </Link>
        )}
        
        {user ? (
          <div className="flex items-center gap-2 md:gap-4">
            {/* Hide cart and profile in admin view to keep it clean */}
            {!isAdminView && (
              <>
                <Link to="/orders" className="text-white/60 hover:text-[#39ff14] transition-colors p-2 rounded-full hover:bg-white/5 relative">
                  <ShoppingCart size={20} />
                </Link>
                <Link 
                  to="/profile"
                  className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-sm border border-white/10 hover:border-[#39ff14]/30 transition-all group"
                >
                  <User size={16} className="text-[#39ff14]" />
                  <span className="text-[10px] font-orbitron font-bold hidden sm:inline text-white/80">
                    {(user.displayName || user.email?.split('@')[0])?.toUpperCase()}
                  </span>
                </Link>
              </>
            )}
            
            <button 
              onClick={handleLogout}
              className="text-white/60 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-white/5"
              title="Logout"
            >
              <LogOut size={20} />
            </button>

            {isAdminView && (
              <div className="flex items-center gap-2 bg-[#39ff14]/10 px-3 py-1.5 border border-[#39ff14]/30">
                <ShieldCheck size={14} className="text-[#39ff14]" />
                <span className="text-[9px] font-orbitron font-black text-[#39ff14] uppercase tracking-widest">Admin Access</span>
              </div>
            )}
          </div>
        ) : (
          <Link 
            to="/login"
            className="bg-[#39ff14] text-black font-orbitron font-black px-5 py-2 rounded-none hover:brightness-110 transition-all text-[10px] uppercase tracking-widest"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;