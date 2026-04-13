import React, { useEffect, useState, useCallback } from 'react';
import { MessageCircle, Send, Plus, ArrowLeft, CheckCircle } from 'lucide-react';
import { 
  getAllSupportConversations, 
  getSupportConversation, 
  adminReplySupportMessage,
  resolveSupportConversation 
} from '../../api/endpoints';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

const AdminSupportChat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState('all'); // all, open, in_progress, resolved

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const response = await getAllSupportConversations();
      setConversations(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load conversations');
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    setLoading(false);
  }, [fetchConversations]);

  // Auto-refresh selected conversation every 2 seconds
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
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedConversation?.id]);

  // Periodically refresh the list to see new conversations
  useEffect(() => {
    const interval = setInterval(async () => {
      await fetchConversations();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchConversations]);

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

  const handleSendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || !selectedConversation) return;

    setSending(true);
    try {
      await adminReplySupportMessage(selectedConversation.id, { message: trimmed });
      setInput('');
      
      // Refresh conversation
      const response = await getSupportConversation(selectedConversation.id);
      const fullConversation = response.data;
      setSelectedConversation(fullConversation);
      setMessages(fullConversation.messages || []);
      toast.success('Message sent successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
      console.error('Send message error:', error);
    } finally {
      setSending(false);
    }
  };

  const handleResolveConversation = async () => {
    if (!selectedConversation) return;

    try {
      await resolveSupportConversation(selectedConversation.id);
      await fetchConversations();
      setSelectedConversation(null);
      setMessages([]);
      toast.success('Conversation marked as resolved');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resolve conversation');
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

  const getStatusBadgeColor = (status) => {
    const colors = {
      OPEN: 'bg-yellow-500',
      IN_PROGRESS: 'bg-blue-500',
      RESOLVED: 'bg-green-500',
      CLOSED: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const filteredConversations = conversations.filter((conv) => {
    if (filter === 'all') return true;
    if (filter === 'open') return conv.status === 'OPEN';
    if (filter === 'in_progress') return conv.status === 'IN_PROGRESS';
    if (filter === 'resolved') return conv.status === 'RESOLVED' || conv.status === 'CLOSED';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <MessageCircle size={30} className="text-blue-600" /> Admin Support Chat
        </h1>
        <p className="text-gray-600 mt-1">Manage customer support conversations and provide assistance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[700px]">
        {/* Conversations List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-3">
            <h2 className="font-bold mb-3 flex items-center gap-2">
              <MessageCircle size={18} /> Support Queue
            </h2>
            
            {/* Filter Tabs */}
            <div className="flex gap-1 text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-2 py-1 rounded ${filter === 'all' ? 'bg-white text-blue-600 font-semibold' : 'bg-blue-500 text-white'}`}
              >
                All ({conversations.length})
              </button>
              <button
                onClick={() => setFilter('open')}
                className={`px-2 py-1 rounded ${filter === 'open' ? 'bg-white text-blue-600 font-semibold' : 'bg-blue-500 text-white'}`}
              >
                Open ({conversations.filter(c => c.status === 'OPEN').length})
              </button>
              <button
                onClick={() => setFilter('in_progress')}
                className={`px-2 py-1 rounded ${filter === 'in_progress' ? 'bg-white text-blue-600 font-semibold' : 'bg-blue-500 text-white'}`}
              >
                In Progress ({conversations.filter(c => c.status === 'IN_PROGRESS').length})
              </button>
              <button
                onClick={() => setFilter('resolved')}
                className={`px-2 py-1 rounded ${filter === 'resolved' ? 'bg-white text-blue-600 font-semibold' : 'bg-blue-500 text-white'}`}
              >
                Resolved ({conversations.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length})
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 p-2">
            {filteredConversations?.length === 0 ? (
              <p className="text-gray-500 text-sm p-4 text-center">No conversations</p>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full text-left p-3 rounded-lg transition border-2 ${
                    selectedConversation?.id === conv.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="font-semibold text-sm text-gray-900 truncate flex-1">{conv.subject}</div>
                    <span className={`text-2xs ${getStatusBadgeColor(conv.status)} rounded-full w-3 h-3`}></span>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">Customer: {conv.userName || 'N/A'}</div>
                  <div className="flex items-center justify-between">
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
          {!selectedConversation ? (
            <div className="flex flex-col h-full items-center justify-center p-6 text-gray-500">
              <MessageCircle size={40} className="text-gray-400 mb-4" />
              <p className="text-center">Select a conversation to start chatting</p>
              <p className="text-sm mt-2 text-gray-400">Messages will appear in real-time</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
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
                    <p className="text-sm text-blue-100">Customer: {selectedConversation?.userName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-3 py-1 rounded font-semibold ${getStatusColor(selectedConversation?.status)}`}>
                    {selectedConversation?.status}
                  </span>
                  {selectedConversation?.status !== 'RESOLVED' && selectedConversation?.status !== 'CLOSED' && (
                    <button
                      onClick={handleResolveConversation}
                      className="text-sm bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded flex items-center gap-1"
                    >
                      <CheckCircle size={16} /> Resolve
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
                {messages?.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>No messages yet. Waiting for customer's first message...</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderType === 'CUSTOMER' ? 'justify-start' : 'justify-end'}`}>
                      <div
                        className={`max-w-[70%] rounded-xl px-4 py-3 text-sm shadow-sm ${
                          msg.senderType === 'CUSTOMER'
                            ? 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                            : 'bg-blue-600 text-white rounded-br-none'
                        }`}
                      >
                        <p className="text-xs font-semibold mb-1 opacity-75">
                          {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p>{msg.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              {selectedConversation?.status !== 'RESOLVED' && selectedConversation?.status !== 'CLOSED' ? (
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
                    placeholder="Type your response..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={sending}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !input.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400 flex items-center gap-2"
                  >
                    <Send size={16} /> {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              ) : (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-100 text-center text-gray-600 text-sm">
                  This conversation is {selectedConversation?.status.toLowerCase()}. No new messages can be sent.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupportChat;
