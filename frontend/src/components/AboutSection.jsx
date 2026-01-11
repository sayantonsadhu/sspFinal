import React, { useState, useEffect } from 'react';
import { Award, Heart, Camera, Star, Sparkles, Users } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Icon mapping for feature points
const iconMap = {
  0: Award,
  1: Heart,
  2: Camera,
  3: Star,
  4: Sparkles,
  5: Users
};

const AboutSection = () => {
  const [about, setAbout] = useState(null);

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      const response = await axios.get(`${API}/about`);
      setAbout(response.data);
    } catch (error) {
      console.error('Failed to load about:', error);
    }
  };

  if (!about) return null;

  // Use features from database or default
  const features = about.features && about.features.length > 0 
    ? about.features 
    : [
        { title: "Award Winning", description: "Recognized for excellence in wedding photography across prestigious platforms" },
        { title: "Passion Driven", description: "Every wedding is unique, and we pour our heart into capturing your special moments" },
        { title: "Expert Team", description: "Years of experience with state-of-the-art equipment and creative storytelling" }
      ];

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
            <h2 className="text-5xl md:text-6xl font-light tracking-wide mb-6">
              About Me
            </h2>
            <div className="w-20 h-0.5 bg-red-500 mb-8" />
            
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {about.bio}
            </p>

            <div className="space-y-6 mt-12">
              {features.map((feature, index) => {
                const IconComponent = iconMap[index % Object.keys(iconMap).length];
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="bg-red-50 p-3 rounded-lg">
                      <IconComponent className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-1">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;