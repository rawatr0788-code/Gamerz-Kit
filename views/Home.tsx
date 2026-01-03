
import React, { useEffect, useState, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Product } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Loader2, AlertCircle, RefreshCw, Maximize2, Radio, Cpu, Wifi, ShieldCheck, Terminal, Fingerprint } from 'lucide-react';

const HERO_ASSETS = {
  VIDEO: "https://res.cloudinary.com/dzrngvx33/video/upload/v1767371110/49ayvgb13nrmw0cvf1tsyn2ca0_result_.realesrgan.1_xbaz45.mkv",
  NAME_IMAGE: "https://res.cloudinary.com/dzrngvx33/image/upload/v1767432536/name_kcyj65.png"
};

const BOOT_LOGS = [
  "INITIALIZING KERNEL V.2.0.4...",
  "DETECTING HARDWARE ACCELERATION...",
  "OVERCLOCKING NEURAL INTERFACE...",
  "ESTABLISHING SECURE GATEWAY...",
  "GPU: RTX 5090 ELITE DETECTED",
  "NEURAL LINK: 99% SYNC",
  "ENCRYPTION: QUANTUM AES-1024",
  "SCANNING FOR OPERATIVE BIOMETRICS..."
];

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBoot, setShowBoot] = useState(false);
  const [bootPhase, setBootPhase] = useState(0); // 0: Logs, 1: Biometric, 2: Access
  const [hasInteracted, setHasInteracted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const bootComplete = localStorage.getItem('gk_boot_v2');
    
    if (!bootComplete) {
      setShowBoot(true);
      runBootSequence();
    } else {
      setHasInteracted(true);
    }
    fetchProducts();
  }, []);

  const runBootSequence = async () => {
    // Phase 0: Terminal Logs
    for (let i = 0; i < BOOT_LOGS.length; i++) {
      await new Promise(r => setTimeout(r, 150));
      setBootPhase(i);
    }
    // Phase 1: Show Fingerprint after logs
    await new Promise(r => setTimeout(r, 500));
    setBootPhase(100); // Trigger Biometric UI
  };

  const handleAccess = () => {
    localStorage.setItem('gk_boot_v2', 'true');
    setBootPhase(200); // Trigger Access Granted
    setTimeout(() => {
      setShowBoot(false);
      setHasInteracted(true);
    }, 1000);
  };

  const fetchProducts = async () => {
    setInventoryLoading(true);
    setInventoryError(false);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      fetched.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setProducts(fetched);
    } catch (err) {
      console.error("Inventory fetch failed", err);
      setInventoryError(true);
    } finally {
      setInventoryLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="relative min-h-screen bg-[#050505]">
      {/* CINEMATIC BOOT INTERFACE */}
      <AnimatePresence>
        {showBoot && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -100, filter: "blur(20px)" }}
            className="fixed inset-0 z-[200] bg-[#050505] flex flex-col items-center justify-center p-6 overflow-hidden"
          >
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />

            <div className="relative z-10 w-full max-w-lg">
              {/* Terminal Logs View */}
              {bootPhase < 100 && (
                <div className="space-y-1 mb-8">
                  {BOOT_LOGS.slice(0, bootPhase + 1).map((log, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="font-mono text-[9px] md:text-xs text-[#39ff14] flex items-center gap-2"
                    >
                      <span className="opacity-40">[{new Date().toLocaleTimeString()}]</span>
                      <span className="tracking-widest uppercase">{log}</span>
                    </motion.div>
                  ))}
                  <motion.div 
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-2 h-4 bg-[#39ff14] inline-block"
                  />
                </div>
              )}

              {/* Biometric UI */}
              {bootPhase >= 100 && bootPhase < 200 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAccess}
                    className="relative group cursor-pointer"
                  >
                    {/* Pulsing Circles */}
                    <div className="absolute inset-0 rounded-full border border-[#39ff14]/20 animate-ping" />
                    <div className="absolute inset-0 rounded-full border-2 border-[#39ff14]/10 animate-pulse" />
                    
                    <div className="w-40 h-40 rounded-full border border-[#39ff14]/30 flex items-center justify-center bg-black/50 backdrop-blur-md relative overflow-hidden group-hover:border-[#39ff14] transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#39ff14]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Fingerprint size={64} className="text-[#39ff14] drop-shadow-[0_0_15px_rgba(57,255,20,0.5)] group-hover:scale-110 transition-transform" />
                    </div>
                  </motion.div>
                  
                  <div className="mt-8 text-center space-y-4">
                    <h2 className="font-orbitron text-white text-lg tracking-[0.6em] uppercase font-light">Identity_Check</h2>
                    <p className="font-orbitron text-[8px] text-[#39ff14]/60 tracking-[0.4em] uppercase">Press to synchronize neural link</p>
                  </div>
                </motion.div>
              )}

              {/* Access Granted */}
              {bootPhase >= 200 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#39ff14] text-black mb-6 shadow-[0_0_40px_#39ff14]"
                  >
                    <ShieldCheck size={48} />
                  </motion.div>
                  <h1 className="font-orbitron text-4xl font-black text-white tracking-tighter uppercase mb-2">ACCESS GRANTED</h1>
                  <p className="font-mono text-[#39ff14] text-xs uppercase tracking-[0.5em]">Linking to arsenal satellite...</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={hasInteracted ? { opacity: 1 } : {}}
        transition={{ duration: 1.2 }}
        className="relative min-h-[70vh] w-full flex flex-col lg:flex-row items-center justify-center px-4 lg:px-20 py-4 gap-6 lg:gap-12 overflow-hidden"
      >
        {/* Left Side: Content */}
        <div className="relative z-10 w-full lg:w-5/12 flex flex-col items-center lg:items-start text-center lg:text-left">
          <motion.img 
            initial={{ opacity: 0, x: -30 }}
            animate={hasInteracted ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, delay: 0.3 }}
            src={HERO_ASSETS.NAME_IMAGE} 
            alt="Gamerz Kit" 
            className="w-full max-w-xs drop-shadow-[0_0_20px_rgba(57,255,20,0.2)] mb-4 lg:mb-6"
          />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={hasInteracted ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="space-y-3 max-w-sm"
          >
            <div className="flex items-center justify-center lg:justify-start gap-3 text-[#39ff14] font-orbitron text-[8px] font-bold tracking-[0.4em] uppercase">
              <span className="h-px w-5 bg-[#39ff14]" /> Operative Access Enabled
            </div>
            <p className="text-gray-400 text-xs md:text-sm font-light leading-relaxed font-orbitron tracking-tight">
              Verified performance. Tactical superiority. The world's most elite gaming hardware, curated for high-stakes competition.
            </p>
            
            <div className="pt-4">
              <a 
                href="#shop" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative inline-flex items-center gap-3 bg-[#39ff14] text-black px-6 py-3 font-orbitron font-black text-[10px] uppercase tracking-[0.2em] overflow-hidden transition-all hover:pr-10"
              >
                Enter Arsenal <ArrowRight className="absolute right-3 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" size={14} />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Right Side: THE TACTICAL VIEWPORT */}
        <div className="w-full lg:w-5/12 max-w-md relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, rotateY: 20 }}
            animate={hasInteracted ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="relative group"
          >
            <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t border-l border-[#39ff14] z-20" />
            <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b border-r border-[#39ff14] z-20" />
            
            <div className="relative aspect-video overflow-hidden bg-black border border-white/5 shadow-[0_0_20px_rgba(57,255,20,0.05)]">
              <video 
                ref={videoRef}
                muted 
                loop 
                playsInline 
                autoPlay={hasInteracted}
                className={`w-full h-full object-cover grayscale-[0.3] brightness-[0.7] group-hover:brightness-100 transition-all duration-1000 ${hasInteracted ? 'opacity-100' : 'opacity-0'}`}
              >
                <source src={HERO_ASSETS.VIDEO} type="video/mp4" />
              </video>
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-10" />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* INVENTORY SECTION */}
      <section id="shop" className="max-w-[1440px] mx-auto px-4 py-16 scroll-mt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-px w-6 bg-[#39ff14]" />
              <span className="text-[#39ff14] font-orbitron text-[7px] font-bold tracking-[0.4em] uppercase">Inventory Feed</span>
            </div>
            <h2 className="font-orbitron text-2xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none">
              The <span className="text-[#39ff14]">Arsenal</span>
            </h2>
          </div>

          <div className="relative group min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#39ff14] transition-colors" size={12} />
            <input 
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-none py-2.5 pl-9 pr-4 outline-none focus:border-[#39ff14]/50 focus:bg-white/10 transition-all w-full text-[10px] font-orbitron tracking-wider text-white"
            />
          </div>
        </div>

        {inventoryLoading && products.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/5 bg-white/5">
            <Loader2 className="text-[#39ff14] animate-spin mb-3" size={24} />
            <p className="font-orbitron text-gray-600 text-[7px] uppercase tracking-[0.5em] animate-pulse">Establishing Connection...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.02,
                    type: "spring",
                    stiffness: 260,
                    damping: 20
                  }}
                  className="group relative"
                >
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="relative aspect-square overflow-hidden bg-black border border-white/10 group-hover:border-[#39ff14] transition-all duration-300 shadow-[0_0_0_rgba(57,255,20,0)] group-hover:shadow-[0_0_20px_rgba(57,255,20,0.2)]">
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover grayscale-[0.1] group-hover:grayscale-0 transition-all duration-700" />
                      <div className="absolute top-0 right-0 bg-[#39ff14] text-black px-2 py-1 font-orbitron font-black text-[8px] z-10">
                        ₹{product.price}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    </div>
                    
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-[#39ff14]/50 group-hover:bg-[#39ff14] transition-colors" />
                        <h3 className="font-orbitron text-[11px] font-bold text-white group-hover:text-[#39ff14] transition-colors leading-none truncate uppercase tracking-tight">
                          {product.name}
                        </h3>
                      </div>
                      <div className="flex gap-1">
                        {product.tags.slice(0, 1).map(tag => (
                          <span key={tag} className="text-[6px] font-orbitron font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-[#39ff14]/60 transition-colors">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="bg-black py-12 px-4 border-t border-white/5 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
          <img src={HERO_ASSETS.NAME_IMAGE} alt="Logo" className="h-4 opacity-10 grayscale brightness-200" />
          <p className="text-gray-800 text-[5px] tracking-[0.5em] uppercase font-orbitron">Gamerz_Kit // 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
