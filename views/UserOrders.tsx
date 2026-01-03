
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
        // Removed orderBy from query to avoid composite index requirement
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        
        // Sorting in memory instead of via Firestore index
        fetched.sort((a, b) => b.createdAt - a.createdAt);
        
        setOrders(fetched);
      } catch (err) {
        console.error("Fetch orders failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <div className="mb-12">
        <h1 className="font-orbitron text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4">
          Acquisition <span className="text-[#39ff14]">History</span>
        </h1>
        <div className="h-1 w-20 bg-[#39ff14]" />
      </div>

      {orders.length === 0 ? (
        <div className="bg-white/5 border border-white/10 p-12 text-center rounded-sm">
          <Package className="mx-auto text-gray-600 mb-4" size={48} />
          <p className="font-orbitron text-gray-500 uppercase tracking-widest text-sm">No gear acquisitions found in your log.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white/5 border border-white/10 p-6 group transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                order.status === 'verified' ? 'border-green-500/20' : 
                order.status === 'rejected' ? 'border-red-500/20' : ''
              }`}
            >
              <div className="flex items-center gap-6">
                <div className={`w-12 h-12 flex items-center justify-center rounded-full ${
                  order.status === 'verified' ? 'bg-green-500/10 text-green-500' :
                  order.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                  'bg-[#39ff14]/10 text-[#39ff14]'
                }`}>
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="font-orbitron text-lg font-bold text-white group-hover:text-[#39ff14] transition-colors">{order.productName}</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500 uppercase tracking-widest mt-1">
                    <span>ID: {order.id.slice(0, 8)}</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className="text-[#39ff14] font-bold">₹{order.amount}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Log Status</span>
                <div className={`flex flex-col md:items-end gap-1`}>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 text-[10px] font-orbitron font-bold uppercase tracking-widest rounded-full border ${
                    order.status === 'verified' ? 'bg-green-500/10 text-green-500 border-green-500/30' :
                    order.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                    'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                  }`}>
                    {order.status === 'verified' && <CheckCircle size={14} />}
                    {order.status === 'rejected' && <XCircle size={14} />}
                    {order.status === 'pending' && <Loader2 size={14} className="animate-spin" />}
                    {order.status === 'pending' ? 'verifying payment' : order.status}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter text-right">
                    {order.status === 'verified' && "order accepted and deliver in 7-14 days"}
                    {order.status === 'rejected' && "order rejected you will get refund in 3-4 working days"}
                    {order.status === 'pending' && "Awaiting tactical verification..."}
                  </p>
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
