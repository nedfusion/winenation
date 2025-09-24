import React from 'react';

export default function Hero() {
  return (
    <section className="relative h-96 md:h-[500px] bg-gradient-to-r from-red-900 to-red-700 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.pexels.com/photos/4553618/pexels-photo-4553618.jpeg?auto=compress&cs=tinysrgb&w=1920")'
        }}
      ></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="text-white max-w-2xl">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Discover Premium Beverages
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            From vintage wines to premium spirits, explore our curated collection of exceptional beverages from around the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-white text-red-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Shop Now
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-700 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}