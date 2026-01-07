import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit, Trash2, Loader, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPackages = () => {
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', pricing: '' });
  const [thumbnail, setThumbnail] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/packages`);
      setPackages(response.data);
    } catch (error) {
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('pricing', formData.pricing);
      if (thumbnail) {
        formDataToSend.append('thumbnail', thumbnail);
      }

      if (editingPackage) {
        await axios.put(`${API}/admin/packages/${editingPackage.id}`, formDataToSend, {
          headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Package updated successfully');
      } else {
        await axios.post(`${API}/admin/packages`, formDataToSend, {
          headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Package created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchPackages();
    } catch (error) {
      toast.error('Failed to save package');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadGalleryImages = async () => {
    if (!selectedPackageId || galleryImages.length === 0) return;

    try {
      setUploadingImages(true);
      const formData = new FormData();
      galleryImages.forEach(file => formData.append('images', file));

      await axios.post(`${API}/admin/packages/${selectedPackageId}/images`, formData, {
        headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Images uploaded successfully');
      setGalleryImages([]);
      setSelectedPackageId(null);
      fetchPackages();
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', pricing: '' });
    setThumbnail(null);
    setEditingPackage(null);
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({ title: pkg.title, description: pkg.description, pricing: pkg.pricing });
    setShowModal(true);
  };

  const handleDelete = async (pkgId) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;

    try {
      await axios.delete(`${API}/admin/packages/${pkgId}`, { headers: getAuthHeaders() });
      toast.success('Package deleted successfully');
      fetchPackages();
    } catch (error) {
      toast.error('Failed to delete package');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><Loader className="w-8 h-8 animate-spin text-red-500" /></div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-light mb-2">Photography Packages</h1>
          <p className="text-gray-600">Manage photography packages</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="bg-red-500 text-white px-6 py-3 hover:bg-red-600 transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>Add Package</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white shadow-lg overflow-hidden">
            <div className="aspect-[4/3] bg-gray-100">
              <img src={`${BACKEND_URL}${pkg.thumbnail}`} alt={pkg.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-medium mb-2">{pkg.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
              <p className="text-red-500 font-medium mb-3">{pkg.pricing}</p>
              <p className="text-xs text-gray-500 mb-3">{pkg.images?.length || 0} gallery images</p>
              <div className="flex gap-2">
                <button onClick={() => { setSelectedPackageId(pkg.id); }} className="flex-1 bg-blue-500 text-white py-2 hover:bg-blue-600 transition-colors text-sm">
                  Add Images
                </button>
                <button onClick={() => handleEdit(pkg)} className="bg-gray-500 text-white p-2 hover:bg-gray-600 transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(pkg.id)} className="bg-red-500 text-white p-2 hover:bg-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-light mb-4">{editingPackage ? 'Edit Package' : 'Add Package'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
                <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files[0])} required={!editingPackage} className="w-full px-4 py-2 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required rows="3" className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pricing</label>
                <input type="text" value={formData.pricing} onChange={(e) => setFormData({...formData, pricing: e.target.value})} required placeholder="₹40,000 - ₹80,000" className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 bg-gray-300 text-gray-700 py-3 hover:bg-gray-400 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-red-500 text-white py-3 hover:bg-red-600 transition-colors disabled:bg-gray-400">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Upload Modal */}
      {selectedPackageId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPackageId(null)}>
          <div className="bg-white max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-light mb-4">Add Gallery Images</h2>
            <div className="space-y-4">
              <input type="file" accept="image/*" multiple onChange={(e) => setGalleryImages(Array.from(e.target.files))} className="w-full px-4 py-2 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
              {galleryImages.length > 0 && <p className="text-sm text-gray-600">{galleryImages.length} images selected</p>}
              <div className="flex gap-3">
                <button onClick={() => setSelectedPackageId(null)} className="flex-1 bg-gray-300 text-gray-700 py-3 hover:bg-gray-400 transition-colors">Cancel</button>
                <button onClick={handleUploadGalleryImages} disabled={uploadingImages || galleryImages.length === 0} className="flex-1 bg-red-500 text-white py-3 hover:bg-red-600 transition-colors disabled:bg-gray-400">
                  {uploadingImages ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPackages;