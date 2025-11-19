import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Settings, Menu, X } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();

  const navItems = [
    { to: '/dashboard', icon: <Home />, label: 'Dashboard' },
    { to: '/create-form', icon: <FileText />, label: 'Create Form' },
    { to: '/settings', icon: <Settings />, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-20">
        <button onClick={toggleSidebar}>
          {isCollapsed ? <Menu /> : <X />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-800 text-white transition-all duration-300 ${
          isCollapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'w-64'
        }`}
      >
        <div className="flex items-center justify-between p-4">
          {!isCollapsed && <h1 className="text-2xl font-bold">Flex</h1>}
          <button onClick={toggleSidebar} className="md:hidden">
            <X />
          </button>
        </div>
        <nav>
          <ul>
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`flex items-center p-4 hover:bg-gray-700 ${
                    location.pathname === item.to ? 'bg-gray-700' : ''
                  }`}
                >
                  {item.icon}
                  {!isCollapsed && <span className="ml-4">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
