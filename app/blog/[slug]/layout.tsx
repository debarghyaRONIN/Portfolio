import React from 'react';

interface BlogPostLayoutProps {
  children: React.ReactNode;
}

const BlogPostLayout: React.FC<BlogPostLayoutProps> = ({ children }) => {
  return (
    <div className="container mx-auto px-4">
      <article className="prose prose-lg md:prose-xl max-w-none w-full
        dark:prose-invert 
        prose-headings:text-gray-900 dark:prose-headings:text-gray-100
        prose-p:text-gray-800 dark:prose-p:text-gray-200
        prose-strong:text-gray-900 dark:prose-strong:text-gray-100
        prose-code:text-gray-800 dark:prose-code:text-gray-200
        prose-code:bg-gray-100 dark:prose-code:bg-gray-800
        prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800
        prose-a:text-blue-600 dark:prose-a:text-blue-400
        prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
        prose-li:text-gray-800 dark:prose-li:text-gray-200">
        {children}
      </article>
    </div>
  );
};

export default BlogPostLayout;