import React, { useState, useEffect } from 'react';
import { Award, Heart, Camera } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AboutSection = () => {
  const [about, setAbout] = useState(null);
  const [sectionContent, setSectionContent] = useState({
    title: 'About Me',
    subtitle: 'The photographer behind the lens'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [aboutRes, contentRes] = await Promise.all([
        axios.get(`${API}/about`),
        axios.get(`${API}/sections/about`)
      ]);
      setAbout(aboutRes.data);
      if (contentRes.data) {
        setSectionContent(prev => ({
          ...prev,
          title: contentRes.data.title || prev.title,
          subtitle: contentRes.data.subtitle || prev.subtitle
        }));
      }
    } catch (error) {
      console.error('Failed to load about:', error);
    }
  };

  if (!about) return null;

  return (
    <section className="py-24 px-6 bg-white" data-testid="about-section">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
              <img
                src={about.image.startsWith('http') ? about.image : `${BACKEND_URL}${about.image}`}
                alt={about.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 border-4 border-red-500 -z-10" />
          </div>

          <div>
            <h2 className="text-5xl md:text-6xl font-light tracking-wide mb-4">
              {sectionContent.title}
            </h2>
            {sectionContent.subtitle && (
              <p className="text-lg text-gray-500 mb-6">{sectionContent.subtitle}</p>
            )}
            <div className="w-20 h-0.5 bg-red-500 mb-8" />
            
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {about.bio}
            </p>

            <div className="space-y-6 mt-12">
              <div className="flex items-start gap-4">
                <div className="bg-red-50 p-3 rounded-lg">
                  <Award className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-1">Award Winning</h3>
                  <p className="text-gray-600">
                    Recognized for excellence in wedding photography across prestigious platforms
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-red-50 p-3 rounded-lg">
                  <Heart className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-1">Passion Driven</h3>
                  <p className="text-gray-600">
                    Every wedding is unique, and we pour our heart into capturing your special moments
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-red-50 p-3 rounded-lg">
                  <Camera className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-1">Expert Team</h3>
                  <p className="text-gray-600">
                    Years of experience with state-of-the-art equipment and creative storytelling
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;