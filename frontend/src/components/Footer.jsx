import React from 'react';
import { Instagram, Facebook, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { siteSettings } from '../mock';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* About */}
          <div>
            <h3 className="text-2xl font-light mb-4">
              <span className="font-serif italic">Sayanton</span> Sadhu Photography
            </h3>
            <p className="text-gray-400 leading-relaxed mb-6">
              Award-winning wedding photography capturing genuine emotions and once-in-a-lifetime moments with artistic excellence.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="bg-white/10 hover:bg-red-500 p-3 rounded-full transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="bg-white/10 hover:bg-red-500 p-3 rounded-full transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={`mailto:${siteSettings.email}`}
                className="bg-white/10 hover:bg-red-500 p-3 rounded-full transition-all duration-300"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-light mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="#weddings" className="text-gray-400 hover:text-red-500 transition-colors">
                  Recent Weddings
                </a>
              </li>
              <li>
                <a href="#films" className="text-gray-400 hover:text-red-500 transition-colors">
                  Wedding Films
                </a>
              </li>
              <li>
                <a href="#packages" className="text-gray-400 hover:text-red-500 transition-colors">
                  Photography Packages
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-400 hover:text-red-500 transition-colors">
                  About Me
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-light mb-4">Get In Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                <span className="text-gray-400">
                  {siteSettings.address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-red-500 flex-shrink-0" />
                <a href={`tel:${siteSettings.phone}`} className="text-gray-400 hover:text-red-500 transition-colors">
                  {siteSettings.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-red-500 flex-shrink-0" />
                <a href={`mailto:${siteSettings.email}`} className="text-gray-400 hover:text-red-500 transition-colors">
                  {siteSettings.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by Sayanton Sadhu Photography © 2024
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;