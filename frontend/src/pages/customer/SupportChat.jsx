import React, { useEffect, useState, useCallback } from 'react';
import { MessageCircle, Send, Plus, ArrowLeft } from 'lucide-react';
import { 
  getUserConversations, 
  getSupportConversation, 
  createSupportConversation, 
  addSupportMessage,
  closeSupportConversation 
} from '../../api/endpoints';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

const SupportChat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const response = await getUserConversations();
      setConversations(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load conversations');
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    setLoading(false);
  }, [fetchConversations]);

  // Auto-refresh selected conversation every 3 seconds
  useEffect(() => {
    if (!selectedConversation) return;

    const interval = setInterval(async () => {
      try {
        const response = await getSupportConversation(selectedConversation.id);
        const conversation = response.data;
        setSelectedConversation(conversation);
        setMessages(conversation.messages || []);
      } catch (error) {
        console.error('Failed to refresh messages');
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedConversation?.id]);

  const handleSelectConversation = async (conversation) => {
    try {
      const response = await getSupportConversation(conversation.id);
      const fullConversation = response.data;
      setSelectedConversation(fullConversation);
      setMessages(fullConversation.messages || []);
    } catch (error) {
      toast.error('Failed to load conversation');
    }
  };

  const handleCreateConversation = async () => {
    const trimmed = newSubject.trim();
    if (!trimmed) {
      toast.error('Please enter a subject');
      return;
    }

    try {
      const response = await createSupportConversation({ subject: trimmed });
      const conversation = response.data;
      setConversations((prev) => [conversation, ...prev]);
      setNewSubject('');
      setShowNewChat(false);
      await handleSelectConversation(conversation);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create conversation');
    }
  };

  const handleSendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || !selectedConversation) return;

    setSending(true);
    try {
      await addSupportMessage(selectedConversation.id, { message: trimmed });
      setInput('');
      
      // Refresh conversation
      const response = await getSupportConversation(selectedConversation.id);
      const fullConversation = response.data;
      setSelectedConversation(fullConversation);
      setMessages(fullConversation.messages || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleCloseConversation = async () => {
    if (!selectedConversation) return;

    try {
      await closeSupportConversation(selectedConversation.id);
      await fetchConversations();
      setSelectedConversation(null);
      setMessages([]);
      toast.success('Conversation closed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to close conversation');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      OPEN: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
        {/* Conversations List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              <h2 className="font-bold">Support Chats</h2>
            </div>
            <button
              onClick={() => setShowNewChat(true)}
              className="bg-white text-blue-600 p-1 rounded-lg hover:bg-gray-100"
              title="New Chat"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 p-2">
            {conversations?.length === 0 ? (
              <p className="text-gray-500 text-sm p-4 text-center">No conversations yet</p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full text-left p-2 rounded-lg transition ${
                    selectedConversation?.id === conv.id
                      ? 'bg-blue-100 border-l-4 border-blue-600'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="font-semibold text-sm text-gray-900 truncate">{conv.subject}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(conv.status)}`}>
                      {conv.status}
                    </span>
                    <span className="text-xs text-gray-500">{conv.messages?.length || 0} msgs</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden">
          {showNewChat ? (
            <div className="flex flex-col h-full items-center justify-center p-6">
              <MessageCircle size={40} className="text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-4">Start a New Support Chat</h3>
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateConversation();
                }}
                placeholder="Describe your issue (e.g., Order Issue, Payment Problem, Delivery Help)"
                className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNewChat(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateConversation}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold"
                >
                  Start Chat
                </button>
              </div>
            </div>
          ) : !selectedConversation ? (
            <div className="flex flex-col h-full items-center justify-center p-6 text-gray-500">
              <MessageCircle size={40} className="text-gray-400 mb-4" />
              <p className="text-center">Select a conversation or create a new one</p>
              <p className="text-sm mt-2">For urgent issues call: 6302423697</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedConversation(null);
                      setMessages([]);
                    }}
                    className="hover:bg-white/20 p-1 rounded"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <h1 className="font-bold">{selectedConversation?.subject}</h1>
                    <span className={`text-xs px-2 py-0.5 rounded inline-block ${getStatusColor(selectedConversation?.status)}`}>
                      {selectedConversation?.status}
                    </span>
                  </div>
                </div>
                {selectedConversation?.status !== 'CLOSED' && (
                  <button
                    onClick={handleCloseConversation}
                    className="text-xs bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                  >
                    Close Chat
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
                {messages?.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>No messages yet. Send your first message below.</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderType === 'CUSTOMER' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] rounded-xl px-4 py-3 text-sm shadow-sm ${
                          msg.senderType === 'CUSTOMER'
                            ? 'bg-emerald-600 text-white rounded-br-none'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                        }`}
                      >
                        <p className="text-xs font-semibold mb-1 opacity-75">
                          {msg.senderName || 'Support Team'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p>{msg.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              {selectedConversation?.status !== 'CLOSED' ? (
                <div className="px-6 py-4 border-t border-gray-200 bg-white flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    disabled={sending}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !input.trim()}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold disabled:bg-gray-400 flex items-center gap-2"
                  >
                    <Send size={16} /> {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              ) : (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-100 text-center text-gray-600 text-sm">
                  This conversation is closed. To continue, create a new chat.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportChat;
