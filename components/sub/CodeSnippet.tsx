import React, { useEffect, useState } from 'react';
import Prism from 'prismjs';
import toast from 'react-hot-toast';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/plugins/line-numbers/prism-line-numbers';

interface CodeSnippetProps {
  code: string;
  language: string;
  fileName?: string;
  description?: string;
  showLineNumbers?: boolean;
}

const CodeSnippet: React.FC<CodeSnippetProps> = ({
  code,
  language,
  fileName,
  description,
  showLineNumbers = true,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [code]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      toast.success('Code copied to clipboard!', {
        duration: 2000,
        position: 'bottom-right',
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '8px',
        },
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
      toast.error('Failed to copy code', {
        duration: 2000,
        position: 'bottom-right',
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '8px',
        },
      });
    }
  };

  return (
    <div className="my-6 rounded-lg overflow-hidden">
      {/* Header with filename and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
        <div className="flex items-center space-x-3">
          {fileName && (
            <span className="text-sm font-mono opacity-75">{fileName}</span>
          )}
          {language && (
            <span className="px-2 py-1 text-xs rounded-md bg-gray-700">
              {language.toUpperCase()}
            </span>
          )}
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center space-x-2 px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
          aria-label={isCopied ? "Code copied!" : "Copy code to clipboard"}
        >
          {isCopied ? (
            <>
              <svg
                className="w-4 h-4 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm">Copied!</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm">Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code description if provided */}
      {description && (
        <div className="px-4 py-2 bg-gray-700 text-gray-300 text-sm">
          {description}
        </div>
      )}

      {/* Code block */}
      <div className="relative">
        <pre 
          className={`line-numbers m-0 language-${language}`}
          aria-label={`Code snippet ${fileName ? `from ${fileName}` : ''}`}
          tabIndex={0}
        >
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeSnippet;