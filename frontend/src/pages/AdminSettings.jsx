import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Save, Upload, Loader } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminSettings = () => {
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: '',
    phone: '',
    email: '',
    address: '',
    logoUrl: null
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
      if (response.data.logoUrl) {
        setLogoPreview(`${BACKEND_URL}${response.data.logoUrl}`);
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('logo', logoFile);

      const response = await axios.post(`${API}/settings/upload-logo`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });

      setSettings({ ...settings, logoUrl: response.data.logoUrl });
      setLogoPreview(`${BACKEND_URL}${response.data.logoUrl}`);
      setLogoFile(null);
      toast.success('Logo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axios.put(`${API}/settings`, {
        siteName: settings.siteName,
        phone: settings.phone,
        email: settings.email,
        address: settings.address
      }, {
        headers: getAuthHeaders()
      });
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
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
        <h1 className="text-3xl font-light mb-2">Site Settings</h1>
        <p className="text-gray-600">Manage your website branding and contact information</p>
      </div>

      <div className="max-w-2xl">
        {/* Logo & Site Name Section */}
        <div className="bg-white p-6 shadow-lg mb-6">
          <h2 className="text-xl font-medium mb-4">Website Branding</h2>
          
          <div className="space-y-6">
            {/* Site Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                placeholder="Sayanton Sadhu Photography"
                className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
              />
              <p className="text-sm text-gray-500 mt-1">
                This name will appear in the header and throughout the website
              </p>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Logo (Optional)
              </label>
              {logoPreview && (
                <div className="border border-gray-200 p-4 mb-3 inline-block">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-h-32 object-contain"
                  />
                </div>
              )}
              <div className="flex gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="flex-1 px-4 py-2 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                />
                {logoFile && (
                  <button
                    onClick={uploadLogo}
                    disabled={uploading}
                    className="bg-red-500 text-white px-6 py-2 hover:bg-red-600 transition-colors flex items-center gap-2 disabled:bg-gray-400"
                  >
                    {uploading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>Upload</span>
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Recommended: PNG or SVG with transparent background. If no logo is uploaded, site name will be displayed.
              </p>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSaveSettings} className="bg-white p-6 shadow-lg">
          <h2 className="text-xl font-medium mb-4">Contact Information</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                id="address"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                required
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors resize-none"
              />
            </div>

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
              <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
