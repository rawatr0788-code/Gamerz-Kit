
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, ADMIN_EMAIL } from '../services/firebase';
import { Product, Order } from '../types';
import { uploadToCloudinary } from '../services/cloudinary';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit3, Image as ImageIcon, CheckCircle, XCircle, Package, Phone, MapPin, User as UserIcon, Loader2, AlertTriangle, ShieldCheck, RefreshCw, ExternalLink, X, Mail } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard: React.FC<{ user: any }> = ({ user }) => {
  const [view, setView] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Product Form State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log("ADMIN: SYNCHRONIZING WITH ARSENAL DATABASE...");
      const pSnap = await getDocs(collection(db, 'products'));
      const pData = pSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      pData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setProducts(pData);
      
      const oSnap = await getDocs(collection(db, 'orders'));
      const oData = oSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      oData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setOrders(oData);
      console.log("ADMIN: DATA SYNC SUCCESSFUL.");
    } catch (err: any) {
      console.error("ADMIN ERROR: FETCH FAILED", err);
      alert(`NETWORK ERROR: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingProductId(null);
    setName('');
    setPrice('');
    setDesc('');
    setTags('');
    setQrCodeUrl('');
    setFiles(null);
  };

  const handleEditClick = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProductId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setDesc(product.description);
    setTags(product.tags.join(', '));
    setQrCodeUrl(product.qrCodeUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ROBUST DELETE LOGIC FOR PRODUCTS
  const handleDeleteProduct = async (e: React.MouseEvent, productId: string) => {
    // 1. Force isolation
    e.preventDefault();
    e.stopPropagation();
    
    console.info("COMMAND: TRIGGERING PRODUCT PURGE FOR ID:", productId);
    
    // 2. Immediate feedback
    if (!window.confirm("CRITICAL: Erase this product permanently from the global arsenal?")) {
      console.info("PURGE ABORTED BY USER.");
      return;
    }
    
    setProcessingId(productId);
    try {
      // 3. Direct Firestore Reference
      const productRef = doc(db, 'products', productId);
      await deleteDoc(productRef);
      
      // 4. Update Local State immediately
      setProducts(prev => prev.filter(p => p.id !== productId));
      console.info("SUCCESS: PRODUCT WIPED FROM DATABASE.");
      alert("PRODUCT SUCCESSFULLY DELETED");
    } catch (err: any) {
      console.error("FIREBASE ERROR: DELETE FAILED", err);
      alert(`DELETE FAILED: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  // ROBUST DELETE LOGIC FOR ORDERS
  const handleDeleteOrder = async (e: React.MouseEvent, orderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.info("COMMAND: TRIGGERING ORDER SIGNAL PURGE FOR ID:", orderId);
    
    if (!window.confirm("WIPE SIGNAL RECORD? This log entry will be deleted forever.")) {
      console.info("SIGNAL PURGE ABORTED.");
      return;
    }
    
    setProcessingId(orderId);
    try {
      const orderRef = doc(db, 'orders', orderId);
      await deleteDoc(orderRef);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      console.info("SUCCESS: SIGNAL LOG WIPED.");
      alert("ORDER LOG PURGED");
    } catch (err: any) {
      console.error("FIREBASE ERROR: LOG PURGE FAILED", err);
      alert(`PURGE FAILED: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let imageUrls = editingProductId 
        ? products.find(p => p.id === editingProductId)?.images || [] 
        : [];
      
      if (files && files.length > 0) {
        const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file as File));
        const newImages = await Promise.all(uploadPromises);
        imageUrls = editingProductId ? [...imageUrls, ...newImages] : newImages;
      }

      const productData: any = {
        name,
        price: parseFloat(price),
        description: desc,
        tags: tags.split(',').map(t => t.trim()).filter(t => t !== ''),
        qrCodeUrl,
        images: imageUrls,
        updatedAt: Date.now()
      };

      if (editingProductId) {
        const docRef = doc(db, 'products', editingProductId);
        await updateDoc(docRef, productData);
        setProducts(prev => prev.map(p => p.id === editingProductId ? { ...p, ...productData } : p));
        alert("MANIFEST UPDATED");
      } else {
        productData.createdAt = Date.now();
        const docRef = await addDoc(collection(db, 'products'), productData);
        setProducts(prev => [{ id: docRef.id, ...productData } as Product, ...prev]);
        alert("GEAR DEPLOYED");
      }

      resetForm();
    } catch (err: any) {
      alert(`SUBMISSION FAILED: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const actionKey = orderId + status;
    setProcessingId(actionKey);
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (err: any) {
      alert(`STATUS UPDATE FAILED: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const isAuthorized = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <AlertTriangle size={64} className="text-red-500 mb-6" />
        <h1 className="font-orbitron text-2xl font-black text-red-500 uppercase mb-4 tracking-tighter">Access Denied</h1>
        <p className="text-gray-400 font-mono text-[10px] uppercase tracking-[0.3em]">Unauthorized Access: {user?.email}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 bg-black min-h-screen relative z-[100]">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 border-b border-white/10 pb-8 gap-6">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-[#39ff14]/10 border border-[#39ff14]/30">
            <ShieldCheck size={28} className="text-[#39ff14]" />
          </div>
          <div>
            <h1 className="font-orbitron text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none">Command Center</h1>
            <p className="text-[9px] font-orbitron text-[#39ff14]/60 uppercase tracking-[0.5em] mt-2">v2.1.0 Operational</p>
          </div>
          <button 
            type="button" 
            onClick={fetchData} 
            className="ml-4 p-2 text-gray-600 hover:text-[#39ff14] transition-colors relative z-[110]"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="flex gap-2 bg-white/5 p-1 border border-white/10 relative z-[110]">
          <button 
            type="button"
            onClick={() => setView('products')}
            className={`px-6 py-2 font-orbitron text-[10px] uppercase tracking-widest transition-all ${view === 'products' ? 'bg-[#39ff14] text-black font-black' : 'text-gray-500 hover:text-white'}`}
          >
            Manage Arsenal
          </button>
          <button 
            type="button"
            onClick={() => setView('orders')}
            className={`px-6 py-2 font-orbitron text-[10px] uppercase tracking-widest transition-all ${view === 'orders' ? 'bg-[#39ff14] text-black font-black' : 'text-gray-500 hover:text-white'}`}
          >
            Signal Logs
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading && products.length === 0 ? (
          <LoadingSpinner />
        ) : view === 'products' ? (
          <motion.div 
            key="products-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-10"
          >
            {/* FORM */}
            <div className="lg:col-span-1">
              <form onSubmit={handleSubmitProduct} className="bg-white/5 border border-white/10 p-6 space-y-6 sticky top-24 z-20">
                <h2 className="font-orbitron text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#39ff14] animate-pulse" />
                  {editingProductId ? 'Modify Gear' : 'Deploy Gear'}
                </h2>
                
                <div className="space-y-4">
                  <input required value={name} onChange={e => setName(e.target.value)} placeholder="Model Designation" className="w-full bg-black border border-white/10 p-3 text-xs focus:border-[#39ff14] outline-none text-white font-orbitron uppercase" />
                  <input required type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price (INR)" className="w-full bg-black border border-white/10 p-3 text-xs focus:border-[#39ff14] outline-none text-white" />
                  <textarea required rows={4} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Tech Specs & Description..." className="w-full bg-black border border-white/10 p-3 text-xs focus:border-[#39ff14] outline-none text-white leading-relaxed" />
                  <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma separated)" className="w-full bg-black border border-white/10 p-3 text-xs focus:border-[#39ff14] outline-none text-white uppercase" />
                  <input required value={qrCodeUrl} onChange={e => setQrCodeUrl(e.target.value)} placeholder="Payment QR Link" className="w-full bg-black border border-white/10 p-3 text-xs focus:border-[#39ff14] outline-none text-white" />
                  
                  <div className="relative border border-dashed border-white/20 p-6 text-center group hover:border-[#39ff14]/50 transition-all cursor-pointer">
                    <input type="file" multiple onChange={e => setFiles(e.target.files)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="text-gray-600 group-hover:text-[#39ff14] transition-colors" />
                      <span className="text-[9px] font-orbitron uppercase text-gray-600">Upload Media</span>
                      {files && <span className="text-[9px] text-[#39ff14]">{files.length} selected</span>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button type="submit" disabled={uploading} className="flex-1 bg-[#39ff14] text-black font-orbitron font-black py-4 uppercase tracking-widest text-[10px] hover:brightness-110 transition-all disabled:opacity-50">
                    {uploading ? 'SYNCING...' : 'COMMIT ACTION'}
                  </button>
                  {editingProductId && (
                    <button type="button" onClick={resetForm} className="bg-red-500/10 text-red-500 p-4 border border-red-500/20">
                      <X size={20} />
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* PRODUCT LIST */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-4">
                <span className="font-orbitron text-[10px] text-gray-500 uppercase tracking-widest">Active Arsenal Inventory</span>
                <span className="font-mono text-[10px] text-[#39ff14]">{products.length} Units</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map(product => (
                  <motion.div 
                    layout
                    key={product.id} 
                    className={`bg-white/5 border p-4 flex gap-4 group transition-all relative z-10 ${editingProductId === product.id ? 'border-[#39ff14]' : 'border-white/10'}`}
                  >
                    <div className="w-20 h-20 shrink-0 border border-white/10 overflow-hidden bg-black">
                      <img src={product.images[0]} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-orbitron text-[10px] font-black text-white uppercase truncate mb-1">{product.name}</h3>
                      <p className="text-[#39ff14] font-bold text-xs tracking-tighter">₹{product.price}</p>
                      
                      {/* ACTION BUTTONS - HIGH PRIORITY */}
                      <div className="flex gap-2 mt-3 relative z-[200]">
                        <button 
                          type="button"
                          onClick={(e) => handleEditClick(e, product)}
                          className="flex-1 py-2 bg-white/5 text-[9px] font-orbitron font-black text-gray-500 hover:text-white border border-white/5 uppercase tracking-widest flex items-center justify-center gap-2 pointer-events-auto"
                        >
                          <Edit3 size={12} /> Edit
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => handleDeleteProduct(e, product.id)} 
                          disabled={processingId === product.id}
                          className="flex-1 py-2 bg-red-500/5 text-[9px] font-orbitron font-black text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 uppercase tracking-widest flex items-center justify-center gap-2 pointer-events-auto transition-colors"
                        >
                          {processingId === product.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          Purge
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="orders-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {orders.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-white/10">
                <p className="font-orbitron text-gray-600 uppercase text-xs tracking-widest">No Signal records found.</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-white/5 border border-white/10 p-6 flex flex-col md:flex-row gap-8 group relative z-10">
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-orbitron text-xl font-black text-white uppercase tracking-tighter">{order.productName}</h3>
                        <p className="text-[10px] font-mono text-gray-600 mt-1 uppercase">Order Ref: {order.id}</p>
                      </div>
                      <div className={`px-4 py-1.5 text-[9px] font-orbitron font-black uppercase tracking-widest border ${
                        order.status === 'verified' ? 'bg-green-500/10 text-green-500 border-green-500/30' :
                        order.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                      }`}>
                        {order.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
                      <div className="space-y-1">
                        <span className="text-gray-500 uppercase tracking-widest text-[8px] font-black block">Recipient Information</span>
                        <div className="text-white font-black uppercase">{order.receiverName}</div>
                        <div className="text-gray-400 font-mono">{order.phone}</div>
                        <div className="text-gray-400">{order.userEmail}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-gray-500 uppercase tracking-widest text-[8px] font-black block">Transaction Signal</span>
                        <div className="text-[#39ff14] font-mono font-bold">UTR: {order.utr}</div>
                        <div className="text-white font-black">₹{order.amount}</div>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-gray-500 uppercase tracking-widest text-[8px] font-black block">Drop Zone</span>
                        <p className="text-gray-400 italic mt-1">{order.address}</p>
                      </div>
                    </div>

                    {/* LOG ACTIONS - HIGH PRIORITY */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-white/5 relative z-[200]">
                      <button 
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'verified')}
                        disabled={processingId === (order.id + 'verified')}
                        className="px-6 py-3 bg-green-500/10 text-green-500 border border-green-500/20 font-orbitron text-[10px] uppercase font-black hover:bg-green-500 hover:text-black transition-all pointer-events-auto"
                      >
                        Verify Signal
                      </button>
                      <button 
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'rejected')}
                        disabled={processingId === (order.id + 'rejected')}
                        className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 font-orbitron text-[10px] uppercase font-black hover:bg-red-500 hover:text-white transition-all pointer-events-auto"
                      >
                        Reject Signal
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => handleDeleteOrder(e, order.id)}
                        disabled={processingId === order.id}
                        className="px-6 py-3 bg-white/5 text-gray-500 border border-white/10 font-orbitron text-[10px] uppercase font-black hover:bg-red-600 hover:text-white transition-all pointer-events-auto"
                      >
                        {processingId === order.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="md:w-64 shrink-0 relative z-20">
                    <a href={order.screenshotUrl} target="_blank" rel="noreferrer" className="block w-full aspect-square border border-white/10 bg-black overflow-hidden relative group">
                      <img src={order.screenshotUrl} alt="Receipt" className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <ExternalLink size={24} className="text-[#39ff14]" />
                      </div>
                    </a>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
