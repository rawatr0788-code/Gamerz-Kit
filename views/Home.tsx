
import React, { useEffect, useState, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Product } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Loader2, AlertCircle, RefreshCw, Maximize2, Radio, Cpu, Wifi, ShieldCheck, Terminal, Zap, Activity, Signal, Target, Waves, Crosshair, BarChart3 } from 'lucide-react';

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
  "READY FOR OPERATIVE INPUT..."
];

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBoot, setShowBoot] = useState(false);
  const [bootPhase, setBootPhase] = useState(0); 
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

  // Robust video playback handler
  useEffect(() => {
    const playVideo = async () => {
      if (hasInteracted && videoRef.current) {
        try {
          // Reset time if it somehow got stuck at the end
          if (videoRef.current.ended) videoRef.current.currentTime = 0;
          await videoRef.current.play();
        } catch (e) {
          console.log("Playback retry required:", e);
        }
      }
    };
    
    playVideo();
    const interval = setInterval(playVideo, 5000); // Heartbeat to ensure playback
    return () => clearInterval(interval);
  }, [hasInteracted]);

  const runBootSequence = async () => {
    for (let i = 0; i < BOOT_LOGS.length; i++) {
      await new Promise(r => setTimeout(r, 120));
      setBootPhase(i);
    }
    await new Promise(r => setTimeout(r, 500));
    setBootPhase(100); 
  };

  const handleAccess = () => {
    localStorage.setItem('gk_boot_v2', 'true');
    setBootPhase(200); 
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
    (p.tags && p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))
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
            <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />

            <div className="relative z-10 w-full max-w-lg">
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

              {/* CORE ACTIVATION UI */}
              {bootPhase >= 100 && bootPhase < 200 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="flex items-center gap-3 mb-10">
                    <motion.div 
                      animate={{ opacity: [1, 0, 1], scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-[#39ff14] shadow-[0_0_8px_#39ff14]"
                    />
                    <span className="font-orbitron text-[10px] text-[#39ff14] font-black uppercase tracking-[0.4em]">Satellite Lock: Active</span>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAccess}
                    className="relative group cursor-pointer border-none bg-transparent p-0 outline-none"
                  >
                    <div className="absolute -inset-10 rounded-full border border-[#39ff14]/10 animate-pulse" />
                    <div className="absolute -inset-6 rounded-full border border-[#39ff14]/20 animate-ping opacity-30" />
                    
                    {/* Rotating Tech Rings */}
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="absolute -inset-3 rounded-full border-t-2 border-[#39ff14]/40" 
                    />
                    <motion.div 
                      animate={{ rotate: -360 }}
                      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                      className="absolute -inset-2 rounded-full border-l-2 border-r-2 border-[#39ff14]/20" 
                    />
                    
                    <div className="w-48 h-48 rounded-full border-2 border-[#39ff14]/50 flex flex-col items-center justify-center bg-black relative overflow-hidden group-hover:border-[#39ff14] transition-all duration-500 shadow-[0_0_30px_rgba(57,255,20,0.1)] group-hover:shadow-[0_0_50px_rgba(57,255,20,0.3)]">
                      <motion.div 
                        animate={{ top: ['-10%', '110%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-[#39ff14]/20 blur-sm pointer-events-none"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-[#39ff14]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <Cpu size={60} className="text-[#39ff14] drop-shadow-[0_0_15px_rgba(57,255,20,0.5)] group-hover:scale-110 transition-transform duration-500 mb-2" />
                      
                      <div className="text-center">
                        <span className="block font-orbitron text-[9px] font-black text-[#39ff14] uppercase tracking-[0.2em]">Link Core</span>
                      </div>
                    </div>
                  </motion.button>
                  
                  <div className="mt-14 text-center space-y-4">
                    <motion.div 
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <h2 className="font-orbitron text-white text-base tracking-[0.5em] uppercase font-bold">CLICK TO INITIALIZE</h2>
                      <div className="flex gap-1.5 items-end h-4">
                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                          <motion.div 
                            key={i}
                            animate={{ height: [4, 16, 4] }}
                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.08 }}
                            className="w-1 bg-[#39ff14] rounded-full shadow-[0_0_5px_#39ff14]"
                          />
                        ))}
                      </div>
                    </motion.div>
                    <p className="font-orbitron text-[8px] text-gray-500 tracking-[0.3em] uppercase">Neural link synchronized // Global logistics online</p>
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
        className="relative min-h-[70vh] w-full flex flex-col lg:flex-row items-center justify-center px-4 lg:px-20 py-10 gap-6 lg:gap-12 overflow-hidden"
      >
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
            className="space-y-4 max-w-sm"
          >
            <div className="flex items-center justify-center lg:justify-start gap-3 text-[#39ff14] font-orbitron text-[8px] font-bold tracking-[0.4em] uppercase">
              <Activity size={12} className="animate-pulse" /> Operative Access Enabled
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
                className="group relative inline-flex items-center gap-3 bg-[#39ff14] text-black px-8 py-4 font-orbitron font-black text-[10px] uppercase tracking-[0.2em] overflow-hidden transition-all hover:pr-12"
              >
                Enter Arsenal <ArrowRight className="absolute right-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" size={14} />
              </a>
            </div>
          </motion.div>
        </div>

        {/* THE TACTICAL VIEWPORT UPGRADED */}
        <div className="w-full lg:w-5/12 max-w-lg relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, rotateY: 20 }}
            animate={hasInteracted ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="relative group perspective-1000"
          >
            {/* Animated HUD Brackets */}
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2 border-[#39ff14] z-20" />
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} className="absolute -top-3 -right-3 w-8 h-8 border-t-2 border-r-2 border-[#39ff14] z-20" />
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 1 }} className="absolute -bottom-3 -left-3 w-8 h-8 border-b-2 border-l-2 border-[#39ff14] z-20" />
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 1.5 }} className="absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2 border-[#39ff14] z-20" />
            
            <div className="relative aspect-video overflow-hidden bg-black border border-white/5 shadow-[0_0_50px_rgba(57,255,20,0.1)] group-hover:shadow-[0_0_80px_rgba(57,255,20,0.2)] transition-shadow duration-700">
              <video 
                ref={videoRef}
                muted 
                loop 
                playsInline 
                autoPlay 
                className={`w-full h-full object-cover grayscale-[0.2] brightness-[0.8] group-hover:brightness-100 group-hover:grayscale-0 transition-all duration-1000 ${hasInteracted ? 'opacity-100' : 'opacity-0'}`}
              >
                <source src={HERO_ASSETS.VIDEO} type="video/mp4" />
              </video>
              
              {/* INTERACTIVE HUD OVERLAY */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] opacity-30" />
                
                {/* Top Left: Live Status */}
                <div className="absolute top-4 left-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_red]" />
                    <span className="text-[#39ff14] font-mono text-[9px] font-bold uppercase tracking-widest">Live Feed // Channel 01</span>
                  </div>
                  <span className="text-white/40 font-mono text-[7px] uppercase tracking-tighter">Lat: 34.0522 // Long: -118.2437</span>
                </div>

                {/* Center: Targeting Reticle */}
                <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-80 transition-opacity">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="relative">
                     <Target className="text-[#39ff14]" size={80} strokeWidth={0.5} />
                     <motion.div className="absolute inset-0 border border-[#39ff14]/20 rounded-full scale-150" />
                  </motion.div>
                </div>

                {/* Bottom Left: Waveforms & REC */}
                <div className="absolute bottom-4 left-4 flex flex-col gap-3">
                  <div className="flex items-end gap-1 h-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <motion.div 
                        key={i}
                        animate={{ height: [2, Math.random() * 20 + 4, 2] }}
                        transition={{ repeat: Infinity, duration: 0.4, delay: i * 0.05 }}
                        className="w-1 bg-[#39ff14]/60 shadow-[0_0_5px_rgba(57,255,20,0.3)]"
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2 py-1 border border-white/10">
                    <Radio size={10} className="text-[#39ff14] animate-pulse" />
                    <span className="text-[#39ff14] font-mono text-[8px] uppercase tracking-widest font-bold">Signal: Synchronized</span>
                  </div>
                </div>

                {/* Bottom Right: Data Stream */}
                <div className="absolute bottom-4 right-4 text-right">
                  <div className="font-mono text-[7px] text-[#39ff14]/60 space-y-0.5">
                    <p>SYSTEM_CORE: OVERCLOCKED</p>
                    <p>MEMORY_SYNC: 98.4%</p>
                    <p>TEMP: 24°C // OPTIMAL</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* INVENTORY SECTION */}
      <section id="shop" className="max-w-[1440px] mx-auto px-4 py-16 scroll-mt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-px w-8 bg-[#39ff14]" />
              <span className="text-[#39ff14] font-orbitron text-[7px] font-bold tracking-[0.5em] uppercase">Inventory Feed</span>
            </div>
            <h2 className="font-orbitron text-2xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
              The <span className="text-[#39ff14]">Arsenal</span>
            </h2>
          </div>

          <div className="relative group min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#39ff14] transition-colors" size={14} />
            <input 
              type="text"
              placeholder="Search gear inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-none py-3.5 pl-11 pr-4 outline-none focus:border-[#39ff14]/50 focus:bg-white/10 transition-all w-full text-[10px] font-orbitron tracking-widest text-white uppercase"
            />
          </div>
        </div>

        {inventoryLoading && products.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center border border-dashed border-white/5 bg-white/2">
            <Loader2 className="text-[#39ff14] animate-spin mb-4" size={32} />
            <p className="font-orbitron text-gray-600 text-[8px] uppercase tracking-[0.6em] animate-pulse">Establishing Satellite Connection...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 md:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.03,
                    type: "spring",
                    stiffness: 200,
                    damping: 18
                  }}
                  className="group relative"
                >
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="relative aspect-square overflow-hidden bg-black border border-white/10 group-hover:border-[#39ff14] transition-all duration-500 shadow-[0_0_0_rgba(57,255,20,0)] group-hover:shadow-[0_0_30px_rgba(57,255,20,0.15)]">
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000" />
                      <div className="absolute top-0 right-0 bg-[#39ff14] text-black px-3 py-1.5 font-orbitron font-black text-[9px] z-10">
                        ₹{product.price}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70 group-hover:opacity-40 transition-opacity" />
                    </div>
                    
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14]/30 group-hover:bg-[#39ff14] transition-colors" />
                        <h3 className="font-orbitron text-[12px] font-bold text-white group-hover:text-[#39ff14] transition-colors leading-none truncate uppercase tracking-tight">
                          {product.name}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        {product.tags && product.tags.slice(0, 1).map(tag => (
                          <span key={tag} className="text-[7px] font-orbitron font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-[#39ff14]/80 transition-colors">
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
      <footer className="bg-black py-16 px-4 border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <img src={HERO_ASSETS.NAME_IMAGE} alt="Logo" className="h-5 opacity-10 grayscale brightness-200" />
          <div className="flex gap-8">
            <span className="text-gray-800 text-[6px] tracking-[0.5em] uppercase font-orbitron">Secured_Network</span>
            <span className="text-gray-800 text-[6px] tracking-[0.5em] uppercase font-orbitron">Global_Logistics</span>
            <span className="text-gray-800 text-[6px] tracking-[0.5em] uppercase font-orbitron">2025_Division</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
