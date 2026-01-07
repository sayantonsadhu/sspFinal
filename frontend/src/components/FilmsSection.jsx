import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FilmsSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [film, setFilm] = useState(null);

  useEffect(() => {
    fetchFilm();
  }, []);

  const fetchFilm = async () => {
    try {
      const response = await axios.get(`${API}/films/featured`);
      setFilm(response.data);
    } catch (error) {
      console.error('Failed to load film:', error);
    }
  };

  if (!film) return null;

  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-light tracking-wide mb-4">
            Wedding Films
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Cinematic storytelling that brings your special day to life
          </p>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto mt-6" />
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
            {!isPlaying ? (
              <>
                <img
                  src={film.thumbnail}
                  alt="Featured Wedding Film"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="group relative"
                    aria-label="Play video"
                  >
                    <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative bg-white rounded-full p-8 group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-12 h-12 text-red-500 fill-red-500" />
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <iframe
                src={`${film.videoUrl}?autoplay=1`}
                title="Featured Wedding Film"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>

        <div className="text-center mt-12 max-w-3xl mx-auto">
          <p className="text-gray-700 leading-relaxed">
            Every wedding film is a unique masterpiece. We capture the emotions, the laughter, 
            and the tears, weaving them into a cinematic narrative that you'll cherish forever. 
            Our documentary-style approach ensures that every precious moment is preserved with 
            artistic excellence.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FilmsSection;