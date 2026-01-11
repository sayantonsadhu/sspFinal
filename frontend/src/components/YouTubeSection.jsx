import React, { useState, useEffect } from 'react';
import { Play, ExternalLink, Loader } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const YouTubeSection = () => {
  const [videos, setVideos] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    fetchYouTubeData();
  }, []);

  const fetchYouTubeData = async () => {
    try {
      // Fetch settings first
      const settingsResponse = await axios.get(`${API}/youtube/settings`);
      setSettings(settingsResponse.data);

      if (settingsResponse.data.enabled) {
        // Fetch videos
        const videosResponse = await axios.get(`${API}/youtube/videos`);
        setVideos(videosResponse.data);
      }
    } catch (error) {
      console.error('Failed to load YouTube data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if not enabled or no videos
  if (!settings?.enabled || videos.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <Loader className="w-8 h-8 animate-spin text-red-500 mx-auto" />
        </div>
      </section>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <section className="py-24 px-6 bg-gray-50" data-testid="youtube-section">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-light tracking-wide mb-4">
            {settings.section_title || 'YouTube Stories'}
          </h2>
          {settings.section_description && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              {settings.section_description}
            </p>
          )}
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto" />
        </div>

        {/* Video Modal */}
        {selectedVideo && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <div className="relative w-full max-w-5xl aspect-video">
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-12 right-0 text-white hover:text-red-500 transition-colors"
              >
                Close ✕
              </button>
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.video_id}?autoplay=1`}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <div
              key={video.video_id}
              className="group bg-white shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
              onClick={() => setSelectedVideo(video)}
              data-testid={`youtube-video-${video.video_id}`}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform">
                    <Play className="w-8 h-8 text-red-500 fill-red-500" />
                  </div>
                </div>
                {/* YouTube Badge */}
                <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-medium px-2 py-1 rounded">
                  YouTube
                </div>
              </div>

              {/* Video Info */}
              <div className="p-5">
                <h3 className="font-medium text-lg mb-2 line-clamp-2 group-hover:text-red-500 transition-colors">
                  {video.title}
                </h3>
                {video.description && (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {video.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {formatDate(video.published_at)}
                  </span>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.video_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors"
                  >
                    <span>Watch on YouTube</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        {videos.length > 0 && (
          <div className="text-center mt-12">
            <a
              href={`https://www.youtube.com/channel/${videos[0]?.channel_id || ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-red-500 text-white hover:bg-red-600 transition-colors rounded-lg font-medium"
            >
              <Play className="w-5 h-5" />
              <span>Subscribe on YouTube</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default YouTubeSection;
