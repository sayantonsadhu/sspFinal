import React from 'react';
import { Award, Heart, Camera } from 'lucide-react';
import { aboutData } from '../mock';

const AboutSection = () => {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
              <img
                src={aboutData.image}
                alt={aboutData.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 border-4 border-red-500 -z-10" />
          </div>

          {/* Content Side */}
          <div>
            <h2 className="text-5xl md:text-6xl font-light tracking-wide mb-6">
              About Me
            </h2>
            <div className="w-20 h-0.5 bg-red-500 mb-8" />
            
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {aboutData.bio}
            </p>

            {/* Features */}
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