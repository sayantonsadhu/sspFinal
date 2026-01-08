import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Save, Loader, Facebook, Instagram, Youtube, Twitter, Linkedin, Share2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminSocialMedia = () => {
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [links, setLinks] = useState({
    facebook: '',
    instagram: '',
    youtube: '',
    twitter: '',
    linkedin: '',
    pinterest: '',
    tiktok: '',
    enabled: true
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/social-media`, {
        headers: getAuthHeaders()
      });
      setLinks(response.data);
    } catch (error) {
      toast.error('Failed to load social media links');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axios.put(`${API}/admin/social-media`, links, {
        headers: getAuthHeaders()
      });
      toast.success('Social media links saved successfully');
    } catch (error) {
      toast.error('Failed to save links');
    } finally {
      setSaving(false);
    }
  };

  const socialPlatforms = [
    {
      name: 'Facebook',
      key: 'facebook',
      icon: Facebook,
      placeholder: 'https://facebook.com/yourpage',
      color: 'text-blue-600'
    },
    {
      name: 'Instagram',
      key: 'instagram',
      icon: Instagram,
      placeholder: 'https://instagram.com/yourprofile',
      color: 'text-pink-600'
    },
    {
      name: 'YouTube',
      key: 'youtube',
      icon: Youtube,
      placeholder: 'https://youtube.com/@yourchannel',
      color: 'text-red-600'
    },
    {
      name: 'Twitter / X',
      key: 'twitter',
      icon: Twitter,
      placeholder: 'https://twitter.com/yourhandle',
      color: 'text-blue-400'
    },
    {
      name: 'LinkedIn',
      key: 'linkedin',
      icon: Linkedin,
      placeholder: 'https://linkedin.com/in/yourprofile',
      color: 'text-blue-700'
    },
    {
      name: 'Pinterest',
      key: 'pinterest',
      icon: Share2,
      placeholder: 'https://pinterest.com/yourprofile',
      color: 'text-red-500'
    },
    {
      name: 'TikTok',
      key: 'tiktok',
      icon: Share2,
      placeholder: 'https://tiktok.com/@yourprofile',
      color: 'text-gray-900'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light mb-2">Social Media Links</h1>
        <p className="text-gray-600">Manage your social media presence across platforms</p>
      </div>

      <div className="max-w-3xl">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-6">
          <h3 className="font-medium text-blue-900 mb-3">Tips for Social Media Links:</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-blue-800">
            <li>Enter the complete URL including https://</li>
            <li>Leave any field blank if you don't have that social media account</li>
            <li>Only links with values will be displayed on your website</li>
            <li>Make sure your social media profiles are public</li>
          </ul>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 shadow-lg space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="pb-4 border-b">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={links.enabled}
                onChange={(e) => setLinks({ ...links, enabled: e.target.checked })}
                className="w-5 h-5 text-red-500 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Display Social Media Section
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-2 ml-8">
              Toggle this to show/hide the social media links section on your website
            </p>
          </div>

          {/* Social Media Inputs */}
          <div className="space-y-4">
            {socialPlatforms.map((platform) => (
              <div key={platform.key}>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <platform.icon className={`w-5 h-5 ${platform.color}`} />
                  <span>{platform.name}</span>
                </label>
                <input
                  type="url"
                  value={links[platform.key] || ''}
                  onChange={(e) => setLinks({ ...links, [platform.key]: e.target.value })}
                  placeholder={platform.placeholder}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                />
              </div>
            ))}
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-red-500 text-white py-3 hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
          >
            {saving ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{saving ? 'Saving...' : 'Save Social Media Links'}</span>
          </button>
        </form>

        {/* Preview Notice */}
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg mt-6">
          <h3 className="font-medium text-gray-900 mb-2">Preview</h3>
          <p className="text-sm text-gray-600">
            Your social media links will appear on the homepage after the Packages section.
            Only platforms with valid URLs will be displayed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSocialMedia;
