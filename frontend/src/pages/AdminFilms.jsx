import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Save, Loader } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminFilms = () => {
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [film, setFilm] = useState({ title: '', videoUrl: '' });

  useEffect(() => {
    fetchFilm();
  }, []);

  const fetchFilm = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/films/featured`);
      setFilm(response.data);
    } catch (error) {
      toast.error('Failed to load film');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axios.put(`${API}/admin/films/featured`, {
        title: film.title,
        videoUrl: film.videoUrl
      }, {
        headers: getAuthHeaders()
      });
      toast.success('Film updated successfully');
    } catch (error) {
      toast.error('Failed to update film');
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
        <h1 className="text-3xl font-light mb-2">Featured Film</h1>
        <p className="text-gray-600">Manage the featured wedding film on homepage</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl bg-white p-6 shadow-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Film Title</label>
            <input
              type="text"
              value={film.title}
              onChange={(e) => setFilm({ ...film, title: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">YouTube Embed URL</label>
            <input
              type="text"
              value={film.videoUrl}
              onChange={(e) => setFilm({ ...film, videoUrl: e.target.value })}
              required
              placeholder="https://www.youtube.com/embed/VIDEO_ID"
              className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
            />
            <p className="text-sm text-gray-500 mt-1">Example: https://www.youtube.com/embed/dQw4w9WgXcQ</p>
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
      </form>
    </div>
  );
};

export default AdminFilms;