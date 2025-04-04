"use client";

import React, { useState } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

const EmailContact = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [formData, setFormData] = useState({
    senderEmail: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  // Dynamic classes based on theme
  const inputBgClass = isDarkMode ? "bg-gray-900/60" : "bg-white/90";
  const inputBorderClass = isDarkMode ? "border-gray-700" : "border-gray-300";
  const inputTextClass = isDarkMode ? "text-gray-200" : "text-gray-900";
  const buttonClass = isDarkMode 
    ? "bg-red-600 hover:bg-red-700 text-white" 
    : "bg-blue-600 hover:bg-blue-700 text-white";
  const headingClass = isDarkMode ? "text-white" : "text-gray-900";
  const borderClass = isDarkMode ? "border-gray-800" : "border-gray-300";
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus({});

    try {
      // Send to our API endpoint
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      // Fallback for development testing - open mailto link
      if (process.env.NODE_ENV === 'development') {
        const mailtoUrl = `mailto:debarghyasren@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
          `From: ${formData.senderEmail}\n\n${formData.message}`
        )}`;
        window.open(mailtoUrl, '_blank');
      }
      
      // On success
      setFormStatus({
        success: true,
        message: data.message || "Email sent successfully!"
      });
      
      // Reset form data
      setFormData({
        senderEmail: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      setFormStatus({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong. Please try again or contact me directly."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <h3 className={`text-lg font-semibold ${headingClass} mb-4 pb-2 border-b ${borderClass} transition-colors duration-500`}>
        Send Me an Email
      </h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div>
          <label 
            htmlFor="senderEmail" 
            className={`block text-sm font-medium mb-1 ${inputTextClass} transition-colors duration-500`}
          >
            Your Email
          </label>
          <input
            type="email"
            id="senderEmail"
            name="senderEmail"
            value={formData.senderEmail}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 rounded-md ${inputBgClass} ${inputBorderClass} ${inputTextClass} border focus:ring-2 focus:ring-opacity-50 ${
              isDarkMode ? "focus:ring-red-500" : "focus:ring-blue-500"
            } transition-all duration-300`}
            placeholder="your.email@example.com"
          />
        </div>
        
        <div>
          <label 
            htmlFor="subject" 
            className={`block text-sm font-medium mb-1 ${inputTextClass} transition-colors duration-500`}
          >
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 rounded-md ${inputBgClass} ${inputBorderClass} ${inputTextClass} border focus:ring-2 focus:ring-opacity-50 ${
              isDarkMode ? "focus:ring-red-500" : "focus:ring-blue-500"
            } transition-all duration-300`}
            placeholder="Email Subject"
          />
        </div>
        
        <div>
          <label 
            htmlFor="message" 
            className={`block text-sm font-medium mb-1 ${inputTextClass} transition-colors duration-500`}
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            className={`w-full px-3 py-2 rounded-md ${inputBgClass} ${inputBorderClass} ${inputTextClass} border focus:ring-2 focus:ring-opacity-50 ${
              isDarkMode ? "focus:ring-red-500" : "focus:ring-blue-500"
            } transition-all duration-300`}
            placeholder="Your message here..."
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${buttonClass} px-4 py-2 rounded-md flex items-center justify-center space-x-2 transition-all duration-300 disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]`}
        >
          {isSubmitting ? (
            <span>Sending...</span>
          ) : (
            <>
              <span>Send Email</span>
              <PaperAirplaneIcon className="w-4 h-4" />
            </>
          )}
        </button>
        
        {formStatus.message && (
          <div 
            className={`mt-2 text-sm px-3 py-2 rounded ${
              formStatus.success 
                ? isDarkMode ? "bg-green-900/70 text-green-300" : "bg-green-100 text-green-800" 
                : isDarkMode ? "bg-red-900/70 text-red-300" : "bg-red-100 text-red-800"
            } transition-all duration-300`}
          >
            {formStatus.message}
          </div>
        )}
      </form>
    </div>
  );
};

export default EmailContact; 