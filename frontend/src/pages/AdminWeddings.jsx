import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit, Trash2, Loader, Image } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminWeddings = () => {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [weddings, setWeddings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingWedding, setEditingWedding] = useState(null);
  const [formData, setFormData] = useState({
    brideName: '',
    groomName: '',
    date: '',
    location: ''
  });
  const [coverImage, setCoverImage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWeddings();
  }, []);

  const fetchWeddings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/weddings`);
      setWeddings(response.data);
    } catch (error) {
      toast.error('Failed to load weddings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('brideName', formData.brideName);
      formDataToSend.append('groomName', formData.groomName);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('location', formData.location);
      
      if (coverImage) {
        formDataToSend.append('coverImage', coverImage);
      }

      if (editingWedding) {
        await axios.put(`${API}/admin/weddings/${editingWedding.id}`, formDataToSend, {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Wedding updated successfully');
      } else {
        await axios.post(`${API}/admin/weddings`, formDataToSend, {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Wedding created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchWeddings();
    } catch (error) {
      toast.error('Failed to save wedding');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({ brideName: '', groomName: '', date: '', location: '' });
    setCoverImage(null);
    setEditingWedding(null);
  };

  const handleEdit = (wedding) => {
    setEditingWedding(wedding);
    setFormData({
      brideName: wedding.brideName,
      groomName: wedding.groomName,
      date: wedding.date,
      location: wedding.location
    });
    setShowModal(true);
  };

  const handleDelete = async (weddingId) => {
    if (!window.confirm('Are you sure you want to delete this wedding?')) return;

    try {
      await axios.delete(`${API}/admin/weddings/${weddingId}`, {
        headers: getAuthHeaders()
      });
      toast.success('Wedding deleted successfully');
      fetchWeddings();
    } catch (error) {
      toast.error('Failed to delete wedding');
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-light mb-2">Weddings</h1>
          <p className="text-gray-600">Manage wedding portfolios</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-red-500 text-white px-6 py-3 hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Wedding</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {weddings.map((wedding) => (
          <div key={wedding.id} className="bg-white shadow-lg overflow-hidden">
            <div className="aspect-square bg-gray-100">
              <img
                src={`${BACKEND_URL}${wedding.coverImage}`}
                alt={`${wedding.brideName} & ${wedding.groomName}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-medium mb-1">
                {wedding.brideName} & {wedding.groomName}
              </h3>
              <p className="text-sm text-gray-500 mb-3">{wedding.location}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/admin/weddings/${wedding.id}/gallery`)}
                  className="flex-1 bg-blue-500 text-white py-2 hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Image className="w-4 h-4" />
                  <span>Gallery</span>
                </button>
                <button
                  onClick={() => handleEdit(wedding)}
                  className="bg-gray-500 text-white p-2 hover:bg-gray-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(wedding.id)}
                  className="bg-red-500 text-white p-2 hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-light mb-4">
              {editingWedding ? 'Edit Wedding' : 'Add Wedding'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverImage(e.target.files[0])}
                  required={!editingWedding}
                  className="w-full px-4 py-2 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bride Name</label>
                <input
                  type="text"
                  value={formData.brideName}
                  onChange={(e) => setFormData({...formData, brideName: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Groom Name</label>
                <input
                  type="text"
                  value={formData.groomName}
                  onChange={(e) => setFormData({...formData, groomName: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-red-500 text-white py-3 hover:bg-red-600 transition-colors disabled:bg-gray-400"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWeddings;
