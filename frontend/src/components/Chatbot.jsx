// import React, { useState, useRef, useEffect } from 'react';
// import { translations } from '../lib/languages.js';
// import LanguageSelector from './LanguageSelector.jsx';

// const Chatbot = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [language, setLanguage] = useState('en');
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const messagesEndRef = useRef(null);
//   const inputRef = useRef(null);
//   const fileInputRef = useRef(null);

//   const t = translations[language] || translations.en;

//   // Initialize messages with welcome message in current language
//   useEffect(() => {
//     setMessages([
//       {
//         id: 1,
//         role: 'assistant',
//         content: t.welcome,
//         timestamp: new Date()
//       }
//     ]);
//   }, [language, t.welcome]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   useEffect(() => {
//     if (isOpen && inputRef.current) {
//       inputRef.current.focus();
//     }
//   }, [isOpen]);

//   const sendMessage = async () => {
//     if (!inputMessage.trim() || isLoading) return;

//     const userMessage = {
//       id: Date.now(),
//       role: 'user',
//       content: inputMessage.trim(),
//       timestamp: new Date()
//     };

//     setMessages(prev => [...prev, userMessage]);
//     setInputMessage('');
//     setIsLoading(true);

//     try {
//       console.log('🤖 FRONTEND: Sending chatbot request...');
//       console.log('💬 Message:', inputMessage.trim());
      
//       // Prepare conversation history (last 10 messages for context)
//       const conversationHistory = messages.slice(-10).map(msg => ({
//         role: msg.role,
//         content: msg.content
//       }));

//       console.log('📚 Conversation history length:', conversationHistory.length);

//       // Try the full URL first to see if it's a proxy issue
//       const apiUrl = window.location.hostname === 'localhost' 
//         ? 'http://localhost:5000/api/chatbot/chat'
//         : '/api/chatbot/chat';
      
//       console.log('🔗 Using API URL:', apiUrl);

//       const response = await fetch(apiUrl, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           message: inputMessage.trim(),
//           conversationHistory,
//           language: language // Send current language to backend
//         })
//       });

//       console.log('📥 Response status:', response.status);
//       console.log('📥 Response ok:', response.ok);

//       const data = await response.json();
//       console.log('📄 Response data:', data);

//       if (data.success) {
//         console.log('✅ Success! AI response received');
//         const assistantMessage = {
//           id: Date.now() + 1,
//           role: 'assistant',
//           content: data.response,
//           timestamp: new Date()
//         };
//         setMessages(prev => [...prev, assistantMessage]);
//       } else {
//         console.log('❌ API returned error:', data.error);
//         throw new Error(data.error || 'Failed to get response');
//       }
//     } catch (error) {
//       console.error('❌ FRONTEND CHATBOT ERROR:', error);
//       console.error('❌ Error details:', {
//         message: error.message,
//         stack: error.stack
//       });
      
//       const errorMessage = {
//         id: Date.now() + 1,
//         role: 'assistant',
//         content: `${t.errorMessage} Error: ${error.message}`,
//         timestamp: new Date(),
//         isError: true
//       };
//       setMessages(prev => [...prev, errorMessage]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   const handleImageSelect = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Check file type
//       if (!file.type.startsWith('image/')) {
//         alert('Please select an image file');
//         return;
//       }
      
//       // Check file size (max 5MB)
//       if (file.size > 5 * 1024 * 1024) {
//         alert('Image size should be less than 5MB');
//         return;
//       }

//       setSelectedImage(file);
      
//       // Create preview
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setImagePreview(e.target.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const removeImage = () => {
//     setSelectedImage(null);
//     setImagePreview(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   const sendImageMessage = async () => {
//     if (!selectedImage) return;

//     const formData = new FormData();
//     formData.append('image', selectedImage);
//     formData.append('message', inputMessage.trim() || 'Please analyze this image for pest identification');
//     formData.append('language', language);

//     // Add conversation history
//     const conversationHistory = messages.slice(-10).map(msg => ({
//       role: msg.role,
//       content: msg.content
//     }));
//     formData.append('conversationHistory', JSON.stringify(conversationHistory));

//     const userMessage = {
//       id: Date.now(),
//       role: 'user',
//       content: inputMessage.trim() || 'Image uploaded for pest analysis',
//       image: imagePreview,
//       timestamp: new Date()
//     };

//     setMessages(prev => [...prev, userMessage]);
//     setInputMessage('');
//     setIsLoading(true);
//     removeImage();

//     try {
//       const apiUrl = window.location.hostname === 'localhost' 
//         ? 'http://localhost:5000/api/chatbot/analyze-image'
//         : '/api/chatbot/analyze-image';

//       const response = await fetch(apiUrl, {
//         method: 'POST',
//         body: formData
//       });

//       const data = await response.json();

//       if (data.success) {
//         const assistantMessage = {
//           id: Date.now() + 1,
//           role: 'assistant',
//           content: data.response,
//           timestamp: new Date()
//         };
//         setMessages(prev => [...prev, assistantMessage]);
//       } else {
//         throw new Error(data.error || 'Failed to analyze image');
//       }
//     } catch (error) {
//       console.error('Image analysis error:', error);
//       const errorMessage = {
//         id: Date.now() + 1,
//         role: 'assistant',
//         content: `${t.errorMessage} Error: ${error.message}`,
//         timestamp: new Date(),
//         isError: true
//       };
//       setMessages(prev => [...prev, errorMessage]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const clearChat = () => {
//     setMessages([
//       {
//         id: 1,
//         role: 'assistant',
//         content: t.chatCleared,
//         timestamp: new Date()
//       }
//     ]);
//   };

//   const formatMessage = (content) => {
//     // Simple formatting for better readability
//     return content
//       .split('\n')
//       .map((line, index) => (
//         <div key={index} className={line.trim() === '' ? 'h-2' : ''}>
//           {line}
//         </div>
//       ));
//   };

//   if (!isOpen) {
//     return (
//       <div className="fixed bottom-6 right-6 z-50">
//         <button
//           onClick={() => setIsOpen(true)}
//           className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
//           title={`${t.title} - ${t.subtitle}`}
//         >
//           <span className="text-xl">💬</span>
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
//       {/* Header */}
//       <div className="bg-green-600 text-white p-4 rounded-t-lg flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <div className="bg-green-500 p-2 rounded-full">
//             <span className="text-lg">🤖</span>
//           </div>
//           <div>
//             <h3 className="font-semibold">{t.title}</h3>
//             <p className="text-xs text-green-100">{t.subtitle}</p>
//           </div>
//         </div>
//         <div className="flex items-center gap-2">
//           <LanguageSelector 
//             currentLanguage={language} 
//             onLanguageChange={setLanguage} 
//           />
//           <button
//             onClick={async () => {
//               console.log('🧪 Testing backend connection...');
//               try {
//                 // Test with full URL
//                 const baseUrl = window.location.hostname === 'localhost' 
//                   ? 'http://localhost:5000'
//                   : '';
                
//                 // Test 1: Check status endpoint
//                 console.log('📊 Testing status endpoint...');
//                 const statusUrl = `${baseUrl}/api/chatbot/status`;
//                 console.log('📊 Status URL:', statusUrl);
                
//                 const statusResponse = await fetch(statusUrl);
//                 console.log('📊 Status response:', statusResponse.status, statusResponse.statusText);
                
//                 if (statusResponse.ok) {
//                   const statusData = await statusResponse.json();
//                   console.log('📊 Status data:', statusData);
//                 } else {
//                   const statusText = await statusResponse.text();
//                   console.log('📊 Status error text:', statusText.substring(0, 200));
//                 }
                
//                 // Test 2: Check test endpoint
//                 console.log('🧪 Testing test endpoint...');
//                 const testUrl = `${baseUrl}/api/chatbot/test`;
//                 console.log('🧪 Test URL:', testUrl);
                
//                 const testResponse = await fetch(testUrl, {
//                   method: 'POST',
//                   headers: { 'Content-Type': 'application/json' },
//                   body: JSON.stringify({ message: 'test' })
//                 });
//                 console.log('🧪 Test response:', testResponse.status, testResponse.statusText);
                
//                 if (testResponse.ok) {
//                   const testData = await testResponse.json();
//                   console.log('✅ Test response data:', testData);
//                   alert('Backend test: SUCCESS');
//                 } else {
//                   const testText = await testResponse.text();
//                   console.log('❌ Test error text:', testText.substring(0, 200));
//                   alert('Backend test FAILED: ' + testResponse.status);
//                 }
//               } catch (error) {
//                 console.error('❌ Test failed:', error);
//                 alert('Backend test FAILED: ' + error.message);
//               }
//             }}
//             className="text-green-100 hover:text-white p-1 rounded text-xs"
//             title={t.testBackend}
//           >
//             🧪
//           </button>
//           <button
//             onClick={clearChat}
//             className="text-green-100 hover:text-white p-1 rounded text-sm"
//             title={t.clearChat}
//           >
//             🗑️
//           </button>
//           <button
//             onClick={() => setIsOpen(false)}
//             className="text-green-100 hover:text-white p-1 rounded text-sm"
//             title={t.closeChat}
//           >
//             ✕
//           </button>
//         </div>
//       </div>

//       {/* Messages */}
//       <div 
//         className="flex-1 overflow-y-auto p-4 space-y-4 relative"
//         style={{
//           backgroundImage: 'url(/uploads/backgrounds/farm.jpg)',
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//           backgroundAttachment: 'fixed'
//         }}
//       >
//         {/* Background overlay with low opacity */}
//         <div className="absolute inset-0 bg-white opacity-75"></div>
//         <div className="relative z-10">
//         {messages.map((message) => (
//           <div
//             key={message.id}
//             className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
//           >
//             {message.role === 'assistant' && (
//               <div className="bg-green-100 p-2 rounded-full flex-shrink-0 mt-1">
//                 <span className="text-sm">🤖</span>
//               </div>
//             )}
//             <div
//               className={`max-w-[80%] p-3 rounded-lg text-sm ${
//                 message.role === 'user'
//                   ? 'bg-green-600 text-white rounded-br-sm'
//                   : message.isError
//                   ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-sm'
//                   : 'bg-gray-100 text-gray-800 rounded-bl-sm'
//               }`}
//             >
//               {message.image && (
//                 <div className="mb-2">
//                   <img 
//                     src={message.image} 
//                     alt="Uploaded" 
//                     className="max-w-full h-32 object-cover rounded border"
//                   />
//                 </div>
//               )}
//               <div className="whitespace-pre-wrap">
//                 {formatMessage(message.content)}
//               </div>
//               <div className={`text-xs mt-2 opacity-70 ${
//                 message.role === 'user' ? 'text-green-100' : 'text-gray-500'
//               }`}>
//                 {message.timestamp.toLocaleTimeString([], { 
//                   hour: '2-digit', 
//                   minute: '2-digit' 
//                 })}
//               </div>
//             </div>
//             {message.role === 'user' && (
//               <div className="bg-green-600 p-2 rounded-full flex-shrink-0 mt-1">
//                 <span className="text-sm text-white">👤</span>
//               </div>
//             )}
//           </div>
//         ))}
        
//         {isLoading && (
//           <div className="flex gap-3 justify-start">
//             <div className="bg-green-100 p-2 rounded-full flex-shrink-0 mt-1">
//               <span className="text-sm">🤖</span>
//             </div>
//             <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-sm">
//               <div className="flex items-center gap-2">
//                 <div className="animate-spin text-green-600">⟳</div>
//                 <span className="text-sm">{t.analyzing}</span>
//               </div>
//             </div>
//           </div>
//         )}
        
//         <div ref={messagesEndRef} />
//         </div>
//       </div>

//       {/* Input */}
//       <div className="p-4 border-t border-gray-200">
//         {/* Image Preview */}
//         {imagePreview && (
//           <div className="mb-3 relative">
//             <img 
//               src={imagePreview} 
//               alt="Preview" 
//               className="max-w-full h-32 object-cover rounded border"
//             />
//             <button
//               onClick={removeImage}
//               className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
//             >
//               ✕
//             </button>
//           </div>
//         )}
        
//         <div className="flex gap-2">
//           <div className="flex flex-col gap-2">
//             {/* Camera/Upload Button */}
//             <button
//               onClick={() => fileInputRef.current?.click()}
//               className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
//               title="Upload Image"
//             >
//               <span className="text-lg">📷</span>
//             </button>
            
//             {/* Send Image Button (only show when image is selected) */}
//             {selectedImage && (
//               <button
//                 onClick={sendImageMessage}
//                 disabled={isLoading}
//                 className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
//                 title="Analyze Image"
//               >
//                 <span className="text-lg">🔍</span>
//               </button>
//             )}
//           </div>
          
//           <textarea
//             ref={inputRef}
//             value={inputMessage}
//             onChange={(e) => setInputMessage(e.target.value)}
//             onKeyPress={handleKeyPress}
//             placeholder={selectedImage ? "Add a message about the image (optional)" : t.placeholder}
//             className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
//             rows="2"
//             disabled={isLoading}
//           />
//           <button
//             onClick={sendMessage}
//             disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
//             className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white p-3 rounded-lg transition-colors duration-200"
//             title={t.send}
//           >
//             <span className="text-lg">📤</span>
//           </button>
//         </div>
        
//         {/* Hidden File Input */}
//         <input
//           ref={fileInputRef}
//           type="file"
//           accept="image/*"
//           onChange={handleImageSelect}
//           className="hidden"
//         />
        
//         <div className="text-xs text-gray-500 mt-2 text-center">
//           {t.poweredBy}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Chatbot;
import { useState, useRef, useEffect } from 'react';
import { translations } from '../lib/languages.js';
import LanguageSelector from './LanguageSelector.jsx';
import { API_BASE_URL } from '../lib/api';

// Animated SVG Icons
const MicrophoneIcon = ({ isRecording }) => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    className={isRecording ? 'animate-pulse' : ''}
  >
    <style>
      {`
        .mic-wave {
          animation: micWave 1.5s ease-in-out infinite;
        }
        @keyframes micWave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.5); }
        }
      `}
    </style>
    <rect x="9" y="2" width="6" height="11" rx="3" fill="currentColor"/>
    <path d="M12 18v3m-7-3a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="2" fill="none"/>
    {isRecording && (
      <>
        <circle cx="5" cy="12" r="1" fill="currentColor" className="mic-wave" style={{animationDelay: '0s'}}/>
        <circle cx="19" cy="12" r="1" fill="currentColor" className="mic-wave" style={{animationDelay: '0.3s'}}/>
        <circle cx="3" cy="10" r="0.5" fill="currentColor" className="mic-wave" style={{animationDelay: '0.6s'}}/>
        <circle cx="21" cy="14" r="0.5" fill="currentColor" className="mic-wave" style={{animationDelay: '0.9s'}}/>
      </>
    )}
  </svg>
);

const StopIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
  </svg>
);

const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <style>
      {`
        .camera-flash {
          animation: cameraFlash 2s ease-in-out infinite;
        }
        @keyframes cameraFlash {
          0%, 90%, 100% { opacity: 0; }
          95% { opacity: 1; }
        }
      `}
    </style>
    <path 
      d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" 
      stroke="currentColor" 
      strokeWidth="2" 
      fill="none"
    />
    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="13" r="2" fill="currentColor"/>
    <circle cx="18" cy="8" r="1" fill="currentColor" className="camera-flash"/>
  </svg>
);

const SendIcon = ({ isLoading }) => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none"
    className={isLoading ? 'animate-spin' : ''}
  >
    <style>
      {`
        .send-trail {
          animation: sendTrail 1.5s ease-out infinite;
        }
        @keyframes sendTrail {
          0% { opacity: 0; transform: translateX(-10px); }
          50% { opacity: 1; transform: translateX(0px); }
          100% { opacity: 0; transform: translateX(10px); }
        }
      `}
    </style>
    {isLoading ? (
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="31.416" strokeDashoffset="31.416">
        <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
        <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
      </circle>
    ) : (
      <>
        <path 
          d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" 
          stroke="currentColor" 
          strokeWidth="2" 
          fill="none"
        />
        <circle cx="8" cy="8" r="1" fill="currentColor" className="send-trail" style={{animationDelay: '0s'}}/>
        <circle cx="6" cy="6" r="0.5" fill="currentColor" className="send-trail" style={{animationDelay: '0.3s'}}/>
        <circle cx="4" cy="4" r="0.5" fill="currentColor" className="send-trail" style={{animationDelay: '0.6s'}}/>
      </>
    )}
  </svg>
);

const ChatbotIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <style>
      {`
        .bot-eye {
          animation: botBlink 3s ease-in-out infinite;
        }
        .bot-antenna {
          animation: botAntenna 2s ease-in-out infinite;
        }
        @keyframes botBlink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes botAntenna {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
      `}
    </style>
    {/* Robot head */}
    <rect x="6" y="8" width="12" height="10" rx="2" fill="currentColor"/>
    {/* Robot eyes */}
    <circle cx="9" cy="12" r="1.5" fill="white" className="bot-eye"/>
    <circle cx="15" cy="12" r="1.5" fill="white" className="bot-eye"/>
    <circle cx="9" cy="12" r="0.8" fill="currentColor"/>
    <circle cx="15" cy="12" r="0.8" fill="currentColor"/>
    {/* Robot mouth */}
    <rect x="10" y="15" width="4" height="1" rx="0.5" fill="white"/>
    {/* Robot antenna */}
    <line x1="12" y1="8" x2="12" y2="5" stroke="currentColor" strokeWidth="2" className="bot-antenna"/>
    <circle cx="12" cy="4" r="1" fill="currentColor"/>
    {/* Robot body indicator */}
    <rect x="10" y="18" width="4" height="2" rx="1" fill="currentColor" opacity="0.7"/>
  </svg>
);

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const t = translations[language] || translations.en;

  // Function to ensure voices are loaded
  const ensureVoicesLoaded = () => {
    return new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
      } else {
        // Wait for voices to load
        const handleVoicesChanged = () => {
          const loadedVoices = window.speechSynthesis.getVoices();
          if (loadedVoices.length > 0) {
            window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
            resolve(loadedVoices);
          }
        };
        window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
        
        // Fallback timeout
        setTimeout(() => {
          window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
          resolve(window.speechSynthesis.getVoices());
        }, 3000);
      }
    });
  };

  // Initialize messages with welcome message in current language
  useEffect(() => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: t.welcome,
        timestamp: new Date()
      }
    ]);
  }, [language, t.welcome]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    // If there's an image, use the image sending function
    if (selectedImage) {
      return sendMessageWithImage();
    }
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('🤖 FRONTEND: Sending chatbot request...');
      console.log('💬 Message:', inputMessage.trim());
      
      // Prepare conversation history (last 10 messages for context)
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      console.log('📚 Conversation history length:', conversationHistory.length);

      const apiUrl = `${API_BASE_URL}/api/chatbot/chat`;
      
      console.log('🔗 Using API URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
          conversationHistory,
          language: language // Send current language to backend
        })
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      const data = await response.json();
      console.log('📄 Response data:', data);

      if (data.success) {
        console.log('✅ Success! AI response received');
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        console.log('❌ API returned error:', data.error);
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('❌ FRONTEND CHATBOT ERROR:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack
      });
      
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `${t.errorMessage} Error: ${error.message}`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Voice Recording Functions using Web Speech API
  const startRecording = async () => {
    try {
      // Check if speech recognition is supported
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.error('🎤 Speech recognition not supported in this browser');
        alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      // Configure recognition
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      // Set language based on current language selection
      const languageMap = {
        'en': 'en-US',
        'es': 'es-ES', 
        'fr': 'fr-FR',
        'hi': 'hi-IN',
        'de': 'de-DE',
        'pt': 'pt-BR',
        'zh': 'zh-CN',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'ar': 'ar-SA'
      };
      
      recognition.lang = languageMap[language] || 'en-US';
      
      console.log('🎤 Starting speech recognition with language:', recognition.lang);
      console.log('🎤 Browser support:', {
        SpeechRecognition: !!window.SpeechRecognition,
        webkitSpeechRecognition: !!window.webkitSpeechRecognition
      });
      
      recognition.onstart = () => {
        console.log('🎤 Speech recognition started successfully');
        setIsRecording(true);
        setIsLoading(false);
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        console.log('🎤 Speech recognized:', transcript, 'Confidence:', confidence);
        setInputMessage(transcript);
        setIsRecording(false);
      };
      
      recognition.onerror = (event) => {
        console.error('🎤 Speech recognition error:', event.error, event);
        setIsRecording(false);
        
        let errorMessage = 'Voice recognition failed. ';
        switch (event.error) {
          case 'no-speech':
            errorMessage += 'No speech detected. Please try speaking louder and clearer.';
            break;
          case 'audio-capture':
            errorMessage += 'Microphone not accessible. Please check permissions and try again.';
            break;
          case 'not-allowed':
            errorMessage += 'Microphone permission denied. Please allow microphone access in your browser settings.';
            break;
          case 'network':
            errorMessage += 'Network error. Please check your internet connection.';
            break;
          case 'language-not-supported':
            errorMessage += `Language ${recognition.lang} not supported. Switching to English.`;
            break;
          case 'service-not-allowed':
            errorMessage += 'Speech recognition service not allowed. Please check browser settings.';
            break;
          default:
            errorMessage += `Error: ${event.error}. Please try again.`;
        }
        
        alert(errorMessage);
      };
      
      recognition.onend = () => {
        console.log('🎤 Speech recognition ended');
        setIsRecording(false);
      };
      
      // Start recognition
      console.log('🎤 Attempting to start recognition...');
      recognition.start();
      
    } catch (error) {
      console.error('🎤 Error starting recording:', error);
      setIsRecording(false);
      alert('Could not start voice recognition. Error: ' + error.message);
    }
  };

  const stopRecording = () => {
    // For Web Speech API, we don't need to manually stop
    // The recognition will stop automatically after silence
    console.log('🎤 Stopping speech recognition...');
    setIsRecording(false);
  };



  // Text-to-Speech Function
  const speakMessage = async (text) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      // Clean the text - remove HTML tags, extra whitespace, and special characters
      const cleanText = text
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
        .replace(/\*(.*?)\*/g, '$1') // Remove markdown italic
        .replace(/#{1,6}\s/g, '') // Remove markdown headers
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim(); // Remove leading/trailing whitespace
      
      console.log('🔊 Speaking text:', cleanText); // Debug log
      console.log('🌐 Current language:', language); // Debug current language
      
      if (!cleanText) {
        console.warn('⚠️ No text to speak after cleaning');
        return;
      }

      try {
        // Ensure voices are loaded before proceeding
        const voices = await ensureVoicesLoaded();
        console.log('🎤 Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));

        // Enhanced language detection for mixed content
        const hasHindi = /[\u0900-\u097F]/.test(cleanText); // Devanagari script detection
        const hasEnglish = /[a-zA-Z]/.test(cleanText);
        
        console.log('🔍 Text analysis:', { hasHindi, hasEnglish, textLength: cleanText.length });
        
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        // Enhanced language mapping with fallbacks
        const languageMap = {
          'en': ['en-US', 'en-GB', 'en'],
          'es': ['es-ES', 'es-MX', 'es-US', 'es'], 
          'fr': ['fr-FR', 'fr-CA', 'fr'],
          'hi': ['hi-IN', 'hi', 'en-IN'], // Added fallback to Indian English
          'de': ['de-DE', 'de'],
          'pt': ['pt-BR', 'pt-PT', 'pt'],
          'zh': ['zh-CN', 'zh-TW', 'zh'],
          'ja': ['ja-JP', 'ja'],
          'ko': ['ko-KR', 'ko'],
          'ar': ['ar-SA', 'ar']
        };
        
        // Determine the best language to use
        let targetLang = language;
        
        // If content has Hindi characters, prioritize Hindi
        if (hasHindi && language === 'hi') {
          targetLang = 'hi';
        } else if (hasHindi && language !== 'hi') {
          // If Hindi content but different language selected, still try Hindi
          targetLang = 'hi';
          console.log('🔄 Detected Hindi content, switching to Hindi voice');
        }
        
        // Find the best available voice
        const preferredLangs = languageMap[targetLang] || ['en-US'];
        let selectedVoice = null;
        let selectedLang = preferredLangs[0];
        
        for (const lang of preferredLangs) {
          const voice = voices.find(v => v.lang.startsWith(lang) || v.lang === lang);
          if (voice) {
            selectedVoice = voice;
            selectedLang = lang;
            console.log('✅ Found voice:', voice.name, 'for language:', lang);
            break;
          }
        }
        
        // Set the language and voice
        utterance.lang = selectedLang;
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log('🎯 Using voice:', selectedVoice.name, 'with language:', selectedLang);
        } else {
          console.log('⚠️ No specific voice found, using default for:', selectedLang);
        }
        
        // Adjust speech parameters based on language
        if (targetLang === 'hi') {
          utterance.rate = 0.8; // Slower for Hindi
          utterance.pitch = 1.1; // Slightly higher pitch for Hindi
          utterance.volume = 0.9; // Higher volume for clarity
        } else {
          utterance.rate = 0.9; // Normal rate for other languages
          utterance.pitch = 1.0; // Normal pitch
          utterance.volume = 0.8; // Normal volume
        }
        
        // Event handlers
        utterance.onstart = () => {
          console.log('🔊 Speech started with language:', utterance.lang);
          setIsSpeaking(true);
        };
        
        utterance.onend = () => {
          console.log('🔊 Speech ended');
          setIsSpeaking(false);
        };
        
        utterance.onerror = (event) => {
          console.error('🔊 Speech error:', event.error);
          setIsSpeaking(false);
          
          // Try fallback if Hindi fails
          if (targetLang === 'hi' && event.error === 'language-not-supported') {
            console.log('🔄 Hindi failed, trying English fallback...');
            const fallbackUtterance = new SpeechSynthesisUtterance(cleanText);
            fallbackUtterance.lang = 'en-US';
            fallbackUtterance.rate = 0.9;
            fallbackUtterance.pitch = 1.0;
            fallbackUtterance.volume = 0.8;
            
            fallbackUtterance.onstart = () => setIsSpeaking(true);
            fallbackUtterance.onend = () => setIsSpeaking(false);
            fallbackUtterance.onerror = () => {
              setIsSpeaking(false);
              alert('Speech synthesis failed. Please try again.');
            };
            
            window.speechSynthesis.speak(fallbackUtterance);
          } else {
            alert(`Speech error: ${event.error}. Please try again.`);
          }
        };
        
        // Start speaking
        console.log('🚀 Starting speech synthesis...');
        window.speechSynthesis.speak(utterance);
        
      } catch (error) {
        console.error('🔊 Voice loading error:', error);
        setIsSpeaking(false);
        alert('Failed to load speech voices. Please try again.');
      }
    } else {
      alert('Text-to-speech not supported in this browser.');
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Image Upload Functions
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessageWithImage = async () => {
    if (!inputMessage.trim() && !selectedImage) return;
    if (isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage.trim() || 'Sent an image',
      image: imagePreview,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage.trim();
    const currentImage = selectedImage;
    
    setInputMessage('');
    removeImage();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', currentMessage);
      formData.append('language', language);
      
      if (currentImage) {
        formData.append('image', currentImage);
      }

      // Add conversation history
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      formData.append('conversationHistory', JSON.stringify(conversationHistory));

      const apiUrl = `${API_BASE_URL}/api/chatbot/analyze-image`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message with image:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `${t.errorMessage} Error: ${error.message}`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: t.chatCleared,
        timestamp: new Date()
      }
    ]);
  };

  const formatMessage = (content) => {
    // Simple formatting for better readability
    return content
      .split('\n')
      .map((line, index) => (
        <div key={index} className={line.trim() === '' ? 'h-2' : ''}>
          {line}
        </div>
      ));
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white p-4 rounded-2xl shadow-xl shadow-emerald-700/25 ring-4 ring-white/90 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center group"
          title={`${t.title} - ${t.subtitle}`}
        >
          <ChatbotIcon />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[410px] h-[620px] max-h-[85vh] bg-white rounded-3xl shadow-2xl shadow-emerald-950/25 border border-slate-200/90 flex flex-col overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white px-4 py-3.5 flex items-center justify-between shadow-xs border-b border-emerald-600/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-xs">
            <span className="text-lg">🤖</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-white tracking-tight">{t.title}</h3>
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-400/25 text-emerald-100 px-1.5 py-0.2 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                Online
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/80 font-normal">{t.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <LanguageSelector 
            currentLanguage={language} 
            onLanguageChange={setLanguage} 
          />
          <button
            onClick={clearChat}
            className="text-emerald-100 hover:text-white hover:bg-white/15 p-1.5 rounded-xl text-xs transition cursor-pointer"
            title={t.clearChat}
          >
            🗑️
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-emerald-100 hover:text-white hover:bg-white/15 p-1.5 rounded-xl text-sm transition cursor-pointer"
            title={t.closeChat}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-slate-50 via-white to-slate-50/50 scroll-smooth">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-2xs mt-0.5">
                🤖
              </div>
            )}
            <div
              className={`max-w-[82%] p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-xs ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs font-normal'
                  : message.isError
                  ? 'bg-rose-50 text-rose-800 border border-rose-200 rounded-tl-xs font-normal'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs font-normal'
              }`}
            >
              {message.image && (
                <div className="mb-2">
                  <img 
                    src={message.image} 
                    alt="Uploaded" 
                    className="max-w-full h-auto rounded-xl border border-slate-200 shadow-2xs"
                    style={{ maxHeight: '180px' }}
                  />
                </div>
              )}
              <div className="whitespace-pre-wrap">
                {formatMessage(message.content)}
              </div>
              <div className={`flex items-center justify-between mt-2 pt-1 border-t text-[10px] ${
                message.role === 'user' ? 'border-white/20 text-emerald-100/80' : 'border-slate-100 text-slate-400'
              }`}>
                <div>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                {message.role === 'assistant' && !message.isError && (
                  <button
                    onClick={() => speakMessage(message.content)}
                    className="text-xs hover:text-emerald-700 ml-2 p-1 rounded transition opacity-80 hover:opacity-100 cursor-pointer"
                    title="Read aloud"
                  >
                    🔊
                  </button>
                )}
              </div>
            </div>
            {message.role === 'user' && (
              <div className="w-7 h-7 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 shadow-2xs">
                👤
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-2xs mt-0.5">
              🤖
            </div>
            <div className="bg-white border border-slate-200/80 text-slate-700 p-3.5 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-2">
              <div className="flex items-center gap-1 py-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-slate-500 font-medium ml-1">{t.analyzing}</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Dock */}
      <div className="p-3 bg-white border-t border-slate-200/80">
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-2 relative inline-block">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="h-16 w-auto rounded-xl border border-slate-200 object-cover shadow-2xs"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow cursor-pointer"
              title="Remove image"
            >
              ✕
            </button>
          </div>
        )}
        
        {/* Voice Controls */}
        <div className="flex items-center gap-2 mb-1.5">
          {isRecording && (
            <div className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs flex items-center gap-2 animate-pulse font-medium">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
              <span>🎤 Listening... Speak now</span>
            </div>
          )}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs flex items-center gap-1.5 font-medium transition cursor-pointer"
              title="Stop speaking"
            >
              <span className="animate-pulse">🔊</span>
              <span>Stop Speaking</span>
            </button>
          )}
        </div>

        {/* Unified Input Box */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-1.5 focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-2xs">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedImage ? "Describe this crop/pest issue..." : t.placeholder}
            className="w-full bg-transparent border-0 resize-none focus:outline-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 px-2.5 pt-1 min-h-[42px] max-h-24"
            rows="2"
            disabled={isLoading}
          />
          
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 px-1">
            <div className="flex items-center gap-1">
              {/* Photo Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-1.5 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer disabled:opacity-40"
                title="Upload image"
              >
                <CameraIcon />
              </button>

              {/* Voice Recording Button */}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
                className={`p-1.5 rounded-xl transition cursor-pointer disabled:opacity-40 ${
                  isRecording 
                    ? 'text-rose-600 bg-rose-50 ring-2 ring-rose-500/30 animate-pulse' 
                    : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'
                }`}
                title={isRecording ? 'Stop recording' : 'Voice input'}
              >
                {isRecording ? <StopIcon /> : <MicrophoneIcon isRecording={isRecording} />}
              </button>
            </div>

            {/* Send Button */}
            <button
              type="button"
              onClick={sendMessage}
              disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
              title={t.send}
            >
              <span>{t.send}</span>
              <SendIcon isLoading={isLoading} />
            </button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        <div className="text-[10px] text-slate-400 mt-2 text-center flex items-center justify-center gap-2">
          <span>🌿 AgroGuard AI Assistant</span>
          <span>•</span>
          <span>Press Enter to send</span>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;