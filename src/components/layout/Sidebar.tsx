import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Settings, Menu, X, List, Cloud } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();

  const navItems = [
    { to: '/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { to: '/forms', icon: <List size={20} />, label: 'My Forms' },
    { to: '/create-form', icon: <FileText size={20} />, label: 'Create Form' },
    { to: '/word-cloud', icon: <Cloud size={20} />, label: 'Word Cloud' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button onClick={toggleSidebar} className="p-2 bg-white rounded-md shadow-md text-gray-700">
          {isCollapsed ? <Menu size={24} /> : <X size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-slate-900 text-white transition-all duration-300 z-40 ${
          isCollapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'w-64'
        }`}
      >
        <div className="flex items-center justify-center h-16 border-b border-slate-800">
          {!isCollapsed ? (
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Flex</h1>
          ) : (
            <h1 className="text-xl font-bold text-blue-400">F</h1>
          )}
        </div>

        <nav className="mt-6 px-2">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    location.pathname === item.to 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && <span className="ml-3 font-medium">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {!isCollapsed && (
          <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-800">
            <div className="bg-slate-800 rounded-lg p-3">
              <p className="text-xs text-slate-400">Pro Plan</p>
              <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2">
                <div className="bg-blue-500 h-1.5 rounded-full w-3/4"></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">75% used</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
