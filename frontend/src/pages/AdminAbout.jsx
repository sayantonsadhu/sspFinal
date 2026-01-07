import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Save, Upload, Loader } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminAbout = () => {
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [about, setAbout] = useState({ name: '', bio: '', image: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/about`);
      setAbout(response.data);
      if (response.data.image) {
        setImagePreview(`${BACKEND_URL}${response.data.image}`);
      }
    } catch (error) {
      toast.error('Failed to load about section');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('name', about.name);
      formData.append('bio', about.bio);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await axios.put(`${API}/admin/about`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('About section updated successfully');
      setImageFile(null);
      fetchAbout();
    } catch (error) {
      toast.error('Failed to update about section');
    } finally {
      setSaving(false);
    }
  };

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
        <h1 className="text-3xl font-light mb-2">About Section</h1>
        <p className="text-gray-600">Manage your about section content</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white p-6 shadow-lg mb-6">
          <h2 className="text-xl font-medium mb-4">Profile Image</h2>
          {imagePreview && (
            <div className="mb-4">
              <img src={imagePreview} alt="Profile" className="w-48 h-48 object-cover" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-2 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
          />
        </div>

        <div className="bg-white p-6 shadow-lg">
          <h2 className="text-xl font-medium mb-4">About Content</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name / Business Name</label>
              <input
                type="text"
                value={about.name}
                onChange={(e) => setAbout({ ...about, name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={about.bio}
                onChange={(e) => setAbout({ ...about, bio: e.target.value })}
                required
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-red-500 text-white py-3 hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
            >
              {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminAbout;