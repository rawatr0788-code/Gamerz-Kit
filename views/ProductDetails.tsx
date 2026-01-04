
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Product } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Zap, Shield, Truck, ShoppingBag, Plus, Minus } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleQuantityChange = (val: number) => {
    const newQty = quantity + val;
    if (newQty >= 1 && newQty <= 99) setQuantity(newQty);
  };

  if (loading) return <LoadingSpinner />;
  if (!product) return <div className="text-center py-20 text-red-500 font-rajdhani">PRODUCT NOT FOUND</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#39ff14] transition-colors font-rajdhani text-sm uppercase tracking-widest mb-10 group">
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to arsenal
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        <div className="space-y-6">
          <div className="relative aspect-square bg-white/5 border border-white/10 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImageIndex}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                src={product.images[activeImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            
            {product.images.length > 1 && (
              <>
                <button onClick={() => setActiveImageIndex(prev => (prev === 0 ? product.images.length - 1 : prev - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full hover:bg-[#39ff14] hover:text-black transition-all"><ChevronLeft size={20} /></button>
                <button onClick={() => setActiveImageIndex(prev => (prev === product.images.length - 1 ? 0 : prev + 1))} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full hover:bg-[#39ff14] hover:text-black transition-all"><ChevronRight size={20} /></button>
              </>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, idx) => (
              <button key={idx} onClick={() => setActiveImageIndex(idx)} className={`aspect-square border-2 transition-all ${activeImageIndex === idx ? 'border-[#39ff14] scale-105' : 'border-white/10 opacity-50 hover:opacity-100'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <h1 className="font-rajdhani text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 leading-none">{product.name}</h1>
          <div className="flex items-end gap-4 mb-8">
            <span className="font-michroma text-3xl font-bold text-[#39ff14]">₹{product.price}</span>
            <span className="text-gray-500 font-rajdhani uppercase tracking-widest text-sm pb-1">Unit Signal</span>
          </div>
          <p className="text-gray-400 text-lg leading-relaxed mb-10 border-l-2 border-[#39ff14]/30 pl-6 font-rajdhani">{product.description}</p>

          <div className="mb-10 p-6 bg-white/5 border border-white/10 space-y-4">
            <label className="block font-michroma text-[9px] text-[#39ff14] uppercase tracking-widest">Adjust Allocation Quantity</label>
            <div className="flex items-center gap-6">
              <div className="flex items-center bg-black border border-white/10">
                <button onClick={() => handleQuantityChange(-1)} className="p-4 hover:text-[#39ff14] transition-colors"><Minus size={20} /></button>
                <span className="w-16 text-center font-michroma text-xl font-bold text-white border-x border-white/10 py-3">{quantity}</span>
                <button onClick={() => handleQuantityChange(1)} className="p-4 hover:text-[#39ff14] transition-colors"><Plus size={20} /></button>
              </div>
              <div className="font-rajdhani text-gray-500">
                <span className="block text-xs uppercase tracking-widest">Calculated Total</span>
                <span className="text-2xl font-black text-white">₹{product.price * quantity}</span>
              </div>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/checkout/${product.id}?qty=${quantity}`)}
            className="w-full bg-[#39ff14] text-black font-michroma font-black text-lg py-6 uppercase tracking-tighter hover:brightness-110 transition-all flex items-center justify-center gap-3"
          >
            <ShoppingBag size={24} /> Initiate Acquisition
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
