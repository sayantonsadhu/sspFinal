import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Save, Loader, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const sections = [
  { key: 'weddings', name: 'Recent Weddings', hasDescription: false },
  { key: 'films', name: 'Wedding Films', hasDescription: true },
  { key: 'about', name: 'About Section', hasDescription: false },
  { key: 'packages', name: 'Packages Section', hasDescription: false },
  { key: 'contact', name: 'Contact Section', hasDescription: false }
];

const AdminSectionContent = () => {
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [sectionData, setSectionData] = useState({});

  useEffect(() => {
    fetchAllSections();
  }, []);

  const fetchAllSections = async () => {
    try {
      setLoading(true);
      const promises = sections.map(section => 
        axios.get(`${API}/admin/sections/${section.key}`, {
          headers: getAuthHeaders()
        })
      );
      
      const responses = await Promise.all(promises);
      const data = {};
      responses.forEach((response, index) => {
        data[sections[index].key] = response.data;
      });
      setSectionData(data);
    } catch (error) {
      toast.error('Failed to load section content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (sectionKey) => {
    try {
      setSaving(prev => ({ ...prev, [sectionKey]: true }));
      
      await axios.put(
        `${API}/admin/sections/${sectionKey}`,
        sectionData[sectionKey],
        { headers: getAuthHeaders() }
      );
      
      toast.success(`${sections.find(s => s.key === sectionKey)?.name} updated successfully`);
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setSaving(prev => ({ ...prev, [sectionKey]: false }));
    }
  };

  const updateSection = (sectionKey, field, value) => {
    setSectionData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" data-testid="section-content-loading">
        <Loader className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="admin-section-content-page">
      <div className="mb-8">
        <h1 className="text-3xl font-light mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8 text-red-500" />
          Section Content
        </h1>
        <p className="text-gray-600">Customize the titles and descriptions for each section of your website</p>
      </div>

      <div className="max-w-4xl space-y-8">
        {sections.map((section) => (
          <div key={section.key} className="bg-white p-6 shadow-lg rounded-lg">
            <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              {section.name}
            </h2>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Title
                </label>
                <input
                  type="text"
                  value={sectionData[section.key]?.title || ''}
                  onChange={(e) => updateSection(section.key, 'title', e.target.value)}
                  placeholder="Enter section title"
                  className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                  data-testid={`section-${section.key}-title`}
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={sectionData[section.key]?.subtitle || ''}
                  onChange={(e) => updateSection(section.key, 'subtitle', e.target.value)}
                  placeholder="Enter subtitle or tagline"
                  className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                  data-testid={`section-${section.key}-subtitle`}
                />
              </div>

              {/* Description (for sections that have it) */}
              {section.hasDescription && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={sectionData[section.key]?.description || ''}
                    onChange={(e) => updateSection(section.key, 'description', e.target.value)}
                    placeholder="Enter a longer description"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors resize-none"
                    data-testid={`section-${section.key}-description`}
                  />
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={() => handleSave(section.key)}
                disabled={saving[section.key]}
                className="bg-red-500 text-white px-6 py-2 hover:bg-red-600 transition-colors flex items-center gap-2 disabled:bg-gray-400"
                data-testid={`section-${section.key}-save-btn`}
              >
                {saving[section.key] ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving[section.key] ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        ))}

        {/* Info Notice */}
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            How it works
          </h3>
          <p className="text-sm text-blue-800">
            Changes are saved per section and will be reflected on your website immediately. 
            The title appears as the main heading, and the subtitle appears below it as a 
            supporting tagline.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSectionContent;
