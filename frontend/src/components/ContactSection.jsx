import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactSection = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // This will be connected to backend later
    alert('Thank you for your inquiry! We will get back to you soon.');
  };

  return (
    <section id="contact" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-light tracking-wide mb-4">
            Let's Create Magic Together
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ready to capture your special moments? Get in touch and let's discuss your dream wedding photography
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
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Wedding Date
                </label>
                <input
                  type="date"
                  id="date"
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
                  required
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors resize-none"
                  placeholder="Share your vision, theme, or any special requests..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-500 text-white py-4 hover:bg-red-600 transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-sm font-medium"
              >
                <span>Send Inquiry</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-gray-50 p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-red-500 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Call Us</h3>
                  <p className="text-gray-600">+91 98765 43210</p>
                  <p className="text-sm text-gray-500 mt-1">Available 10 AM - 8 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="bg-red-500 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Email Us</h3>
                  <p className="text-gray-600">hello@rigphotography.com</p>
                  <p className="text-sm text-gray-500 mt-1">We'll reply within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-red-500 p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Visit Studio</h3>
                  <p className="text-gray-600">Kolkata, West Bengal</p>
                  <p className="text-sm text-gray-500 mt-1">By appointment only</p>
                </div>
              </div>
            </div>

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