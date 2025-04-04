"use client";

import React, { useState, useRef, useEffect } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import emailjs from '@emailjs/browser';

const EmailContact = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    from_name: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  // Initialize EmailJS
  useEffect(() => {
    // Initialize EmailJS with your public key
    if (process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY) {
      emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY);
    }
  }, []);

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

  // Simple mailto fallback if EmailJS fails
  const sendFallbackEmail = () => {
    const mailtoUrl = `mailto:debarghyasren@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `From: ${formData.from_name}\n\n${formData.message}`
    )}`;
    window.open(mailtoUrl, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formRef.current) return;
    
    setIsSubmitting(true);
    setFormStatus({});

    try {
      // EmailJS service configuration from environment variables
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      
      // Check if all required configuration is available
      if (!serviceId || !templateId) {
        console.error("Missing EmailJS configuration");
        throw new Error('EmailJS configuration is missing');
      }

      // Prepare template parameters
      const templateParams = {
        from_name: formData.from_name,
        reply_to: formData.from_name,
        subject: formData.subject,
        message: formData.message,
        to_name: "Debarghya"
      };

      // Log parameters for debugging (remove in production)
      console.log("Sending with params:", {
        serviceId,
        templateId,
        templateParams,
        publicKeyPresent: !!process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      });

      // Try directly with sendForm which has better success rate
      const response = await emailjs.sendForm(
        serviceId,
        templateId,
        formRef.current
      );

      console.log("EmailJS response:", response);

      if (response.status === 200) {
        // On success
        setFormStatus({
          success: true,
          message: "Email sent successfully! I'll get back to you soon."
        });
        
        // Reset form data
        setFormData({
          from_name: "",
          subject: "",
          message: ""
        });
      } else {
        throw new Error(`Failed to send email: ${response.text}`);
      }
    } catch (error) {
      console.error('Email error:', error);
      setFormStatus({
        success: false,
        message: "Something went wrong with direct sending. Try the alternative method below."
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
      
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div>
          <label 
            htmlFor="from_name" 
            className={`block text-sm font-medium mb-1 ${inputTextClass} transition-colors duration-500`}
          >
            Your Email
          </label>
          <input
            type="email"
            id="from_name"
            name="from_name"
            value={formData.from_name}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 rounded-md ${inputBgClass} ${inputBorderClass} ${inputTextClass} border focus:ring-2 focus:ring-opacity-50 ${
              isDarkMode ? "focus:ring-red-500" : "focus:ring-blue-500"
            } transition-all duration-300`}
            placeholder="your.email@example.com"
          />
          {/* Add a hidden field for reply_to that matches from_name */}
          <input type="hidden" name="reply_to" value={formData.from_name} />
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
        
        {/* Add a direct mailto button as fallback */}
        {formStatus.success === false && (
          <button
            type="button"
            onClick={sendFallbackEmail}
            className={`mt-2 border border-current px-4 py-2 rounded-md flex items-center justify-center space-x-2 transition-all duration-300 ${
              isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <span>Send via Email Client</span>
          </button>
        )}
        
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
        
        <input type="hidden" name="to_name" value="Debarghya" />
      </form>
    </div>
  );
};

export default EmailContact; 