
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Order } from '../types';
import { motion } from 'framer-motion';
import { Package, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const UserOrders: React.FC<{ user: any }> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        fetched.sort((a, b) => b.createdAt - a.createdAt);
        setOrders(fetched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 font-rajdhani">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">Signal <span className="text-[#39ff14]">Log</span></h1>
        <div className="h-1 w-20 bg-[#39ff14]" />
      </div>

      {orders.length === 0 ? (
        <div className="bg-white/5 border border-white/10 p-12 text-center">
          <Package className="mx-auto text-gray-700 mb-4" size={48} />
          <p className="text-gray-500 uppercase tracking-widest text-xs font-michroma">No acquisition data found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <motion.div key={order.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
              className={`bg-white/5 border border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 ${order.status === 'verified' ? 'border-green-500/20' : order.status === 'rejected' ? 'border-red-500/20' : ''}`}>
              <div className="flex items-center gap-6">
                <div className={`w-12 h-12 flex items-center justify-center bg-white/5 ${order.status === 'verified' ? 'text-green-500' : order.status === 'rejected' ? 'text-red-500' : 'text-[#39ff14]'}`}>
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white uppercase">{order.productName}</h3>
                  <div className="flex flex-wrap gap-4 text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-michroma">
                    <span className="text-white/80">QTY: {order.quantity || 1}</span>
                    <span className="text-[#39ff14]">TOTAL: ₹{order.amount}</span>
                    <span>LOG_REF: {order.id.slice(0, 8)}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:items-end gap-2">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-michroma font-bold uppercase tracking-widest border ${
                  order.status === 'verified' ? 'bg-green-500/10 text-green-500 border-green-500/30' :
                  order.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                  'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                }`}>
                  {order.status}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrders;
