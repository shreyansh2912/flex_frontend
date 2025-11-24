import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User } from 'lucide-react';

const Topbar: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="bg-white shadow-sm h-16 flex items-center justify-between px-6 fixed top-0 right-0 left-0 md:left-64 z-10 transition-all duration-300">
      <h2 className="text-xl font-semibold text-gray-800">Flex Form Builder</h2>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <User size={18} />
          </div>
          <span className="hidden md:block font-medium">Admin</span>
        </div>
        <button 
          onClick={logout} 
          className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};

export default Topbar;
