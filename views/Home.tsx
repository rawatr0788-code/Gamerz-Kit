
import React, { useEffect, useState, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Product } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Loader2, Radio, Cpu, ShieldCheck, Activity, Target, Waves, BarChart3, Signal } from 'lucide-react';

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

  useEffect(() => {
    const playVideo = async () => {
      if (hasInteracted && videoRef.current) {
        try {
          if (videoRef.current.paused) {
            await videoRef.current.play();
          }
        } catch (e) {}
      }
    };
    playVideo();
    const interval = setInterval(playVideo, 3000); 
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
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      fetched.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setProducts(fetched);
    } catch (err) {
      console.error(err);
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
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="font-mono text-[9px] md:text-xs text-[#39ff14] flex items-center gap-2">
                      <span className="opacity-40">[{new Date().toLocaleTimeString()}]</span>
                      <span className="tracking-widest uppercase">{log}</span>
                    </motion.div>
                  ))}
                  <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-4 bg-[#39ff14] inline-block" />
                </div>
              )}
              {bootPhase >= 100 && bootPhase < 200 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                  <div className="flex items-center gap-3 mb-12">
                    <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-2 h-2 rounded-full bg-[#39ff14] shadow-[0_0_8px_#39ff14]" />
                    <span className="font-rajdhani text-[10px] text-[#39ff14] font-bold uppercase tracking-[0.4em]">System Link Standby</span>
                  </div>
                  
                  {/* REVERTED TO CIRCULAR BOUNDARY */}
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAccess} className="relative group cursor-pointer border-none bg-transparent p-0 outline-none">
                    <div className="absolute -inset-8 rounded-full border border-[#39ff14]/10 animate-pulse" />
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      className="absolute -inset-4 rounded-full border-t border-b border-[#39ff14]/20"
                    />
                    <div className="w-48 h-48 rounded-full border border-[#39ff14]/40 flex flex-col items-center justify-center bg-black/50 backdrop-blur-md relative overflow-hidden group-hover:border-[#39ff14] transition-all shadow-[0_0_40px_rgba(57,255,20,0.1)] group-hover:shadow-[0_0_60px_rgba(57,255,20,0.2)]">
                      <motion.div animate={{ top: ['-10%', '110%'] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute left-0 right-0 h-1 bg-[#39ff14]/30 blur-sm" />
                      <Cpu size={56} className="text-[#39ff14] mb-3" />
                      <span className="block font-michroma text-[10px] font-black text-[#39ff14] uppercase tracking-[0.3em]">Initialize</span>
                    </div>
                  </motion.button>

                  <div className="mt-16 text-center space-y-5">
                    <h2 className="font-rajdhani text-white text-lg tracking-[0.6em] uppercase font-bold">READY TO DEPLOY</h2>
                  </div>
                </motion.div>
              )}
              {bootPhase >= 200 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                  <ShieldCheck size={48} className="text-[#39ff14] mx-auto mb-6 drop-shadow-[0_0_20px_#39ff14]" />
                  <h1 className="font-rajdhani text-4xl font-black text-white tracking-tighter uppercase mb-2">ACCESS GRANTED</h1>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.section initial={{ opacity: 0 }} animate={hasInteracted ? { opacity: 1 } : {}} className="relative min-h-[70vh] w-full flex flex-col lg:flex-row items-center justify-center px-4 lg:px-20 py-10 gap-12 overflow-hidden">
        <div className="relative z-10 w-full lg:w-5/12 flex flex-col items-center lg:items-start text-center lg:text-left">
          <motion.img initial={{ opacity: 0, x: -30 }} animate={hasInteracted ? { opacity: 1, x: 0 } : {}} src={HERO_ASSETS.NAME_IMAGE} alt="Gamerz Kit" className="w-full max-w-xs mb-6" />
          <div className="space-y-4 max-w-sm">
            <p className="text-gray-400 text-sm leading-relaxed font-rajdhani font-medium tracking-wide uppercase">
              Elite hardware. Tactical superiority. Verified competition gear.
            </p>
            <div className="pt-4">
              <a href="#shop" onClick={(e) => { e.preventDefault(); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="group relative inline-flex items-center gap-3 bg-[#39ff14] text-black px-8 py-4 font-michroma font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:pr-12">
                Arsenal Feed <ArrowRight className="absolute right-4 opacity-0 group-hover:opacity-100" size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* RESTORED ANIMATION COMPONENTS IN VIDEO */}
        <div className="w-full lg:w-5/12 max-w-lg relative">
          <div className="relative aspect-video overflow-hidden bg-black border border-white/5 shadow-[0_0_40px_rgba(57,255,20,0.1)]">
            <video ref={videoRef} muted loop playsInline autoPlay onEnded={() => videoRef.current?.play()} className={`w-full h-full object-cover grayscale-[0.2] brightness-[0.8] ${hasInteracted ? 'opacity-100' : 'opacity-0'}`}>
              <source src={HERO_ASSETS.VIDEO} type="video/mp4" />
            </video>
            
            {/* HUD LAYER */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] opacity-20" />
              
              {/* Top Left: Live Status Restoration */}
              <div className="absolute top-4 left-4 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_5px_red]" />
                  <span className="text-[#39ff14] font-mono text-[8px] font-bold uppercase tracking-widest">Signal_Live // Feed_01</span>
                </div>
                <span className="text-white/30 font-mono text-[6px] uppercase tracking-tighter">LAT: 34.05 / LONG: -118.24</span>
              </div>

              {/* Bottom Left: Waveform Restoration */}
              <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                <div className="flex items-end gap-1 h-5">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <motion.div 
                      key={i}
                      animate={{ height: [1, Math.random() * 16 + 2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.4, delay: i * 0.05 }}
                      className="w-0.5 bg-[#39ff14]/60"
                    />
                  ))}
                </div>
                <div className="bg-black/60 backdrop-blur-md px-2 py-1 border border-white/10 flex items-center gap-2">
                  <Radio size={8} className="text-[#39ff14] animate-pulse" />
                  <span className="text-[#39ff14] font-mono text-[7px] uppercase tracking-widest font-black">Sync: Active</span>
                </div>
              </div>

              {/* Bottom Right: Data Telemetry Restoration */}
              <div className="absolute bottom-4 right-4 text-right">
                <div className="font-mono text-[6px] text-[#39ff14]/40 space-y-0.5">
                  <p>CPU_LINK: STABLE</p>
                  <p>BUFFER: 94.2%</p>
                  <p>TEMP: 22°C</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <section id="shop" className="max-w-[1440px] mx-auto px-4 py-16 scroll-mt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="font-rajdhani text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
              The <span className="text-[#39ff14]">Arsenal</span>
            </h2>
          </div>
          <div className="relative group min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#39ff14]" size={14} />
            <input type="text" placeholder="Search gear..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-none py-3.5 pl-11 pr-4 outline-none focus:border-[#39ff14] w-full text-[10px] font-michroma text-white uppercase" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
          {filteredProducts.map((product, index) => (
            <motion.div key={product.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -5 }} className="group">
              <Link to={`/product/${product.id}`} className="block">
                <div className="relative aspect-square bg-black border border-white/10 group-hover:border-[#39ff14] transition-all">
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0" />
                  <div className="absolute top-0 right-0 bg-[#39ff14] text-black px-3 py-1 font-rajdhani font-black text-xs">₹{product.price}</div>
                </div>
                <div className="mt-4">
                  <h3 className="font-rajdhani text-lg font-bold text-white uppercase tracking-tight group-hover:text-[#39ff14]">{product.name}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
