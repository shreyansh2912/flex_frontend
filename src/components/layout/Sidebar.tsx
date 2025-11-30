import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Home, FileText, Settings, Menu, X, List, Cloud, BarChart2, MessageCircle, Sun, Moon } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { to: '/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { to: '/forms', icon: <List size={20} />, label: 'My Forms' },
    { to: '/create-form', icon: <FileText size={20} />, label: 'Create Form' },
    { to: '/word-cloud', icon: <Cloud size={20} />, label: 'Word Cloud' },
    { to: '/polls', icon: <BarChart2 size={20} />, label: 'Live Polls' },
    { to: '/qna', icon: <MessageCircle size={20} />, label: 'Q&A' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button onClick={toggleSidebar} className="p-2 bg-white dark:bg-slate-800 rounded-md shadow-md text-gray-700 dark:text-gray-200">
          {isCollapsed ? <Menu size={24} /> : <X size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all duration-300 z-40 border-r border-slate-200 dark:border-slate-800 ${
          isCollapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'w-64'
        }`}
      >
        <div className="flex items-center justify-center h-16 border-b border-slate-200 dark:border-slate-800">
          {!isCollapsed ? (
            // <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent">Flex</h1>
            <div className="logo py-6 text-4xl">FLEX</div>
          ) : (
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">F</h1>
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
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-white'
                  }`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && <span className="ml-3 font-medium">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            onClick={toggleTheme}
            className={`flex items-center justify-center w-full p-2 rounded-lg mb-4 transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            {!isCollapsed && <span className="ml-2 text-sm font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          {!isCollapsed && (
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
              <p className="text-xs text-slate-600 dark:text-slate-400">Pro Plan</p>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2">
                <div className="bg-blue-500 h-1.5 rounded-full w-3/4"></div>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1">75% used</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
