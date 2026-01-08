import React, { useState, useEffect } from 'react';
import { Facebook, Instagram, Youtube, Twitter, Linkedin, Share2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SocialMediaSection = () => {
  const [links, setLinks] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await axios.get(`${API}/social-media`);
      setLinks(response.data);
    } catch (error) {
      console.error('Failed to load social media links:', error);
    } finally {
      setLoading(false);
    }
  };

  const socialPlatforms = [
    {
      name: 'Facebook',
      key: 'facebook',
      icon: Facebook,
      color: 'from-blue-600 to-blue-700',
      hoverColor: 'hover:from-blue-700 hover:to-blue-800'
    },
    {
      name: 'Instagram',
      key: 'instagram',
      icon: Instagram,
      color: 'from-pink-500 via-purple-500 to-orange-500',
      hoverColor: 'hover:from-pink-600 hover:via-purple-600 hover:to-orange-600'
    },
    {
      name: 'YouTube',
      key: 'youtube',
      icon: Youtube,
      color: 'from-red-600 to-red-700',
      hoverColor: 'hover:from-red-700 hover:to-red-800'
    },
    {
      name: 'Twitter',
      key: 'twitter',
      icon: Twitter,
      color: 'from-blue-400 to-blue-500',
      hoverColor: 'hover:from-blue-500 hover:to-blue-600'
    },
    {
      name: 'LinkedIn',
      key: 'linkedin',
      icon: Linkedin,
      color: 'from-blue-700 to-blue-800',
      hoverColor: 'hover:from-blue-800 hover:to-blue-900'
    },
    {
      name: 'Pinterest',
      key: 'pinterest',
      icon: Share2,
      color: 'from-red-500 to-red-600',
      hoverColor: 'hover:from-red-600 hover:to-red-700'
    },
    {
      name: 'TikTok',
      key: 'tiktok',
      icon: Share2,
      color: 'from-gray-900 to-black',
      hoverColor: 'hover:from-black hover:to-gray-900'
    }
  ];

  // Don't render if not enabled or no links
  if (!links?.enabled || loading) {
    return null;
  }

  // Filter platforms that have links
  const availablePlatforms = socialPlatforms.filter(platform => links[platform.key]);

  if (availablePlatforms.length === 0) {
    return null;
  }

  return (
    <section className="py-24 px-6 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-light tracking-wide mb-4">
            Connect With Us
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Follow our journey and stay inspired with our latest work
          </p>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto mt-6" />
        </div>

        {/* Social Media Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {availablePlatforms.map((platform) => (
            <a
              key={platform.key}
              href={links[platform.key]}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
            >
              <div className={`
                relative bg-gradient-to-br ${platform.color} ${platform.hoverColor}
                p-8 rounded-2xl shadow-lg
                transform transition-all duration-300
                hover:scale-105 hover:shadow-2xl
                overflow-hidden
              `}>
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                
                {/* Icon */}
                <div className="relative flex flex-col items-center gap-3">
                  <platform.icon className="w-10 h-10 text-white" strokeWidth={1.5} />
                  <span className="text-white font-medium text-sm">{platform.name}</span>
                </div>

                {/* Decorative Circle */}
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full"></div>
              </div>
            </a>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-gray-700 text-lg mb-6">
            Join our community and never miss a moment
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {availablePlatforms.slice(0, 3).map((platform) => (
              <a
                key={`cta-${platform.key}`}
                href={links[platform.key]}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 hover:border-red-500 rounded-full transition-all duration-300 hover:shadow-lg group"
              >
                <platform.icon className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-red-500 transition-colors">
                  Follow on {platform.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialMediaSection;
