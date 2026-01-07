import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Upload, Trash2, Loader, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminHeroCarousel = () => {
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [alt, setAlt] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/hero-carousel`, {
        headers: getAuthHeaders()
      });
      setItems(response.data);
    } catch (error) {
      toast.error('Failed to load carousel items');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('alt', alt);

      await axios.post(`${API}/admin/hero-carousel`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Image uploaded successfully');
      setSelectedFile(null);
      setAlt('');
      fetchItems();
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const toggleEnabled = async (itemId, currentStatus) => {
    try {
      await axios.put(`${API}/admin/hero-carousel/${itemId}`, 
        { enabled: !currentStatus },
        { headers: getAuthHeaders() }
      );
      toast.success('Status updated');
      fetchItems();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await axios.delete(`${API}/admin/hero-carousel/${itemId}`, {
        headers: getAuthHeaders()
      });
      toast.success('Image deleted successfully');
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete image');
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
        <h1 className="text-3xl font-light mb-2">Hero Carousel</h1>
        <p className="text-gray-600">Manage homepage carousel images</p>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="bg-white p-6 shadow-lg mb-8">
        <h2 className="text-xl font-medium mb-4">Upload New Image</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image File
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              required
              className="w-full px-4 py-2 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alt Text
            </label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              required
              placeholder="Describe the image"
              className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="bg-red-500 text-white px-6 py-3 hover:bg-red-600 transition-colors flex items-center gap-2 disabled:bg-gray-400"
          >
            {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
          </button>
        </div>
      </form>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white shadow-lg overflow-hidden">
            <div className="aspect-video bg-gray-100">
              <img
                src={`${BACKEND_URL}${item.url}`}
                alt={item.alt}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-3">{item.alt}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleEnabled(item.id, item.enabled)}
                  className={`flex-1 py-2 px-4 flex items-center justify-center gap-2 transition-colors ${
                    item.enabled
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                  }`}
                >
                  {item.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span>{item.enabled ? 'Enabled' : 'Disabled'}</span>
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="bg-red-500 text-white p-2 hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminHeroCarousel;