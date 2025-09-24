import React from 'react';
import { Wine, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Wine className="h-8 w-8 text-red-400" />
              <h3 className="text-2xl font-bold">WineNation</h3>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Your premier destination for exceptional beverages from around the world. 
              Discover, taste, and enjoy the finest wines, spirits, champagne, and more curated by our experts.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Our Collection</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tasting Events</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Gift Cards</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-red-400" />
                <span className="text-gray-400 text-sm">2A Admiralty Way, beside Fidelity Bank, Eti-Osa, Lekki, Lagos</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-red-400" />
                <span className="text-gray-400 text-sm">+234 702 500 5480</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-red-400" />
                <span className="text-gray-400 text-sm">admin@winenation.ng</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 WineNation. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Shipping Info
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}