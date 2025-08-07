"use client";

import { useState, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { Settings, Send } from 'lucide-react';

type Message = {
  text: string;
  sender: 'user' | 'bot';
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [userId, setUserId] = useState('123');
  const [bearerToken, setBearerToken] = useState('your-auth-token');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = { text: inputValue, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    const currentInputValue = inputValue;
    const currentHistory = messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`
        },
        body: JSON.stringify({
          users_id: userId,
          query: currentInputValue,
          history: currentHistory,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.detail || 'Network error');
        } catch (e) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      const botMessage: Message = { text: data.summary_string, sender: 'bot' };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        text: `Sorry, something went wrong. (${error})`,
        sender: 'bot',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-100 to-blue-100 font-sans">
      <header className="bg-white/70 backdrop-blur border-b border-gray-200 p-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800">Asisten SIAP</h1>
        <button 
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          <Settings size={16} />
          Settings
        </button>
      </header>

      {isSettingsOpen && (
        <div className="bg-white shadow-inner p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700">User ID</label>
              <input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md shadow-sm focus:ring focus:ring-blue-400"
              />
            </div>
            <div>
              <label htmlFor="bearerToken" className="block text-sm font-medium text-gray-700">Bearer Token</label>
              <input
                id="bearerToken"
                value={bearerToken}
                onChange={(e) => setBearerToken(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md shadow-sm focus:ring focus:ring-blue-400"
              />
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg px-4 py-3 rounded-xl shadow-md transition-all duration-300 ${
              msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'
            }`}>
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-1 bg-white px-4 py-3 rounded-xl shadow-md">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
      </main>

      <footer className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Send size={16} />
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
