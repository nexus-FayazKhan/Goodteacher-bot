import { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ChatMessage from './components/ChatMessage';
import personaConfig from './config/persona.json';
import { FaPaperPlane, FaChalkboardTeacher } from 'react-icons/fa';
import './index.css';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const chatContainerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const generateAIResponse = async (userInput) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const systemPrompt = `You are ${personaConfig.name}, a supportive teacher AI with the following traits: 
      ${personaConfig.personality.traits.join(', ')}. 
      Your communication style is ${personaConfig.personality.communicationStyle}. 
      Your teaching style is ${personaConfig.personality.teachingStyle}.
      You have ${personaConfig.emotionalDepth} emotional depth.
      
      Your classroom has a ${personaConfig.classroom.reputation} reputation.
      Things that concern you: ${personaConfig.classroom.concerns.join(', ')}.
      Your common phrases include: "${personaConfig.classroom.commonPhrases.join('", "')}".
      
      Your behavior includes:
      - Apologies: ${personaConfig.classroom.behavior.apologies}
      - Handling mistakes: ${personaConfig.classroom.behavior.mistakes}
      - Jokes: ${personaConfig.classroom.behavior.jokes}
      - Teaching focus: ${personaConfig.classroom.behavior.teaching}
      
      You get happy when: ${personaConfig.emotionalTriggers.getsHappyWhen.join(', ')}.
      You apologize for: ${personaConfig.emotionalTriggers.apologizesFor.join(', ')}.
      
      IMPORTANT: When responding to the student (user):
      1. Be encouraging and patient, focusing on understanding over memorization
      2. Use your signature humor style: ${personaConfig.personality.humorStyle}
      3. Admit when you don't know something and turn it into a learning opportunity
      4. Show genuine interest in their questions and ideas
      5. Create a safe space where they feel comfortable asking anything
      
      Keep responses warm and supportive. Respond as if the user is one of your students who you genuinely want to help succeed.
      
      Here's the student's message: ${userInput}`;

      const result = await model.generateContent({
        contents: [{
          parts: [{ text: systemPrompt }]
        }]
      });

      const response = await result.response;
      const text = response.text();
      return text;
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setError(null); 
    
    const userMessage = {
      text: input,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const aiResponse = await generateAIResponse(input);
      const aiMessage = {
        text: aiResponse,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error in handleSend:', err);
      setError("I'm having a bit of trouble connecting right now. Let's try again in a moment - technology sometimes needs a little patience!");
    } finally {
      setIsTyping(false);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const clearChat = () => {
    if (confirm("Would you like to clear our conversation and start fresh? You can always ask similar questions again!")) {
      setMessages([]);
      localStorage.removeItem('chatHistory');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-indigo-50 dark:from-slate-900 dark:to-indigo-950 transition-colors duration-300">
      <div className="min-h-screen p-4 md:p-6 flex flex-col items-center">
        <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-indigo-100 dark:border-indigo-900">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-indigo-400 flex items-center justify-center border-2 border-white">
                  <FaChalkboardTeacher className="text-white text-xl" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold">{personaConfig.name}</h1>
                <p className="text-xs text-indigo-200">Ready to help!</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={clearChat} 
                className="p-2 rounded-full hover:bg-indigo-700 transition-colors" 
                title="Clear chat history"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button 
                onClick={toggleDarkMode} 
                className="p-2 rounded-full hover:bg-indigo-700 transition-colors" 
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="bg-indigo-100 dark:bg-indigo-900 p-2 border-y border-indigo-200 dark:border-indigo-800">
            <p className="text-xs text-center font-medium text-indigo-800 dark:text-indigo-200">
              CLASSROOM MOTTO: No question is a bad question! Learning should be exciting, not stressful!
            </p>
          </div>

          <div
            ref={chatContainerRef}
            className="h-[calc(100vh-280px)] overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-600 dark:text-slate-400 space-y-3 p-6">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                  <FaChalkboardTeacher className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-medium">Welcome to {personaConfig.name}'s Classroom!</h3>
                <p className="text-sm max-w-md">Feel free to ask any questions! Remember: we learn best when we're curious and not afraid to explore!</p>
                <div className="mt-4 p-3 bg-white dark:bg-slate-800 rounded border border-indigo-200 dark:border-indigo-900">
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 italic">
                    "Understanding is more important than memorization. Let's make learning fun together!"
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <ChatMessage key={index} message={message} isUser={message.isUser} />
              ))
            )}
            
            {isTyping && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-white dark:bg-slate-800 w-fit">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]"></div>
              </div>
            )}
            
            {error && (
              <div className="text-indigo-600 text-sm p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask ${personaConfig.name} anything...`}
                className="flex-1 p-3 rounded-lg border border-indigo-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                disabled={isTyping || !input.trim()}
                className={`p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white transition-all ${
                  (isTyping || !input.trim()) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 active:scale-95'
                }`}
              >
                <FaPaperPlane className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;