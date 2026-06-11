import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Bot } from 'lucide-react';
import axiosWrapper from "../utils/AxiosWrapper";

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your AI assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsTyping(true);

    try {
      const history = messages
        .filter(m => m.id !== 1) // skip the initial hardcoded greeting if you want to save tokens
        .map(m => ({ text: m.text, sender: m.sender }));

      const response = await axiosWrapper.post('/ai/chat', {
        prompt: newMessage.text,
        history: history
      });

      if (response.data.success) {
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: response.data.reply,
          sender: 'bot',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: "Sorry, I ran into an error trying to process that request.",
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-primary-500 to-cyan-500 text-white p-4 rounded-full shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300 z-50 group"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            1
          </span>
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
            <div className="bg-dark-700 text-slate-200 text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
              AI Assistant
              <div className="absolute top-full right-4 -mt-1">
                <div className="border-4 border-transparent border-t-dark-700"></div>
              </div>
            </div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed ${
            isMinimized ? 'bottom-6 right-6 w-80' : 'bottom-6 right-6 w-96'
          } bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-300`}
          style={{ height: isMinimized ? '60px' : '600px' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-cyan-500 p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">AI Assistant</h3>
                <p className="text-white/80 text-xs">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[75%] ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-primary-500 to-cyan-500 text-white'
                          : 'bg-dark-700 text-slate-200'
                      } rounded-2xl px-4 py-3 shadow-md`}
                    >
                      {message.sender === 'bot' && (
                        <div className="flex items-center gap-2 mb-1">
                          <Bot className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs text-cyan-400 font-medium">AI Assistant</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-white/70' : 'text-slate-400'
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-dark-700 rounded-2xl px-4 py-3 shadow-md">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-cyan-400" />
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-dark-700">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-dark-700 border border-dark-600 text-slate-200 placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="bg-gradient-to-r from-primary-500 to-cyan-500 text-white p-3 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
                <p className="text-xs text-slate-400 mt-2 text-center">
                  AI responses are simulated for demo purposes
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AIAssistant;
