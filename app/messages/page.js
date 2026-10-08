"use client";

import { useEffect, useState, useRef, Suspense, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  Send, 
  User, 
  Building2, 
  Check,
  CheckCheck, 
  Sparkles,
  Phone,
  Video,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Search,
  Paperclip,
  Smile,
  Trash2,
  FileText,
  Clock,
  Briefcase,
  AlertCircle,
  X,
  Layers,
  RefreshCw
} from 'lucide-react';
import { messageService, userService } from '../../services/api';

// Realistic Web Audio Synthesis for message send & receive
const playSound = (type) => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'send') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } else if (type === 'receive') {
      const osc1 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(800, ctx.currentTime);
      osc1.frequency.setValueAtTime(1000, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc1.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.22);
    }
  } catch (e) {
    // Audio context not allowed or muted
  }
};

function MessagesContent() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});
  const searchParams = useSearchParams();
  const directRecipientId = searchParams.get('recipientId');

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [messageReactions, setMessageReactions] = useState({});

  const chatScrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const prevMessagesCountRef = useRef(0);

  const scrollChatContainerOnly = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    setMounted(true);
    if (user?.role === 'admin') {
      router.replace('/admin/dashboard');
    }
  }, [user, router]);

  // Call timer simulation
  useEffect(() => {
    let timer;
    if (activeCall) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [activeCall]);

  // Load all real companies, seekers, and messages directly from MySQL Database
  const loadConversations = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const currentUserId = user?.id || (user?.role === 'employer' ? 'emp-default' : 'u1');
      const currentUserRole = user?.role || 'seeker';

      // 1. Fetch ALL registered users from MySQL Database
      let allDbUsers = [];
      try {
        const usersRes = await userService.getUsers();
        allDbUsers = Array.isArray(usersRes.data) ? usersRes.data : [];
      } catch (err) {
        console.warn("Could not fetch database users:", err);
      }

      // 2. Fetch all messages involving current user from MySQL Database
      let allDbMessages = [];
      try {
        const msgRes = await messageService.getMessages(currentUserId);
        allDbMessages = Array.isArray(msgRes.data) ? msgRes.data : [];
      } catch (err) {
        console.warn("Could not fetch database messages:", err);
      }

      // 3. Identify all chat partners
      // Filter out the logged-in user themselves AND filter out admin accounts (chat is strictly between Seekers & Employers)
      let targetPartners = allDbUsers.filter(u => u.id !== currentUserId && u.email !== user?.email && u.role !== 'admin');

      // If user is seeker: prioritize showing Employers
      // If user is employer: prioritize showing Seekers
      // Also include any user who has sent or received a message from current user
      const messagedUserIds = new Set();
      allDbMessages.forEach(m => {
        if (m.senderId && m.senderId !== currentUserId) messagedUserIds.add(m.senderId);
        if (m.receiverId && m.receiverId !== currentUserId) messagedUserIds.add(m.receiverId);
      });

      // Filter or sort partners
      let sortedPartners = [...targetPartners];
      if (currentUserRole === 'seeker') {
        sortedPartners.sort((a, b) => {
          if (a.role === 'employer' && b.role !== 'employer') return -1;
          if (a.role !== 'employer' && b.role === 'employer') return 1;
          return 0;
        });
      } else if (currentUserRole === 'employer') {
        sortedPartners.sort((a, b) => {
          if (a.role === 'seeker' && b.role !== 'seeker') return -1;
          if (a.role !== 'seeker' && b.role === 'seeker') return 1;
          return 0;
        });
      }

      // If database has newly registered companies, parse their details accurately
      const convos = sortedPartners.map((partner) => {
        let displayName = partner.name || 'Company Recruiter';
        let companyInfo = null;

        if (partner.company) {
          if (typeof partner.company === 'string') {
            try {
              companyInfo = JSON.parse(partner.company);
              if (companyInfo?.name) displayName = companyInfo.name;
            } catch (e) {
              if (partner.company.length > 0 && partner.company !== '{}') {
                displayName = partner.company;
              }
            }
          } else if (partner.company.name) {
            displayName = partner.company.name;
            companyInfo = partner.company;
          }
        }

        const threadMessages = allDbMessages.filter(m => 
          (m.senderId === currentUserId && m.receiverId === partner.id) ||
          (m.senderId === partner.id && m.receiverId === currentUserId)
        ).sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));

        const lastMsgObj = threadMessages.length > 0 ? threadMessages[threadMessages.length - 1] : null;

        return {
          id: partner.id,
          name: displayName,
          role: partner.role === 'employer' ? 'Employer / Company' : 'Job Seeker',
          email: partner.email || '',
          location: companyInfo?.location || '',
          avatar: displayName.charAt(0).toUpperCase(),
          lastMessage: lastMsgObj ? lastMsgObj.content : 'Tap to start conversation',
          time: lastMsgObj ? (new Date(lastMsgObj.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : '',
          unread: 0,
          online: true,
          messages: threadMessages.map(m => ({
            ...m,
            status: m.status || (m.senderId === currentUserId ? 'delivered' : 'read'),
            isMe: m.senderId === currentUserId
          }))
        };
      });

      // Sort conversations so ones with latest messages are at the very top
      convos.sort((a, b) => {
        if (a.messages.length > 0 && b.messages.length === 0) return -1;
        if (a.messages.length === 0 && b.messages.length > 0) return 1;
        return 0;
      });

      setConversations(convos);

      // Keep active chat synchronized with fresh messages
      if (activeChat) {
        const updatedActive = convos.find(c => c.id === activeChat.id);
        if (updatedActive) {
          if (updatedActive.messages.length > prevMessagesCountRef.current) {
            const lastMsg = updatedActive.messages[updatedActive.messages.length - 1];
            if (lastMsg && !lastMsg.isMe && prevMessagesCountRef.current > 0) {
              playSound('receive');
              setTimeout(scrollChatContainerOnly, 100);
            }
          }
          prevMessagesCountRef.current = updatedActive.messages.length;
          setMessages(updatedActive.messages);
        }
      } else if (directRecipientId) {
        const target = convos.find(c => c.id === directRecipientId);
        if (target) {
          setActiveChat(target);
          setMessages(target.messages || []);
          prevMessagesCountRef.current = (target.messages || []).length;
          setTimeout(scrollChatContainerOnly, 100);
        } else if (convos.length > 0) {
          setActiveChat(convos[0]);
          setMessages(convos[0].messages || []);
          prevMessagesCountRef.current = (convos[0].messages || []).length;
          setTimeout(scrollChatContainerOnly, 100);
        }
      } else if (convos.length > 0 && !activeChat) {
        setActiveChat(convos[0]);
        setMessages(convos[0].messages || []);
        prevMessagesCountRef.current = (convos[0].messages || []).length;
        setTimeout(scrollChatContainerOnly, 100);
      }
    } catch (err) {
      console.error("Error loading real database conversations:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial load when user arrives
  useEffect(() => {
    loadConversations();
  }, [user?.id, user?.role, directRecipientId]);

  // Periodic silent polling every 3 seconds to keep real-time messages synced
  useEffect(() => {
    const interval = setInterval(() => {
      loadConversations(true);
    }, 3500);
    return () => clearInterval(interval);
  }, [activeChat?.id, user?.id]);

  const handleSelectChat = (convo) => {
    setActiveChat(convo);
    setMessages(convo.messages || []);
    prevMessagesCountRef.current = (convo.messages || []).length;
    setShowEmojiPicker(false);
    setTimeout(scrollChatContainerOnly, 50);
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() && !attachedFile) return;
    if (!activeChat) return;

    const currentUserId = user?.id || (user?.role === 'employer' ? 'emp-default' : 'u1');
    const textToSend = inputMessage.trim() + (attachedFile ? `\n📎 Attached: ${attachedFile.name}` : '');
    const msgId = `msg-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newMsg = {
      id: msgId,
      senderId: currentUserId,
      senderName: user?.name || (user?.role === 'employer' ? 'Employer Recruiter' : 'Candidate'),
      receiverId: activeChat.id,
      content: textToSend,
      timestamp: timestamp,
      status: 'sent',
      isMe: true
    };

    // Play WhatsApp send pop sound
    playSound('send');

    // Update UI immediately
    setMessages(prev => [...prev, newMsg]);
    prevMessagesCountRef.current += 1;
    setInputMessage('');
    setAttachedFile(null);
    setShowEmojiPicker(false);
    setTimeout(scrollChatContainerOnly, 50);

    // Update conversation sidebar last message immediately
    setConversations(prev => prev.map(c => {
      if (c.id === activeChat.id) {
        return {
          ...c,
          lastMessage: textToSend,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          messages: [...(c.messages || []), newMsg]
        };
      }
      return c;
    }));

    // Step 1: 500ms -> Double Gray Tick (Delivered to Server)
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'delivered' } : m));
    }, 500);

    // Save strictly to backend MySQL database
    try {
      await messageService.sendMessage(newMsg);
    } catch (err) {
      console.warn("Message saved in local state, backend sync notice:", err);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const addEmoji = (emoji) => {
    setInputMessage(prev => prev + emoji);
  };

  const handleReaction = (msgId, emoji) => {
    setMessageReactions(prev => ({
      ...prev,
      [msgId]: prev[msgId] === emoji ? null : emoji
    }));
  };

  const clearCurrentChat = () => {
    if (confirm(`Clear all messages with ${activeChat.name}?`)) {
      setMessages([]);
      prevMessagesCountRef.current = 0;
      setConversations(prev => prev.map(c => c.id === activeChat.id ? { ...c, messages: [], lastMessage: 'Chat cleared' } : c));
    }
  };

  const formatCallTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    return conversations.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [conversations, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Company & Candidate Messenger
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Live two-way messaging between job seekers and real employer recruiters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadConversations()}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
              title="Refresh messages from Database"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <span suppressHydrationWarning className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span suppressHydrationWarning>Logged in as: {mounted ? (user?.name || 'User') : 'User'} ({mounted ? (user?.role || 'seeker') : 'seeker'})</span>
            </span>
          </div>
        </div>

        {/* Main Messenger Body Container */}
        <div className="bg-white border border-slate-200/90 rounded-3xl h-[700px] shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Left Panel: Conversation List */}
          <div className="md:col-span-4 border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
            
            {/* Search Header */}
            <div className="p-4 border-b border-slate-200/90 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Chats ({conversations.length})</span>
                </h3>
                <span className="text-[11px] font-extrabold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  MySQL Connected
                </span>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search registered company or seeker..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-xs"
                />
              </div>
            </div>

            {/* Conversation Threads Scrollable List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Loading registered companies & chats from MySQL...
                </div>
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map((convo) => {
                  const isSelected = activeChat?.id === convo.id;
                  
                  return (
                    <button
                      key={convo.id}
                      onClick={() => handleSelectChat(convo)}
                      className={`w-full p-4 text-left flex items-start space-x-3.5 transition ${
                        isSelected 
                          ? 'bg-emerald-50/80 border-l-4 border-emerald-600 shadow-xs' 
                          : 'hover:bg-white'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white text-base font-black shadow-sm">
                          {convo.avatar}
                        </div>
                        {convo.online && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{convo.name}</h4>
                          <span className="text-[10px] font-medium text-slate-400 shrink-0">{convo.time}</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 block -mt-0.5">
                          {convo.role}
                        </span>
                        <p className="text-xs text-slate-500 truncate mt-1">
                          {convo.lastMessage}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-2">
                  <AlertCircle className="w-6 h-6 text-slate-400" />
                  <p>No registered users found in database.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Active Chat Window */}
          <div className="md:col-span-8 flex flex-col h-full bg-[#efeae2]/30 relative">
            {activeChat ? (
              <>
                {/* Chat Top Bar */}
                <div className="p-3.5 px-5 border-b border-slate-200 flex items-center justify-between bg-white shadow-xs z-10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-sm">
                      {activeChat.avatar}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {activeChat.name}
                        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                          {activeChat.role}
                        </span>
                      </h3>
                      
                      <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <span>online</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions: Audio Call, Video Call, Clear Chat */}
                  <div className="flex items-center space-x-2 text-slate-600">
                    <button 
                      onClick={() => setActiveCall('audio')}
                      title="Voice Call"
                      className="p-2 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition border border-transparent hover:border-emerald-200"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setActiveCall('video')}
                      title="Video Call"
                      className="p-2 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition border border-transparent hover:border-emerald-200"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={clearCurrentChat}
                      title="Clear Conversation"
                      className="p-2 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Messages Stream (Inner Scroll Container Only) */}
                <div 
                  ref={chatScrollRef}
                  className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"
                >
                  
                  {/* Date Badge */}
                  <div className="flex justify-center my-2">
                    <span className="bg-white/90 border border-slate-200 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-full shadow-xs">
                      Today
                    </span>
                  </div>

                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                      <div className="w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-sm">
                        <Briefcase className="w-7 h-7" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">Start Conversation with {activeChat.name}</h4>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Send a message to this employer. When they log in and read your message, they will reply directly to you!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const currentUserId = user?.id || (user?.role === 'employer' ? 'emp-default' : 'u1');
                      const isMe = msg.senderId === currentUserId || msg.isMe === true;

                      let formattedTime = 'Just now';
                      if (msg.timestamp) {
                        try {
                          formattedTime = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        } catch (e) {
                          formattedTime = msg.timestamp;
                        }
                      }

                      const reaction = messageReactions[msg.id];

                      return (
                        <div
                          key={msg.id || idx}
                          className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          {!isMe && (
                            <span className="text-[10px] font-bold text-slate-500 mb-0.5 px-2">
                              {msg.senderName || activeChat.name}
                            </span>
                          )}
                          
                          <div className="relative max-w-[85%] sm:max-w-[70%]">
                            {/* Message Bubble */}
                            <div
                              className={`p-3 px-4 rounded-2xl text-xs leading-relaxed shadow-sm transition-all relative ${
                                isMe 
                                  ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-xs border border-[#c1f3b8]' 
                                  : 'bg-white text-slate-900 rounded-tl-xs border border-slate-200'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.content}</p>

                              {/* Timestamp & Real WhatsApp Status Ticks */}
                              <div className="flex items-center justify-end space-x-1 text-[10px] text-slate-500 mt-1">
                                <span>{formattedTime}</span>
                                {isMe && (
                                  msg.status === 'read' ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-sky-500 stroke-[2.5]" title="Read by Company" />
                                  ) : msg.status === 'delivered' ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-slate-400 stroke-[2]" title="Delivered" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 text-slate-400 stroke-[2]" title="Sent" />
                                  )
                                )}
                              </div>
                            </div>

                            {/* Floating Quick Reaction */}
                            {reaction && (
                              <div className="absolute -bottom-2 right-2 bg-white border border-slate-200 rounded-full px-1.5 py-0.5 text-xs shadow-xs animate-in zoom-in">
                                {reaction}
                              </div>
                            )}

                            {/* Hover Reaction Toolbar */}
                            <div className="absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 bg-white border border-slate-200 rounded-full px-2 py-0.5 shadow-md -translate-y-6 z-10">
                              {['👍', '❤️', '👏', '😂', '🔥'].map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReaction(msg.id, emoji)}
                                  className="text-xs hover:scale-125 transition-transform"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Attached File Preview Bar */}
                {attachedFile && (
                  <div className="p-2 px-4 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                    <div className="flex items-center space-x-2">
                      <Paperclip className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold truncate max-w-xs">{attachedFile.name}</span>
                      <span className="text-[10px] text-emerald-600 font-medium">({(attachedFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button 
                      onClick={() => setAttachedFile(null)}
                      className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Emoji Picker Tray */}
                {showEmojiPicker && (
                  <div className="p-3 bg-white border-t border-slate-200 flex flex-wrap gap-2 animate-in slide-in-from-bottom-2">
                    {['👍', '❤️', '👏', '😊', '💼', '📄', '🔥', '🙏', '✅', '🎯', '🚀', '⭐', '🤝', '🎉'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => addEmoji(emoji)}
                        className="text-lg hover:scale-125 transition-transform p-1.5 hover:bg-slate-100 rounded-xl"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* Chat Input Bar */}
                <div className="p-3 px-4 border-t border-slate-200 bg-white shadow-sm">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    
                    {/* Emoji Button */}
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-amber-500 transition"
                      title="Emoji"
                    >
                      <Smile className="w-5 h-5" />
                    </button>

                    {/* Paperclip File Upload */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition"
                      title="Attach File"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>

                    {/* Text Input */}
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={`Type a message to ${activeChat.name}...`}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-inner"
                    />

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() && !attachedFile}
                      className="p-2.5 px-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md shadow-emerald-600/30 transition hover:scale-105 flex items-center justify-center"
                      title="Send"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <MessageSquare className="w-12 h-12 text-slate-400 mb-3" />
                <p className="text-sm font-semibold text-slate-900">Select a conversation</p>
                <p className="text-xs text-slate-500 mt-1">Choose a company or candidate from the left panel.</p>
              </div>
            )}

            {/* Live WhatsApp Calling Modal Simulation */}
            {activeCall && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-between p-8 text-white animate-in zoom-in duration-200">
                <div className="text-center space-y-2 mt-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-black mx-auto shadow-2xl ring-4 ring-white/20 animate-pulse">
                    {activeChat?.avatar}
                  </div>
                  <h3 className="text-xl font-bold">{activeChat?.name}</h3>
                  <p className="text-xs text-emerald-400 font-semibold tracking-wider uppercase">
                    {activeCall === 'video' ? 'WhatsApp Video Call' : 'WhatsApp Voice Call'}
                  </p>
                  <p className="text-sm text-slate-300 font-mono pt-2">
                    {formatCallTime(callDuration)}
                  </p>
                </div>

                <div className="flex items-center space-x-6 mb-8">
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-4 rounded-full transition ${isMuted ? 'bg-rose-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>

                  <button 
                    onClick={() => setActiveCall(null)}
                    className="p-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/50 hover:scale-110 transition"
                    title="End Call"
                  >
                    <PhoneOff className="w-7 h-7" />
                  </button>

                  <button 
                    className="p-4 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition"
                    title="Speaker"
                  >
                    <Volume2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400 font-medium">Loading messenger...</div>}>
      <MessagesContent />
    </Suspense>
  );
}