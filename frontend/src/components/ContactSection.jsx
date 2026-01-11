import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ContactSection = () => {
  const [settings, setSettings] = useState(null);
  const [sectionContent, setSectionContent] = useState({
    title: "Let's Create Magic Together",
    subtitle: "Ready to capture your special moments? Get in touch and let's discuss your dream wedding photography"
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    weddingDate: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, contentRes] = await Promise.all([
        axios.get(`${API}/settings`),
        axios.get(`${API}/sections/contact`)
      ]);
      setSettings(settingsRes.data);
      if (contentRes.data) {
        setSectionContent(prev => ({
          ...prev,
          title: contentRes.data.title || prev.title,
          subtitle: contentRes.data.subtitle || prev.subtitle
        }));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(`${API}/contact`, formData);
      toast.success('Thank you for your inquiry! We will get back to you soon.');
      setFormData({ name: '', email: '', phone: '', weddingDate: '', message: '' });
    } catch (error) {
      toast.error('Failed to send inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 px-6 bg-white" data-testid="contact-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-light tracking-wide mb-4">
            {sectionContent.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {sectionContent.subtitle}
          </p>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label htmlFor="weddingDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Wedding Date
                </label>
                <input
                  type="date"
                  id="weddingDate"
                  value={formData.weddingDate}
                  onChange={(e) => setFormData({...formData, weddingDate: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Tell Us About Your Wedding
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors resize-none"
                  placeholder="Share your vision, theme, or any special requests..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-500 text-white py-4 hover:bg-red-600 transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-sm font-medium disabled:bg-gray-400"
              >
                {submitting ? 'Sending...' : (
                  <>
                    <span>Send Inquiry</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            {settings && (
              <>
                <div className="bg-gray-50 p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-red-500 p-3 rounded-lg">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-2">Call Us</h3>
                      <p className="text-gray-600">{settings.phone}</p>
                      <p className="text-sm text-gray-500 mt-1">Available 10 AM - 8 PM</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-red-500 p-3 rounded-lg">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-2">Email Us</h3>
                      <p className="text-gray-600">{settings.email}</p>
                      <p className="text-sm text-gray-500 mt-1">We'll reply within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-red-500 p-3 rounded-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-2">Visit Studio</h3>
                      <p className="text-gray-600">{settings.address}</p>
                      <p className="text-sm text-gray-500 mt-1">By appointment only</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="bg-red-50 p-8">
              <h3 className="text-2xl font-light mb-4">Why Choose Us?</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  Award-winning photography
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  Professional team
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  Customized packages
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  Destination coverage
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  Fast delivery
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;