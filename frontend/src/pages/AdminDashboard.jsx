import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Image, Heart, Film, Settings, Package, Mail } from 'lucide-react';

const AdminDashboard = () => {
  const cards = [
    { name: 'Site Settings', icon: Settings, path: '/admin/settings', color: 'bg-blue-500' },
    { name: 'Hero Carousel', icon: Image, path: '/admin/hero-carousel', color: 'bg-purple-500' },
    { name: 'Weddings', icon: Heart, path: '/admin/weddings', color: 'bg-red-500' },
    { name: 'Films', icon: Film, path: '/admin/films', color: 'bg-green-500' },
    { name: 'About Section', icon: Settings, path: '/admin/about', color: 'bg-yellow-500' },
    { name: 'Packages', icon: Package, path: '/admin/packages', color: 'bg-indigo-500' },
    { name: 'Contact Inquiries', icon: Mail, path: '/admin/inquiries', color: 'bg-pink-500' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light mb-2">Dashboard</h1>
        <p className="text-gray-600">Manage your photography portfolio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.path}
            to={card.path}
            className="bg-white p-6 shadow-lg hover:shadow-xl transition-shadow group"
          >
            <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{card.name}</h3>
            <p className="text-sm text-gray-500 mt-1">Manage {card.name.toLowerCase()}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;