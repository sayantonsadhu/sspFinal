import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Upload, Trash2, Loader, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminWeddingGallery = () => {
  const { weddingId } = useParams();
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [wedding, setWedding] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    fetchWedding();
  }, [weddingId]);

  const fetchWedding = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/weddings/${weddingId}`);
      setWedding(response.data);
    } catch (error) {
      toast.error('Failed to load wedding');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      await axios.post(`${API}/admin/weddings/${weddingId}/images`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Images uploaded successfully');
      setSelectedFiles([]);
      fetchWedding();
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (index) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await axios.delete(`${API}/admin/weddings/${weddingId}/images/${index}`, {
        headers: getAuthHeaders()
      });
      toast.success('Image deleted successfully');
      fetchWedding();
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
      <button
        onClick={() => navigate('/admin/weddings')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Weddings</span>
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-light mb-2">
          {wedding.brideName} & {wedding.groomName}
        </h1>
        <p className="text-gray-600">Manage wedding gallery images</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white p-6 shadow-lg mb-8">
        <h2 className="text-xl font-medium mb-4">Upload Gallery Images</h2>
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
            className="w-full px-4 py-2 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
          />
          {selectedFiles.length > 0 && (
            <button
              onClick={handleUploadImages}
              disabled={uploading}
              className="bg-red-500 text-white px-6 py-3 hover:bg-red-600 transition-colors flex items-center gap-2 disabled:bg-gray-400"
            >
              {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>{uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Images`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {wedding.images && wedding.images.map((imageUrl, index) => (
          <div key={index} className="relative group">
            <div className="aspect-square bg-gray-100">
              <img
                src={`${BACKEND_URL}${imageUrl}`}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => deleteImage(index)}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {(!wedding.images || wedding.images.length === 0) && (
        <div className="text-center py-12 text-gray-500">
          <p>No gallery images yet. Upload some images above.</p>
        </div>
      )}
    </div>
  );
};

export default AdminWeddingGallery;