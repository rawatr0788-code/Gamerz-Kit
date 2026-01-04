
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, ADMIN_EMAIL } from '../services/firebase';
import { Product, Order } from '../types';
import { uploadToCloudinary } from '../services/cloudinary';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit3, Image as ImageIcon, ShieldCheck, RefreshCw, ExternalLink, X, Package } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard: React.FC<{ user: any }> = ({ user }) => {
  const [view, setView] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pSnap = await getDocs(collection(db, 'products'));
      const pData = pSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      pData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setProducts(pData);
      
      const oSnap = await getDocs(collection(db, 'orders'));
      const oData = oSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      oData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setOrders(oData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let imageUrls = editingProductId ? products.find(p => p.id === editingProductId)?.images || [] : [];
      if (files && files.length > 0) {
        const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file as File));
        const newImages = await Promise.all(uploadPromises);
        imageUrls = editingProductId ? [...imageUrls, ...newImages] : newImages;
      }
      const data: any = { name, price: parseFloat(price), description: desc, tags: tags ? tags.split(',').map(t => t.trim()) : [], qrCodeUrl, images: imageUrls, updatedAt: Date.now() };
      if (editingProductId) {
        await updateDoc(doc(db, 'products', editingProductId), data);
      } else {
        data.createdAt = Date.now();
        await addDoc(collection(db, 'products'), data);
      }
      fetchData();
      setEditingProductId(null);
      setName(''); setPrice(''); setDesc(''); setTags(''); setQrCodeUrl('');
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const updateStatus = async (id: string, status: any) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 font-rajdhani">
      <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-8">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Command <span className="text-[#39ff14]">Center</span></h1>
        <div className="flex gap-4">
          <button onClick={() => setView('products')} className={`px-6 py-2 uppercase text-xs font-michroma ${view === 'products' ? 'bg-[#39ff14] text-black' : 'text-gray-500'}`}>Arsenal</button>
          <button onClick={() => setView('orders')} className={`px-6 py-2 uppercase text-xs font-michroma ${view === 'orders' ? 'bg-[#39ff14] text-black' : 'text-gray-500'}`}>Signals</button>
        </div>
      </div>

      {view === 'products' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <form onSubmit={handleSubmitProduct} className="bg-white/5 p-6 border border-white/10 space-y-4">
            <h2 className="text-white font-bold uppercase mb-4">Gear Deployment</h2>
            <input required placeholder="Model Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black border border-white/10 p-3 text-white outline-none" />
            <input required placeholder="Price" type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-black border border-white/10 p-3 text-white outline-none" />
            <textarea required placeholder="Description" rows={4} value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-black border border-white/10 p-3 text-white outline-none" />
            <input placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} className="w-full bg-black border border-white/10 p-3 text-white outline-none" />
            <input required placeholder="QR URL" value={qrCodeUrl} onChange={e => setQrCodeUrl(e.target.value)} className="w-full bg-black border border-white/10 p-3 text-white outline-none" />
            <input type="file" multiple onChange={e => setFiles(e.target.files)} className="w-full text-xs text-gray-500" />
            <button type="submit" disabled={uploading} className="w-full bg-[#39ff14] text-black font-michroma font-bold py-4 uppercase text-xs">{uploading ? 'SYNCING...' : 'COMMIT'}</button>
          </form>
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white/5 p-4 border border-white/10 flex gap-4 group">
                <img src={p.images[0]} className="w-20 h-20 object-cover grayscale group-hover:grayscale-0" alt="" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold uppercase truncate">{p.name}</h3>
                  <p className="text-[#39ff14] font-michroma text-[10px]">₹{p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="bg-white/5 p-6 border border-white/10 flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-bold text-white uppercase">{o.productName} [x{o.quantity || 1}]</h3>
                <p className="text-[#39ff14] font-michroma text-xs">PAYLOAD: ₹{o.amount}</p>
                <div className="text-gray-500 text-xs font-michroma">REF: {o.id}</div>
                <div className="flex gap-2 pt-4">
                  <button onClick={() => updateStatus(o.id, 'verified')} className="bg-green-500/20 text-green-500 px-4 py-2 uppercase text-[10px] font-michroma">Verify</button>
                  <button onClick={() => updateStatus(o.id, 'rejected')} className="bg-red-500/20 text-red-500 px-4 py-2 uppercase text-[10px] font-michroma">Reject</button>
                </div>
              </div>
              <a href={o.screenshotUrl} target="_blank" rel="noreferrer" className="w-48 aspect-square bg-black border border-white/10 overflow-hidden"><img src={o.screenshotUrl} className="w-full h-full object-contain" alt="" /></a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
