import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PackageModal = ({ package: pkg, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-light">{pkg.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-6 text-lg">{pkg.description}</p>
          
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-2">Pricing</h3>
            <p className="text-2xl text-red-500 font-light">{pkg.pricing}</p>
          </div>

          {pkg.images && pkg.images.length > 0 && (
            <div>
              <h3 className="text-xl font-medium mb-4">Gallery</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pkg.images.map((image, index) => (
                  <div key={index} className="aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                      src={`${BACKEND_URL}${image}`}
                      alt={`${pkg.title} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PackagesSection = () => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await axios.get(`${API}/packages`);
      setPackages(response.data);
    } catch (error) {
      console.error('Failed to load packages:', error);
    }
  };

  return (
    <>
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-light tracking-wide mb-4">
              Photography Packages
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tailored packages to capture every precious moment of your celebration
            </p>
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="group cursor-pointer bg-white overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                onClick={() => setSelectedPackage(pkg)}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={`${BACKEND_URL}${pkg.thumbnail}`}
                    alt={pkg.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-light mb-2">{pkg.title}</h3>
                    <p className="text-sm opacity-90">{pkg.description}</p>
                  </div>
                </div>

                <div className="p-6">
                  <button className="w-full py-3 bg-red-500 text-white hover:bg-red-600 transition-colors uppercase tracking-wider text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PackageModal
        package={selectedPackage}
        isOpen={!!selectedPackage}
        onClose={() => setSelectedPackage(null)}
      />
    </>
  );
};

export default PackagesSection;