
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Product } from '../types';
import { motion } from 'framer-motion';
import { QrCode, Upload, ShieldCheck, CheckCircle2, Phone, MapPin, User as UserIcon } from 'lucide-react';
import { uploadToCloudinary } from '../services/cloudinary';
import LoadingSpinner from '../components/LoadingSpinner';

const Checkout: React.FC<{ user: any }> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [receiverName, setReceiverName] = useState('');
  const [utr, setUtr] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [proof, setProof] = useState<File | null>(null);

  const queryParams = new URLSearchParams(location.search);
  const quantity = parseInt(queryParams.get('qty') || '1');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchProduct = async () => {
      if (!id) return;
      const snap = await getDoc(doc(db, 'products', id));
      if (snap.exists()) setProduct({ id: snap.id, ...snap.data() } as Product);
      setLoading(false);
    };
    fetchProduct();
  }, [id, user]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proof || !utr || !phone || !address || !receiverName) return alert("All fields are required");

    setSubmitting(true);
    try {
      const screenshotUrl = await uploadToCloudinary(proof);
      await addDoc(collection(db, 'orders'), {
        productId: product!.id,
        productName: product!.name,
        amount: product!.price * quantity,
        quantity,
        userId: user.uid,
        userName: user.displayName || 'Anonymous User',
        receiverName,
        userEmail: user.email,
        phone,
        address,
        utr,
        screenshotUrl,
        status: 'pending',
        createdAt: Date.now()
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Submission failed. Check your network.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!product) return <div className="text-center py-20 text-red-500 font-rajdhani">Gear not found.</div>;

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/5 border border-white/10 p-12 space-y-6">
          <CheckCircle2 size={64} className="text-[#39ff14] mx-auto mb-4" />
          <h1 className="font-rajdhani text-4xl font-black text-white uppercase tracking-tighter">Transmission Successful</h1>
          <p className="text-gray-400 text-lg font-rajdhani">Order for {quantity} units registered. Verifying signal...</p>
          <button onClick={() => navigate('/orders')} className="bg-[#39ff14] text-black font-michroma font-bold px-8 py-3 uppercase tracking-widest text-xs">History Log</button>
        </motion.div>
      </div>
    );
  }

  const totalAmount = product.price * quantity;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 font-rajdhani">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-10">
          <div>
            <h1 className="font-rajdhani text-4xl font-black text-white uppercase tracking-tighter mb-4">Phase 1: <span className="text-[#39ff14]">Acquisition</span></h1>
            <div className="p-6 bg-white/5 border border-white/10 mb-6">
              <h3 className="text-white font-bold text-xl mb-2">{product.name}</h3>
              <div className="flex justify-between text-gray-400 font-michroma text-[10px] uppercase">
                <span>Signal Strength: {quantity} Units</span>
                <span>Total Payload: ₹{totalAmount}</span>
              </div>
            </div>
            <p className="text-gray-400">Scan the secure gateway below. Total amount required: <span className="text-[#39ff14] font-bold">₹{totalAmount}</span></p>
          </div>
          <div className="mx-auto max-w-sm"><img src={product.qrCodeUrl} className="w-full aspect-square border-4 border-white/5" alt="QR" /></div>
        </div>

        <form onSubmit={handleSubmitOrder} className="bg-white/5 border border-white/10 p-8 space-y-6">
          <h2 className="font-rajdhani text-3xl font-black text-white uppercase tracking-tighter">Phase 2: <span className="text-[#39ff14]">Signal Lock</span></h2>
          <div className="space-y-4">
            <input required placeholder="Receiver Name" value={receiverName} onChange={e => setReceiverName(e.target.value)} className="w-full bg-black border border-white/10 p-4 text-white focus:border-[#39ff14] outline-none" />
            <textarea required rows={3} placeholder="Full Shipping Address" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-black border border-white/10 p-4 text-white focus:border-[#39ff14] outline-none" />
            <input required placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-black border border-white/10 p-4 text-white focus:border-[#39ff14] outline-none" />
            <input required placeholder="Transaction / UTR ID" value={utr} onChange={e => setUtr(e.target.value)} className="w-full bg-black border border-white/10 p-4 text-white focus:border-[#39ff14] outline-none font-mono" />
            <div className="relative border-2 border-dashed border-white/10 p-6 text-center cursor-pointer hover:border-[#39ff14]">
              <input required type="file" accept="image/*" onChange={e => setProof(e.target.files ? e.target.files[0] : null)} className="absolute inset-0 opacity-0 cursor-pointer" />
              <div className="text-gray-500 uppercase text-xs font-michroma">{proof ? proof.name : "Upload Payment Receipt"}</div>
            </div>
          </div>
          <button type="submit" disabled={submitting} className="w-full bg-[#39ff14] text-black font-michroma font-black text-lg py-6 uppercase hover:brightness-110 transition-all disabled:opacity-50">
            {submitting ? 'SYNCHRONIZING...' : 'COMMIT ORDER'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
