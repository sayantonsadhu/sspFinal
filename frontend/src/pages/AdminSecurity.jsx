import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Save, Loader, Shield, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminSecurity = () => {
  const { getAuthHeaders, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    old_password: '',
    new_username: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/credentials`, {
        headers: getAuthHeaders()
      });
      setCurrentUsername(response.data.username);
      setFormData(prev => ({ ...prev, new_username: response.data.username }));
    } catch (error) {
      toast.error('Failed to load admin credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.old_password) {
      toast.error('Please enter your current password');
      return;
    }
    
    if (formData.new_password && formData.new_password !== formData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (formData.new_password && formData.new_password.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    
    try {
      setSaving(true);
      
      const payload = {
        old_password: formData.old_password,
        new_username: formData.new_username !== currentUsername ? formData.new_username : null,
        new_password: formData.new_password || null
      };
      
      await axios.put(`${API}/admin/credentials`, payload, {
        headers: getAuthHeaders()
      });
      
      toast.success('Credentials updated successfully! Please log in again.');
      
      // Clear form
      setFormData({
        old_password: '',
        new_username: formData.new_username,
        new_password: '',
        confirm_password: ''
      });
      
      // Log out user after credential change
      setTimeout(() => {
        logout();
      }, 2000);
      
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to update credentials';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" data-testid="security-loading">
        <Loader className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="admin-security-page">
      <div className="mb-8">
        <h1 className="text-3xl font-light mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8 text-red-500" />
          Security Settings
        </h1>
        <p className="text-gray-600">Change your admin username and password</p>
      </div>

      <div className="max-w-xl">
        {/* Security Tips */}
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg mb-6">
          <h3 className="font-medium text-amber-900 mb-3">Security Recommendations:</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-amber-800">
            <li>Use a strong password with at least 8 characters</li>
            <li>Include uppercase, lowercase, numbers, and special characters</li>
            <li>Don't reuse passwords from other accounts</li>
            <li>Change your password periodically</li>
          </ul>
        </div>

        {/* Current Credentials */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-600">
            Current Username: <span className="font-medium text-gray-900">{currentUsername}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 shadow-lg space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? 'text' : 'password'}
                value={formData.old_password}
                onChange={(e) => setFormData({ ...formData, old_password: e.target.value })}
                placeholder="Enter your current password"
                className="w-full px-4 py-3 pr-12 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                data-testid="current-password-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* New Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Username
            </label>
            <input
              type="text"
              value={formData.new_username}
              onChange={(e) => setFormData({ ...formData, new_username: e.target.value })}
              placeholder="Enter new username"
              className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
              data-testid="new-username-input"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave unchanged to keep current username
            </p>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                placeholder="Enter new password (min. 6 characters)"
                className="w-full px-4 py-3 pr-12 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                data-testid="new-password-input"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to keep current password
            </p>
          </div>

          {/* Confirm Password */}
          {formData.new_password && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                  data-testid="confirm-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.new_password && formData.confirm_password && (
                <div className="mt-2">
                  {formData.new_password === formData.confirm_password ? (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Passwords match
                    </p>
                  ) : (
                    <p className="text-sm text-red-600">Passwords do not match</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-red-500 text-white py-3 hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
            data-testid="save-credentials-btn"
          >
            {saving ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{saving ? 'Updating...' : 'Update Credentials'}</span>
          </button>
        </form>

        {/* Warning Notice */}
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg mt-6">
          <h3 className="font-medium text-red-900 mb-2">Important</h3>
          <p className="text-sm text-red-800">
            After changing your credentials, you will be logged out and need to log in again 
            with your new username and/or password.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSecurity;
