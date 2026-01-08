import React, { useState, useEffect } from 'react';
import { ExternalLink, ThumbsUp, Loader } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FacebookSection = () => {
  const [posts, setPosts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacebookData();
  }, []);

  const fetchFacebookData = async () => {
    try {
      // Fetch settings first
      const settingsResponse = await axios.get(`${API}/facebook/settings`);
      setSettings(settingsResponse.data);

      if (settingsResponse.data.enabled) {
        // Fetch posts
        const postsResponse = await axios.get(`${API}/facebook/posts`);
        setPosts(postsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load Facebook data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if not enabled or no posts
  if (!settings?.enabled || posts.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <Loader className="w-8 h-8 animate-spin text-red-500 mx-auto" />
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
            Follow Us on Facebook
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Stay updated with our latest work and behind-the-scenes moments
          </p>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto mb-8" />
          
          {/* Facebook Like Button */}
          {settings.pageId && (
            <div className="flex justify-center mb-8">
              <div 
                className="fb-like" 
                data-href={`https://www.facebook.com/${settings.pageId}`}
                data-width=""
                data-layout="button_count"
                data-action="like"
                data-size="large"
                data-share="true"
              ></div>
            </div>
          )}
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              {post.image && (
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={post.image}
                    alt="Facebook post"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              )}
              
              <div className="p-5">
                {post.message && (
                  <p className="text-gray-700 text-sm line-clamp-3 mb-3">
                    {post.message}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {new Date(post.created_time).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <div className="flex items-center gap-2 text-blue-600 group-hover:text-blue-700">
                    <span>View on Facebook</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Visit Page Button */}
        {settings.pageId && (
          <div className="text-center mt-12">
            <a
              href={`https://www.facebook.com/${settings.pageId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded-lg font-medium"
            >
              <ThumbsUp className="w-5 h-5" />
              <span>Visit Our Facebook Page</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default FacebookSection;
