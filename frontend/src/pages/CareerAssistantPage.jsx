import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assistantApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Bot,
  Send,
  Sparkles,
  User,
  ArrowRight,
  Briefcase,
  HelpCircle,
  Zap,
} from 'lucide-react';

export default function CareerAssistantPage() {
  const { user } = useAuth();
  const { error: toastError } = useToast();

  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: `Hello ${user?.name || 'Student'}! 👋 I am your CareerMatch Placement Advisor.\n\nI can analyze your verified skills, CGPA cutoff eligibility, and match scores against our 24 active placement drives.\n\nFeel free to ask me questions like:\n- *"What are my best matches?"*\n- *"What skills should I learn next?"*\n- *"Show opportunities for Full Stack Developer"*`,
      suggestedActions: [
        'What are my top recommendations?',
        'What skills am I missing?',
        'Show Full Stack opportunities',
      ],
      opportunities: [],
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (queryToSend = null) => {
    const q = queryToSend || inputQuery;
    if (!q.trim() || loading) return;

    // Add user message
    const userMsg = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');

    try {
      setLoading(true);
      const res = await assistantApi.chat(q);
      if (res.data.success) {
        const assistantMsg = {
          sender: 'assistant',
          text: res.data.assistant_reply,
          suggestedActions: res.data.suggested_actions || [],
          opportunities: res.data.opportunities || [],
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to reach AI assistant.');
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Sorry, I encountered an issue consulting the placement database. Please verify your connection or try again.',
          suggestedActions: [],
          opportunities: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full flex-1 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Bot className="w-6 h-6 text-indigo-600" />
            Grounded Placement AI Assistant
          </h1>
          <p className="text-xs text-slate-500">
            Rule-based contextual intelligence evaluating database records without live hiring hallucination.
          </p>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
          Backend Service Active
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={index}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-xl space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Referenced opportunities cards */}
                {msg.opportunities?.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Referenced Database Opportunities:
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.opportunities.map((opp) => (
                        <div
                          key={opp.id}
                          className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 block">{opp.company}</span>
                            <span className="text-slate-500">{opp.title} • {opp.salary_range}</span>
                          </div>
                          <Link
                            to={`/opportunities/${opp.id}`}
                            className="px-3 py-1 bg-teal-50 text-teal-700 rounded-lg font-bold hover:bg-teal-100 flex items-center gap-1"
                          >
                            <span>View</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested actions chips */}
                {msg.suggestedActions?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedActions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleSendMessage(action)}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors text-left"
                      >
                        ⚡ {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-500 animate-pulse">
              Consulting placement database and eligibility models...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="pt-3 border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about recommendations, missing skills, eligibility rules, or interview prep..."
            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
