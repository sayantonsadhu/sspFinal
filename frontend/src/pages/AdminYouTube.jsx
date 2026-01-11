import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Save, Loader, CheckCircle, XCircle, TestTube, Youtube, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminYouTube = () => {
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [settings, setSettings] = useState({
    channel_id: '',
    api_key: '',
    max_videos: 6,
    enabled: false,
    section_title: 'YouTube Stories',
    section_description: 'Watch our latest stories and behind-the-scenes'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/youtube/settings`, {
        headers: getAuthHeaders()
      });
      setSettings(response.data);
    } catch (error) {
      toast.error('Failed to load YouTube settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!settings.channel_id || !settings.api_key) {
      toast.error('Please enter Channel ID and API Key first');
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);
      
      const formData = new FormData();
      formData.append('channel_id', settings.channel_id);
      formData.append('api_key', settings.api_key);
      
      const response = await axios.post(`${API}/admin/youtube/test`, formData, {
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
      await axios.put(`${API}/admin/youtube/settings`, settings, {
        headers: getAuthHeaders()
      });
      toast.success('YouTube settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" data-testid="youtube-loading">
        <Loader className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="admin-youtube-page">
      <div className="mb-8">
        <h1 className="text-3xl font-light mb-2 flex items-center gap-3">
          <Youtube className="w-8 h-8 text-red-500" />
          YouTube Stories
        </h1>
        <p className="text-gray-600">Display your latest YouTube videos on the homepage</p>
      </div>

      <div className="max-w-3xl">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-6">
          <h3 className="font-medium text-blue-900 mb-3">How to get your YouTube API Key:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
            <li>Create a new project or select an existing one</li>
            <li>Enable the "YouTube Data API v3"</li>
            <li>Go to "Credentials" and create an API Key</li>
            <li>Copy the API Key and paste it below</li>
          </ol>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">How to find your Channel ID:</h4>
            <p className="text-sm text-blue-800">
              Go to your YouTube channel → Click on "Customize Channel" → Settings → Advanced Settings. 
              Your Channel ID starts with "UC" (e.g., UCxxxxxxxxxxxxxxxxxxxxxx).
            </p>
          </div>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 shadow-lg space-y-6">
          {/* Section Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Title
            </label>
            <input
              type="text"
              value={settings.section_title}
              onChange={(e) => setSettings({ ...settings, section_title: e.target.value })}
              placeholder="YouTube Stories"
              className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
              data-testid="youtube-section-title"
            />
          </div>

          {/* Section Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Description
            </label>
            <textarea
              value={settings.section_description}
              onChange={(e) => setSettings({ ...settings, section_description: e.target.value })}
              placeholder="Watch our latest stories and behind-the-scenes"
              rows="2"
              className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors resize-none"
              data-testid="youtube-section-description"
            />
          </div>

          <hr className="border-gray-200" />

          {/* Channel ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube Channel ID
            </label>
            <input
              type="text"
              value={settings.channel_id}
              onChange={(e) => setSettings({ ...settings, channel_id: e.target.value })}
              placeholder="UCxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors font-mono"
              data-testid="youtube-channel-id"
            />
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube API Key
            </label>
            <input
              type="password"
              value={settings.api_key}
              onChange={(e) => setSettings({ ...settings, api_key: e.target.value })}
              placeholder="AIzaxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors font-mono"
              data-testid="youtube-api-key"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your API key is stored securely and never exposed publicly
            </p>
          </div>

          {/* Max Videos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Videos to Display
            </label>
            <input
              type="number"
              min="1"
              max="12"
              value={settings.max_videos}
              onChange={(e) => setSettings({ ...settings, max_videos: parseInt(e.target.value) || 6 })}
              className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
              data-testid="youtube-max-videos"
            />
          </div>

          {/* Enable/Disable Toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="w-5 h-5 text-red-500 border-gray-300 rounded focus:ring-red-500"
                data-testid="youtube-enabled-toggle"
              />
              <span className="text-sm font-medium text-gray-700">
                Enable YouTube Stories Section
              </span>
            </label>
          </div>

          {/* Test Connection */}
          <div className="border-t pt-6">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || !settings.channel_id || !settings.api_key}
              className="w-full bg-blue-500 text-white py-3 hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 mb-4"
              data-testid="youtube-test-btn"
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
                        <p><strong>Channel Name:</strong> {testResult.channelName}</p>
                        <p><strong>Subscribers:</strong> {parseInt(testResult.subscribers).toLocaleString()}</p>
                        <p><strong>Videos:</strong> {parseInt(testResult.videoCount).toLocaleString()}</p>
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
            data-testid="youtube-save-btn"
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
            Once enabled and saved, your latest YouTube videos will appear on the homepage 
            in a beautiful grid layout. Videos are cached for performance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminYouTube;
