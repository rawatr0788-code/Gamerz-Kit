
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [receiverName, setReceiverName] = useState('');
  const [utr, setUtr] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [proof, setProof] = useState<File | null>(null);

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
        amount: product!.price,
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
  if (!product) return <div className="text-center py-20 text-red-500">Gear not found.</div>;

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/5 border border-white/10 p-12 space-y-6"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-[#39ff14]/20 rounded-full text-[#39ff14] mb-4">
            <CheckCircle2 size={64} />
          </div>
          <h1 className="font-orbitron text-4xl font-black text-white uppercase tracking-tighter">Transmission Successful</h1>
          <p className="text-gray-400 text-lg">Your acquisition request is being processed by Central Command. Verifying payment status now.</p>
          <div className="flex gap-4 justify-center pt-6">
            <button 
              onClick={() => navigate('/orders')}
              className="bg-[#39ff14] text-black font-orbitron font-bold px-8 py-3 uppercase tracking-widest hover:brightness-110 transition-all"
            >
              Check Order Status
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-10">
          <div>
            <h1 className="font-orbitron text-3xl font-black text-white uppercase tracking-tighter mb-4">
              Phase 1 : <span className="text-[#39ff14]">Secure Payment</span>
            </h1>
            <p className="text-gray-400 leading-relaxed">
              Scan the unique encrypted gateway below to finalize your acquisition of the <span className="text-[#39ff14] font-bold">{product.name}</span>. Total due: <span className="text-[#39ff14] font-bold">₹{product.price}</span>.
            </p>
          </div>

          <div className="mx-auto max-w-sm">
            <div className="bg-black border border-white/10 p-4">
              <img src={product.qrCodeUrl} alt="Payment QR" className="w-full aspect-square object-contain" />
              <div className="mt-4 flex items-center justify-center gap-2 text-[#39ff14] font-orbitron text-[10px] tracking-[0.3em] uppercase">
                <QrCode size={14} /> take screenshot and scan
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 flex items-start gap-4">
            <ShieldCheck className="text-[#39ff14] shrink-0" size={24} />
            <div className="text-xs text-gray-400 leading-relaxed uppercase tracking-wider">
              <p className="font-bold text-white mb-1">Encrypted Gateway Active</p>
              Your transaction is secured by AES-256 end-to-end encryption. Any fraudulent activity will be flagged and reported to network security.
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div>
            <h2 className="font-orbitron text-3xl font-black text-white uppercase tracking-tighter mb-4">
              Phase 2 : <span className="text-[#39ff14]">Proof & Delivery</span>
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Complete your profile for shipping and upload your transaction receipt.
            </p>
          </div>

          <form onSubmit={handleSubmitOrder} className="bg-white/5 border border-white/10 p-8 space-y-6">
            <div className="space-y-4">
              <label className="block text-xs font-orbitron text-white uppercase tracking-widest font-bold">Receiver's Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  required
                  type="text" 
                  placeholder="The person receiving the gear" 
                  value={receiverName}
                  onChange={e => setReceiverName(e.target.value)}
                  className="w-full bg-black border border-white/10 p-4 pl-12 text-sm focus:border-[#39ff14] outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-orbitron text-white uppercase tracking-widest font-bold">Shipping Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-gray-500" size={18} />
                <textarea 
                  required
                  rows={3}
                  placeholder="Street, City, Zip Code, Landmark" 
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full bg-black border border-white/10 p-4 pl-12 text-sm focus:border-[#39ff14] outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-orbitron text-white uppercase tracking-widest font-bold">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  required
                  type="tel" 
                  placeholder="Ex: +91 9876543210" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-black border border-white/10 p-4 pl-12 text-sm focus:border-[#39ff14] outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-orbitron text-white uppercase tracking-widest font-bold">Transaction / UTR ID</label>
              <input 
                required
                type="text" 
                placeholder="Ex: 123456789012" 
                value={utr}
                onChange={e => setUtr(e.target.value)}
                className="w-full bg-black border border-white/10 p-4 font-mono text-sm focus:border-[#39ff14] outline-none transition-all"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-orbitron text-white uppercase tracking-widest font-bold">Payment Screenshot</label>
              <div className="relative border-2 border-dashed border-white/10 hover:border-[#39ff14]/50 transition-colors p-6 text-center cursor-pointer group">
                <input 
                  required
                  type="file" 
                  accept="image/*"
                  onChange={e => setProof(e.target.files ? e.target.files[0] : null)}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="space-y-2">
                  <div className="mx-auto w-10 h-10 bg-white/5 flex items-center justify-center rounded-full group-hover:text-[#39ff14] transition-colors">
                    <Upload size={20} />
                  </div>
                  <div className="text-sm">
                    {proof ? (
                      <span className="text-[#39ff14] font-bold">{proof.name}</span>
                    ) : (
                      <span className="text-white font-bold">Click to upload receipt</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={submitting}
              className="w-full bg-[#39ff14] text-black font-orbitron font-black text-xl py-6 uppercase tracking-tighter hover:brightness-110 transition-all disabled:opacity-50"
            >
              {submitting ? 'PROCESSING SIGNAL...' : 'FINALIZE ACQUISITION'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
