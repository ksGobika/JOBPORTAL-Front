/*"use client";
import { useState, useEffect, useRef } from 'react';

export default function ChatBox({ currentUser, targetUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();

  // Fetch messages between these two specific users
  const fetchMessages = async () => {
    try {
      const res = await fetch(`http://localhost:5001/messages`);
      const data = await res.json();
      const filtered = data.filter(m => 
        (m.senderId === currentUser.id && m.receiverId === targetUser.id) ||
        (m.senderId === targetUser.id && m.receiverId === currentUser.id)
      );
      setMessages(filtered);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Polling every 3 seconds
    return () => clearInterval(interval);
  }, [targetUser.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgData = {
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId: targetUser.id,
      content: newMessage,
      timestamp: new Date().toISOString()
    };

    await fetch('http://localhost:5001/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msgData)
    });

    setNewMessage("");
    fetchMessages();
  };

  return (
    <div className="flex flex-col h-[600px] bg-white border rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-blue-600 p-4 text-white font-bold">Chatting with {targetUser.name}</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-xl ${msg.senderId === currentUser.id ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border text-black rounded-bl-none'}`}>
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 border rounded-lg text-black" placeholder="Type message..." />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Send</button>
      </form>
    </div>
  );
}*/


"use client";
import { useState, useEffect, useRef } from 'react';
import { messageService } from '../services/api';

export default function ChatBox({ currentUser, targetUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();

  // Fetch messages between these two specific users
  const fetchMessages = async () => {
    // GUARD: If either user is missing (happens during build), exit immediately
    if (!currentUser?.id || !targetUser?.id) return;

    try {
      const res = await messageService.getConversation(currentUser.id, targetUser.id);
      const data = Array.isArray(res.data) ? res.data : [];
      setMessages(data);
    } catch (err) { 
      console.error("Fetch Error:", err); 
    }
  };

  useEffect(() => {
    // Only set interval if we have users
    if (currentUser?.id && targetUser?.id) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [targetUser?.id, currentUser?.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser?.id) return;

    const msgData = {
      senderId: currentUser.id,
      senderName: currentUser.name || "User",
      receiverId: targetUser.id,
      content: newMessage,
      timestamp: new Date().toISOString()
    };

    try {
      await messageService.sendMessage(msgData);
      setNewMessage("");
      fetchMessages();
    } catch (err) {
      console.error("Send Error:", err);
    }
  };

  // FINAL BUILD GUARD: If props are missing, render nothing (prevents build crash)
  if (!currentUser || !targetUser) return null;

  return (
    <div className="flex flex-col h-[600px] bg-white border rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-blue-600 p-4 text-white font-bold">
        Chatting with {targetUser?.name || 'User'}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-xl ${
              msg.senderId === currentUser?.id 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-white border text-black rounded-tl-none shadow-sm'
            }`}>
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t bg-white flex gap-2">
        <input 
          type="text" 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-3 border rounded-xl text-black bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" 
          placeholder="Type message..." 
        />
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}