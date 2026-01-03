
import React from 'react';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
}

const Layout: React.FC<LayoutProps> = ({ children, user }) => {
  return (
    <div className="min-h-screen pt-16">
      <Navbar user={user} />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.main>
    </div>
  );
};

export default Layout;
