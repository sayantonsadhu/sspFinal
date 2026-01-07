import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RecentWeddings = () => {
  const navigate = useNavigate();
  const [weddings, setWeddings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeddings();
  }, []);

  const fetchWeddings = async () => {
    try {
      const response = await axios.get(`${API}/weddings?limit=6`);
      setWeddings(response.data);
    } catch (error) {
      console.error('Failed to load weddings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <p>Loading weddings...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-light tracking-wide mb-4">
            Recent Weddings
          </h2>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto" />
        </div>

        {/* Wedding Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {weddings.map((wedding) => (
            <div
              key={wedding.id}
              className="group cursor-pointer"
              onClick={() => navigate(`/wedding/${wedding.id}`)}
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100 mb-4">
                <img
                  src={`${BACKEND_URL}${wedding.coverImage}`}
                  alt={`${wedding.brideName} & ${wedding.groomName}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="bg-white px-6 py-3 rounded-full flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-sm font-medium">View Gallery</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Wedding Info */}
              <div className="text-center">
                <h3 className="text-2xl font-light mb-2">
                  {wedding.brideName} <span className="text-red-500 mx-2">&</span> {wedding.groomName}
                </h3>
                <p className="text-sm text-gray-500 uppercase tracking-wider">
                  {wedding.location}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-16">
          <button className="group inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 uppercase tracking-wider text-sm font-medium">
            View All Weddings
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default RecentWeddings;