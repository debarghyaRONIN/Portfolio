"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Navbar from '@/components/main/Navbar';

interface BlogPost {
  title: string;
  description: string;
  date: string;
  categories: string[];
  image: string;
  link: string;
}

const categories = [
  "All",
  "Machine Learning",
  "Deep Learning",
  "MLOps",
  "Computer Vision",
  "NLP",
  "Reinforcement Learning",
  "Data Science"
];

const BlogPage = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>(["All"]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Listen for theme changes
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(!document.documentElement.classList.contains('light-mode'));
    };
    checkTheme();
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const handleFilterClick = (category: string) => {
    if (category === "All") {
      setActiveFilters(["All"]);
    } else {
      const newFilters = activeFilters.includes("All") 
        ? [category]
        : activeFilters.includes(category)
          ? activeFilters.filter(f => f !== category)
          : [...activeFilters, category];
      setActiveFilters(newFilters.length ? newFilters : ["All"]);
    }
  };

  const blogPosts: BlogPost[] = [
    {
      title: "Computer Vision for Real-time Object Detection",
      description: "Exploring YOLOv8 and other modern object detection architectures for real-time applications.",
      date: "2024-04-28",
      categories: ["Computer Vision", "Deep Learning"],
      image: "/mainIcons.svg",
      link: "/blog/realtime-object-detection"
    },
    {
      title: "Reinforcement Learning in Pokemon Game Environment",
      description: "Implementation details of training an AI agent to play Pokemon using RL techniques.",
      date: "2024-04-25",
      categories: ["Reinforcement Learning", "Deep Learning"],
      image: "/red.jpg",
      link: "/blog/pokemon-rl"
    }
  ];

  const filteredPosts = blogPosts.filter(post => {
    // Handle search query first
    const matchesSearch = searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // If "All" is selected, show all posts that match the search
    if (activeFilters.includes("All")) {
      return true;
    }

    // Check if post matches ALL selected categories (AND condition)
    return activeFilters.every(filter => post.categories.includes(filter));
  });

  // Dynamic classes based on black/white/blue theme
  const bgClasses = isDarkMode ? "bg-[#0A0F1A]" : "bg-gray-50";
  const gradientClasses = isDarkMode
    ? "bg-gradient-to-r from-blue-900/5 via-blue-800/5 to-blue-700/5"
    : "bg-gradient-to-r from-blue-600/5 via-blue-500/5 to-blue-400/5";
  const headingGradient = isDarkMode 
    ? "from-blue-400 to-blue-600" 
    : "from-blue-700 to-blue-900"; // Darker blue gradient for light mode
  const cardBgClasses = isDarkMode
    ? "bg-[#111827]/50 border-blue-900/30 hover:border-blue-700/50"
    : "bg-white/90 border-blue-500 hover:border-blue-600"; // Darker border colors
  const textClasses = isDarkMode ? "text-gray-200" : "text-gray-900"; // Darker text in light mode

  return (
    <>
      <Navbar />
      <div className={`min-h-screen pt-20 ${bgClasses} transition-colors duration-500`}>
        {/* Responsive container - adapts to screen size */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-16 mx-auto max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl transition-all duration-300">
          {/* SEO Header */}
          <div className="text-center mb-16 space-y-6">
            <h1 className={`text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${headingGradient} mb-4 transition-colors duration-500`}>
              Machine Learning Blog(Under Development)
            </h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'} text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed transition-colors duration-500`}>
              Deep dives into Machine Learning, MLOps best practices, and the intersection of AI with software engineering.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md sm:max-w-xl md:max-w-2xl mx-auto mt-8">
              <div className={`relative rounded-lg overflow-hidden border ${isDarkMode ? 'border-blue-800/50' : 'border-blue-500'} transition-all duration-300`}>
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-4 sm:px-6 py-3 sm:py-4 outline-none text-base sm:text-lg transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-[#111827]/50 text-gray-200 placeholder-gray-400 focus:bg-[#111827]/80'
                      : 'bg-white text-gray-900 placeholder-gray-600 focus:bg-blue-50'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors duration-300 ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-white hover:bg-blue-800/30' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-blue-100'
                    }`}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter Pills - made responsive with container query */}
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-8 sm:mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleFilterClick(category)}
                className={`px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                  activeFilters.includes(category)
                    ? isDarkMode
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : isDarkMode
                      ? 'bg-[#111827]/50 text-gray-200 hover:bg-[#111827]/80 border border-blue-900/30'
                      : 'bg-white text-gray-900 hover:bg-blue-50 border border-blue-500'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Blog Posts Grid - More responsive breakpoints */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post, index) => (
                <motion.article
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`${cardBgClasses} rounded-xl overflow-hidden border transition-all duration-500 hover:shadow-xl hover:-translate-y-1 group`}
                >
                  <div className="relative h-40 sm:h-48 lg:h-52 overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {post.categories.map((category, idx) => (
                          <span
                            key={idx}
                            className={`text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full ${
                              isDarkMode
                                ? 'bg-blue-900/50 text-blue-200'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6 space-y-2 sm:space-y-4">
                    <h2 className={`text-lg sm:text-xl font-bold leading-tight ${isDarkMode ? 'text-gray-200' : 'text-gray-900'} group-hover:text-blue-500 transition-colors duration-300`}>
                      {post.title}
                    </h2>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-900'} text-sm sm:text-base line-clamp-3 transition-colors duration-300`}>
                      {post.description}
                    </p>
                    <div className="flex items-center justify-between pt-2 sm:pt-4">
                      <time className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                      <a
                        href={post.link}
                        className={`inline-flex items-center text-xs sm:text-sm font-semibold ${
                          isDarkMode
                            ? 'text-blue-300 hover:text-blue-200'
                            : 'text-blue-700 hover:text-blue-800'
                        }`}
                      >
                        Read article
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </motion.article>
              ))
            ) : (
              <div className={`col-span-full text-center py-12 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                <p className="text-xl">No posts found matching your criteria</p>
                <button 
                  onClick={() => {
                    setActiveFilters(["All"]); 
                    setSearchQuery("");
                  }}
                  className={`mt-4 px-5 py-2 rounded-md ${
                    isDarkMode 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPage;
