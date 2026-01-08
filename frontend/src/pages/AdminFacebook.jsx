import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Save, Loader, CheckCircle, XCircle, TestTube } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminFacebook = () => {
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [settings, setSettings] = useState({
    pageId: '',
    accessToken: '',
    postsLimit: 6,
    enabled: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/facebook/settings`, {
        headers: getAuthHeaders()
      });
      setSettings(response.data);
    } catch (error) {
      toast.error('Failed to load Facebook settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!settings.pageId || !settings.accessToken) {
      toast.error('Please enter Page ID and Access Token first');
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);
      const response = await axios.post(`${API}/admin/facebook/test`, {
        pageId: settings.pageId,
        accessToken: settings.accessToken,
        postsLimit: settings.postsLimit,
        enabled: settings.enabled
      }, {
        headers: getAuthHeaders()
      });

      setTestResult(response.data);
      if (response.data.success) {
        toast.success('Connection successful!');
      } else {
        toast.error('Connection failed');
      }
    } catch (error) {
      toast.error('Failed to test connection');
      setTestResult({ success: false, message: 'Connection test failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axios.put(`${API}/admin/facebook/settings`, settings, {
        headers: getAuthHeaders()
      });
      toast.success('Facebook settings saved successfully');
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
        <h1 className="text-3xl font-light mb-2">Facebook Integration</h1>
        <p className="text-gray-600">Connect your Facebook page to display recent posts on your website</p>
      </div>

      <div className="max-w-3xl">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-6">
          <h3 className="font-medium text-blue-900 mb-3">How to get your Facebook Page Access Token:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Go to <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="underline">Facebook Graph API Explorer</a></li>
            <li>Click "Generate Access Token" and grant permissions</li>
            <li>Select your Facebook Page from the dropdown</li>
            <li>Generate a long-lived token (recommended: use Page Access Token)</li>
            <li>Copy the Page ID and Access Token below</li>
          </ol>
          <p className="mt-3 text-sm text-blue-700">
            <strong>Note:</strong> Your Page ID can be found in your Facebook Page settings under "About"
          </p>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 shadow-lg space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook Page ID
            </label>
            <input
              type="text"
              value={settings.pageId}
              onChange={(e) => setSettings({ ...settings, pageId: e.target.value })}
              placeholder="123456789012345"
              className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your Facebook Page ID (numeric)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Access Token
            </label>
            <textarea
              value={settings.accessToken}
              onChange={(e) => setSettings({ ...settings, accessToken: e.target.value })}
              placeholder="EAAxxxxxxxxxx..."
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors resize-none font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Long-lived Page Access Token from Facebook Graph API
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Posts to Display
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={settings.postsLimit}
              onChange={(e) => setSettings({ ...settings, postsLimit: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="w-5 h-5 text-red-500 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Enable Facebook Posts Section
              </span>
            </label>
          </div>

          {/* Test Connection */}
          <div className="border-t pt-6">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || !settings.pageId || !settings.accessToken}
              className="w-full bg-blue-500 text-white py-3 hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 mb-4"
            >
              {testing ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <TestTube className="w-5 h-5" />
              )}
              <span>{testing ? 'Testing Connection...' : 'Test Connection'}</span>
            </button>

            {testResult && (
              <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-start gap-3">
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium ${testResult.success ? 'text-green-900' : 'text-red-900'}`}>
                      {testResult.message}
                    </p>
                    {testResult.success && (
                      <div className="mt-2 text-sm text-green-800">
                        <p><strong>Page Name:</strong> {testResult.pageName}</p>
                        <p><strong>Followers:</strong> {testResult.followers?.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
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
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </form>

        {/* Preview Notice */}
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg mt-6">
          <h3 className="font-medium text-gray-900 mb-2">Preview</h3>
          <p className="text-sm text-gray-600">
            Once enabled and saved, recent Facebook posts will automatically appear on your homepage.
            Posts are refreshed when users visit the page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminFacebook;
