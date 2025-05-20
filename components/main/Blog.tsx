"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  category: string;
  summary: string;
  date: string;
  author: string;
  readTime: string;
  image: string;
  link: string;
}

const categories = [
  "All Posts",
  "Machine Learning",
  "Deep Learning",
  "MLOps",
  "Computer Vision",
  "NLP",
  "Reinforcement Learning"
];

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Building Scalable MLOps Pipelines with GitLab CI/CD",
    category: "MLOps",
    summary: "Learn how to implement MLOps practices using GitLab CI/CD for automated ML model development, testing, and deployment. This comprehensive guide covers pipeline components, best practices, and practical implementation steps.",
    date: "2024-05-01",
    author: "Debarghya Saha",
    readTime: "10 min read",
    image: "/mainIconsdark.svg",
    link: "/blog/mlops-gitlab-cicd"
  },
  // Add more blog posts here
];

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Posts");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Theme detection and sync
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(!document.documentElement.classList.contains('light-mode'));
    };
    
    // Initial theme check - first check localStorage, then system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
    }
    
    // Set up mutation observer to watch for theme changes
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

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "All Posts" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const textClasses = isDarkMode ? "text-gray-200" : "text-black";
  const descriptionClasses = isDarkMode ? "text-gray-300" : "text-black";
  const dateClasses = isDarkMode ? "text-gray-300" : "text-black";

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'dark' : ''}`}>
      {/* Featured Post Section */}
      <section className="mb-16">
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-2xl ${
            isDarkMode 
              ? 'bg-gradient-to-r from-red-900/90 via-red-800/90 to-yellow-900/90'
              : 'bg-gradient-to-r from-blue-900/90 via-blue-800/90 to-blue-700/90'
          } text-white`}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10"></div>
          <div className="relative z-20 p-6 md:p-10">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                    isDarkMode 
                      ? 'bg-red-500/30' 
                      : 'bg-blue-500/30'
                  }`}>
                    Featured
                  </span>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                    {blogPosts[0].title}
                  </h1>
                </div>
                <p className="text-base sm:text-lg text-gray-100 line-clamp-3 sm:line-clamp-4">
                  {blogPosts[0].summary}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-200">
                  <span>{blogPosts[0].date}</span>
                  <span>•</span>
                  <span>{blogPosts[0].readTime}</span>
                </div>
                <a 
                  href={blogPosts[0].link}
                  className={`inline-block px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white hover:shadow-orange-500/20 hover:shadow-lg'
                      : 'bg-white text-blue-600 hover:bg-blue-50 hover:shadow-blue-500/20 hover:shadow-lg'
                  }`}
                >
                  Read Article →
                </a>
              </div>
              <div className="relative w-full lg:w-2/5 aspect-[16/9] lg:aspect-square rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={blogPosts[0].image}
                  alt={blogPosts[0].title}
                  fill
                  className="object-cover transform hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
            </div>
          </div>
        </motion.article>
      </section>

      {/* Category Navigation */}
      <nav className="mb-12 overflow-x-auto scrollbar-hide">
        <div className="flex space-x-4 min-w-max">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${selectedCategory === category
                  ? isDarkMode 
                    ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-blue-400 text-white'
                  : isDarkMode
                    ? 'text-gray-300 hover:bg-gray-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </nav>

      {/* Blog Posts Grid */}
      <div className="relative w-full h-full">
        <div className="space-y-8">
          <h2 className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-black'}`}>
            Latest Blog Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post, index) => (
              <article 
                key={index}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <div className="p-6">
                  <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-gray-100' : 'text-black'}`}>
                    {post.title}
                  </h3>
                  <p className={`mb-4 ${descriptionClasses}`}>
                    {post.summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${dateClasses}`}>
                      {post.date}
                    </span>
                    <Link
                      href={post.link}
                      className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} font-medium text-sm`}
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-12 flex justify-center">
        <nav className="flex items-center space-x-2">
          <button className={`p-2 rounded-lg ${
            isDarkMode
              ? 'text-gray-400 hover:text-orange-400'
              : 'text-gray-500 hover:text-blue-600'
          } disabled:opacity-50`}>
            ← Previous
          </button>
          <span className={`px-4 py-2 rounded-lg text-white ${
            isDarkMode
              ? 'bg-gradient-to-r from-red-600 to-yellow-500'
              : 'bg-gradient-to-r from-blue-600 to-blue-400'
          }`}>1</span>
          <button className={`p-2 rounded-lg ${
            isDarkMode
              ? 'text-gray-400 hover:text-orange-400'
              : 'text-gray-500 hover:text-blue-600'
          }`}>
            Next →
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Blog;