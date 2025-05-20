"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BlogNavbar from '@/components/main/BlogNavbar';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  // Listen for theme changes
  React.useEffect(() => {
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

  // Dynamic classes based on theme
  const bgClasses = isDarkMode ? "bg-[#0A0F1A]" : "bg-gray-50";
  const textClasses = isDarkMode ? "text-gray-300" : "text-gray-700";
  const headingGradient = isDarkMode 
    ? "from-blue-400 to-blue-600" 
    : "from-blue-600 to-blue-800";
  const contentBgClass = isDarkMode
    ? "bg-[#111827]/50 border-blue-900/30"
    : "bg-white/90 border-blue-200";

  return (
    <>
      <BlogNavbar />
      <article className={`min-h-screen ${bgClasses} transition-colors duration-500 pt-20`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-12 lg:px-8 py-300">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={() => router.push('/blog')}
              className={`mb-8 inline-flex items-center text-sm font-medium transition-colors duration-300 ${
                isDarkMode 
                  ? 'text-blue-400 hover:text-blue-300' 
                  : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              <svg
                className="mr-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Blog
            </button>

            <div className={`${contentBgClass} rounded-lg border p-8 shadow-lg backdrop-blur-sm transition-all duration-500`}>
              <div className="mb-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className={`text-sm px-3 py-1 rounded-full transition-colors duration-300 ${
                      isDarkMode
                        ? 'bg-blue-900/50 text-blue-200'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    MLOps
                  </span>
                </div>
                <h1 className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${headingGradient} mb-4 transition-colors duration-500`}>
                  Getting Started with MLOps: A Comprehensive Guide
                </h1>
                <div className="flex items-center gap-4 text-sm">
                  <span className={`${textClasses} transition-colors duration-300`}>Debarghya Saha</span>
                  <span className={`${textClasses} transition-colors duration-300`}>•</span>
                  <span className={`${textClasses} transition-colors duration-300`}>May 1, 2024</span>
                </div>
              </div>

              <div className="relative h-[400px] mb-8 rounded-lg overflow-hidden border border-blue-900/20">
                <Image
                  src="/mainIcons.svg"
                  alt="MLOps Illustration"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div className={`prose ${textClasses} max-w-none transition-colors duration-300`}>
                <p>
                  Deep dives into Machine Learning concepts...
                </p>
                {/* Add more content sections */}
              </div>
            </div>
          </motion.div>
        </div>
      </article>
    </>
  );
}