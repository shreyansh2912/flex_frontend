import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';

const Topbar: React.FC = () => {
  const { logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 shadow-sm border-b border-transparent dark:border-slate-800 h-16 flex items-center justify-between px-6 fixed top-0 right-0 left-0 md:left-64 z-10 transition-all duration-300">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Flex Form Builder</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
              <User size={18} />
            </div>
            <span className="hidden md:block font-medium">Admin</span>
          </div>
          <button 
            onClick={handleLogoutClick} 
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {showLogoutConfirm && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
                <LogOut size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Sign out?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Are you sure you want to sign out of your account?
              </p>
              <div className="flex gap-3 w-full">
                <Button 
                  variant="outline" 
                  className="flex-1 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={confirmLogout}
                >
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Topbar;
