import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader, X } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WeddingGallery = () => {
  const { weddingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [wedding, setWedding] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchWedding();
  }, [weddingId]);

  const fetchWedding = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/weddings/${weddingId}`);
      setWedding(response.data);
    } catch (error) {
      console.error('Failed to load wedding:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl text-gray-600 mb-4">Wedding not found</p>
        <button
          onClick={() => navigate('/')}
          className="bg-red-500 text-white px-6 py-3 hover:bg-red-600 transition-colors"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-white pt-24">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>

          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-light tracking-wide mb-4">
              {wedding.brideName} <span className="text-red-500">&</span> {wedding.groomName}
            </h1>
            <p className="text-xl text-gray-600">{wedding.location}</p>
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto mt-6" />
          </div>

          {wedding.images && wedding.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wedding.images.map((imageUrl, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-100 cursor-pointer overflow-hidden group"
                  onClick={() => setSelectedImage(`${BACKEND_URL}${imageUrl}`)}
                >
                  <img
                    src={`${BACKEND_URL}${imageUrl}`}
                    alt={`${wedding.brideName} & ${wedding.groomName} - ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Gallery coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </>
  );
};

export default WeddingGallery;
