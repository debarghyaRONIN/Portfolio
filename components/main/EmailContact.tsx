"use client";

import React, { useState, useRef, useEffect } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import emailjs from '@emailjs/browser';

const EmailContact = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    from_email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  // Get EmailJS config values
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  // Check if EmailJS is configured
  const isEmailJSConfigured = !!(serviceId && templateId && publicKey);

  // Initialize EmailJS
  useEffect(() => {
    // Log configuration status for debugging (will only show in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('EmailJS Configuration:', {
        serviceId: serviceId ? 'Set' : 'Not Set',
        templateId: templateId ? 'Set' : 'Not Set',
        publicKey: publicKey ? 'Set' : 'Not Set',
        isConfigured: isEmailJSConfigured
      });
    }

    // Initialize EmailJS with your public key
    if (publicKey) {
      emailjs.init(publicKey);
    } else {
      console.error("EmailJS public key is missing");
    }
  }, [publicKey, serviceId, templateId, isEmailJSConfigured]);

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
      `From: ${formData.from_email}\n\n${formData.message}`
    )}`;
    window.open(mailtoUrl, '_blank');
  };

  const validateEmail = (email: string): boolean => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formRef.current) return;
    
    // Validate form fields
    if (!validateEmail(formData.from_email)) {
      setFormStatus({
        success: false,
        message: "Please enter a valid email address."
      });
      return;
    }

    if (!formData.subject.trim()) {
      setFormStatus({
        success: false,
        message: "Please enter a subject."
      });
      return;
    }

    if (!formData.message.trim()) {
      setFormStatus({
        success: false,
        message: "Please enter a message."
      });
      return;
    }
    
    setIsSubmitting(true);
    setFormStatus({});

    try {
      // Check if EmailJS is configured
      if (!isEmailJSConfigured) {
        console.error("EmailJS configuration is missing");
        throw new Error('EmailJS configuration is missing. Please check your environment variables.');
      }

      // Add hidden input fields to ensure EmailJS template receives all needed data
      const hiddenFields = [
        { name: 'from_name', value: formData.from_email },
        { name: 'reply_to', value: formData.from_email }
      ];
      
      // Temporarily append hidden fields for EmailJS template
      for (const field of hiddenFields) {
        if (!formRef.current.querySelector(`input[name="${field.name}"]`)) {
          const hiddenInput = document.createElement('input');
          hiddenInput.type = 'hidden';
          hiddenInput.name = field.name;
          hiddenInput.value = field.value;
          formRef.current.appendChild(hiddenInput);
        }
      }

      // Send directly using form reference (more reliable)
      const response = await emailjs.sendForm(
        serviceId!,
        templateId!,
        formRef.current,
        publicKey
      );
      
      // Remove temporary hidden fields
      for (const field of hiddenFields) {
        const hiddenInput = formRef.current.querySelector(`input[name="${field.name}"][type="hidden"]`);
        if (hiddenInput) {
          formRef.current.removeChild(hiddenInput);
        }
      }
      
      if (response.status === 200) {
        setFormStatus({
          success: true,
          message: "Email sent successfully! I'll get back to you soon."
        });
        
        // Reset form
        setFormData({
          from_email: "",
          subject: "",
          message: ""
        });
      } else {
        throw new Error(`Failed with status: ${response.status}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'object' && error !== null && 'text' in error
          ? (error as {text: string}).text
          : 'Unknown error';
          
      console.error('Email sending error:', errorMessage);
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
            htmlFor="from_email" 
            className={`block text-sm font-medium mb-1 ${inputTextClass} transition-colors duration-500`}
          >
            Your Email
          </label>
          <input
            type="email"
            id="from_email"
            name="from_email"
            value={formData.from_email}
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
        
        {/* Alternative email method */}
        {(formStatus.success === false || !isEmailJSConfigured) && (
          <button
            type="button"
            onClick={sendFallbackEmail}
            className={`mt-2 border border-current px-4 py-2 rounded-md flex items-center justify-center space-x-2 transition-all duration-300 ${
              isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <span>Send via Default Email Client</span>
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
      </form>
    </div>
  );
};

export default EmailContact; 