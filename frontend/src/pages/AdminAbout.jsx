import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Save, Upload, Loader, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminAbout = () => {
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingFeatures, setSavingFeatures] = useState(false);
  const [about, setAbout] = useState({ name: '', bio: '', image: '', features: [] });
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
        const imgSrc = response.data.image.startsWith('http') 
          ? response.data.image 
          : `${BACKEND_URL}${response.data.image}`;
        setImagePreview(imgSrc);
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

  const handleFeatureChange = (index, field, value) => {
    const updatedFeatures = [...about.features];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    setAbout({ ...about, features: updatedFeatures });
  };

  const addFeature = () => {
    setAbout({
      ...about,
      features: [...about.features, { title: '', description: '' }]
    });
  };

  const removeFeature = (index) => {
    const updatedFeatures = about.features.filter((_, i) => i !== index);
    setAbout({ ...about, features: updatedFeatures });
  };

  const saveFeatures = async () => {
    try {
      setSavingFeatures(true);
      await axios.put(`${API}/admin/about/features`, {
        features: about.features
      }, {
        headers: getAuthHeaders()
      });
      toast.success('Feature points updated successfully');
    } catch (error) {
      toast.error('Failed to update feature points');
    } finally {
      setSavingFeatures(false);
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
        <p className="text-gray-600">Manage your about section content and feature points</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Profile Image */}
        <form onSubmit={handleSubmit}>
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

          {/* About Content */}
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
                <span>{saving ? 'Saving...' : 'Save About Content'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Feature Points */}
        <div className="bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium">Feature Points</h2>
            <button
              type="button"
              onClick={addFeature}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Feature
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mb-4">
            These feature points appear below your bio in the About section (e.g., "Award Winning", "Passion Driven")
          </p>

          <div className="space-y-4">
            {about.features && about.features.map((feature, index) => (
              <div key={index} className="border border-gray-200 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500">Feature {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove feature"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                      placeholder="e.g., Award Winning"
                      className="w-full px-3 py-2 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={feature.description}
                      onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                      placeholder="Brief description of this feature"
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}

            {(!about.features || about.features.length === 0) && (
              <p className="text-gray-500 text-center py-4">No feature points added. Click "Add Feature" to create one.</p>
            )}

            <button
              type="button"
              onClick={saveFeatures}
              disabled={savingFeatures}
              className="w-full bg-red-500 text-white py-3 hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 mt-4"
            >
              {savingFeatures ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>{savingFeatures ? 'Saving...' : 'Save Feature Points'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAbout;