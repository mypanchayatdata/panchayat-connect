import React, { useState, useEffect, useRef } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, 
  Search, 
  Send, 
  Mic, 
  MicOff, 
  X, 
  Bot, 
  User as UserIcon, 
  ArrowRight, 
  Home, 
  TicketCheck, 
  AlertTriangle, 
  FileCheck, 
  Building, 
  HelpCircle, 
  RefreshCw, 
  CheckCircle2,
  FileText,
  Clock
} from 'lucide-react';

interface UniversalAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, targetId?: string) => void;
  initialQuery?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  matches?: any[];
  suggestedActions?: string[];
}

export const UniversalAIAssistantModal: React.FC<UniversalAIAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  initialQuery = ''
}) => {
  const { 
    panchayat, 
    villages, 
    wards, 
    families, 
    members, 
    tickets, 
    schemes, 
    problems, 
    devWorks,
    keyPeople 
  } = useDatabase();
  const { currentRole, currentUser } = useAuth();

  const [activeMode, setActiveMode] = useState<'search' | 'chat'>('search');
  const [inputText, setInputText] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Search mode results
  const [searchSummary, setSearchSummary] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);

  // Chat messages thread
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Namaste! I am the **Panchayat Connect AI Assistant**. I can help you search records across ${panchayat.name}, draft citizen notices, check government scheme guidelines, or inspect pending follow-up tickets. How can I assist your field work today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'Find BPL families in Ward 1',
        'Show urgent overdue tickets',
        'Check PMAY housing scheme applicants'
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      if (initialQuery) {
        setInputText(initialQuery);
        handleExecuteSearch(initialQuery);
      }
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Voice speech-to-text integration
  const handleToggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  // Build local database snapshot for context
  const getContextSnapshot = () => ({
    panchayat,
    villages,
    wards,
    families,
    members,
    tickets,
    schemes,
    problems,
    devWorks,
    keyPeople
  });

  // Execute Universal AI Search
  const handleExecuteSearch = async (queryToSearch?: string) => {
    const query = (queryToSearch || inputText).trim();
    if (!query) return;

    setIsLoading(true);
    setSearchSummary(null);
    setSearchResults([]);

    try {
      const response = await fetch('/api/gemini/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          localContext: getContextSnapshot()
        })
      });

      const data = await response.json();
      if (data.summary) {
        setSearchSummary(data.summary);
        setSearchResults(data.matches || []);
        setSuggestedActions(data.suggestedActions || []);
      } else {
        setSearchSummary('No results returned. Please try rephrasing your search query.');
      }
    } catch (err: any) {
      setSearchSummary(`AI Search encountered an error: ${err.message || 'Network error'}. Fallback to keyword search in Advanced Filters.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Send Chat Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ sender: m.sender, text: m.text })),
          localContext: getContextSnapshot(),
          role: currentRole
        })
      });

      const data = await response.json();
      if (data.reply) {
        const assistantMessage: ChatMessage = {
          id: 'ai-' + Date.now(),
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'assistant',
        text: `⚠️ I encountered an issue contacting the Gemini AI service (${err.message}). Please ensure GEMINI_API_KEY is configured in AI Studio Secrets.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEntityClick = (targetView: string, targetId: string) => {
    onNavigate(targetView, targetId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-2xl h-full sm:h-[88vh] bg-white sm:rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in-50"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-blue-900/50 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-base sm:text-lg">Universal AI Assistant</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                  Gemini Powered
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ground-level intelligence for {panchayat.name} field administration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200 text-xs font-semibold shrink-0">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setActiveMode('search')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer ${
                activeMode === 'search'
                  ? 'bg-white text-blue-900 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span>Universal Search</span>
            </button>
            <button
              onClick={() => setActiveMode('chat')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer ${
                activeMode === 'chat'
                  ? 'bg-white text-blue-900 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-indigo-600" />
              <span>Field Co-pilot Chat</span>
            </button>
          </div>

          <span className="text-gray-500 text-[11px] hidden sm:inline">
            Role: <strong>{currentRole}</strong>
          </span>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeMode === 'search' ? (
            <div>
              {/* Preset Query Chips */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 text-xs scrollbar-none">
                <span className="text-gray-400 font-medium shrink-0">Examples:</span>
                <button
                  onClick={() => {
                    setInputText('BPL families in Ward 1');
                    handleExecuteSearch('BPL families in Ward 1');
                  }}
                  className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-gray-700 whitespace-nowrap transition-colors"
                >
                  "BPL families in Ward 1"
                </button>
                <button
                  onClick={() => {
                    setInputText('Urgent overdue tickets');
                    handleExecuteSearch('Urgent overdue tickets');
                  }}
                  className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-rose-50 hover:text-rose-800 text-gray-700 whitespace-nowrap transition-colors"
                >
                  "Urgent overdue tickets"
                </button>
                <button
                  onClick={() => {
                    setInputText('PMAY housing beneficiaries');
                    handleExecuteSearch('PMAY housing beneficiaries');
                  }}
                  className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-800 text-gray-700 whitespace-nowrap transition-colors"
                >
                  "PMAY housing applications"
                </button>
              </div>

              {/* AI Search Loading State */}
              {isLoading && (
                <div className="py-12 text-center text-gray-500">
                  <div className="w-10 h-10 mx-auto mb-3 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <p className="font-semibold text-sm text-gray-800">
                    Querying Panchayat Relational Records with Gemini...
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Analyzing villages, wards, families, tickets, and scheme statuses
                  </p>
                </div>
              )}

              {/* Search Summary Result */}
              {!isLoading && searchSummary && (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs mb-1 uppercase tracking-wide">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>AI Synthesis & Analysis</span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
                    {searchSummary}
                  </p>
                </div>
              )}

              {/* Clickable Entity Matches */}
              {!isLoading && searchResults.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Clickable Record Dossiers ({searchResults.length})
                    </span>
                    <span className="text-xs text-gray-400">Click to open</span>
                  </div>
                  <div className="space-y-2">
                    {searchResults.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        onClick={() => handleEntityClick(item.targetView || 'families', item.targetId || item.id)}
                        className="p-3 bg-white hover:bg-blue-50/80 border border-gray-200 hover:border-blue-300 rounded-xl cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-blue-100 text-gray-700 group-hover:text-blue-700">
                            {item.type === 'family' ? (
                              <Home className="w-4 h-4" />
                            ) : item.type === 'ticket' ? (
                              <TicketCheck className="w-4 h-4" />
                            ) : item.type === 'problem' ? (
                              <AlertTriangle className="w-4 h-4" />
                            ) : (
                              <FileCheck className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-sm text-gray-900 truncate">
                                {item.title}
                              </span>
                              {item.badge && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {item.subtitle || item.snippet}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center text-gray-400 group-hover:text-blue-600 pl-3 shrink-0">
                          <span className="text-xs font-semibold mr-1 hidden sm:inline">Open</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isLoading && !searchSummary && searchResults.length === 0 && (
                <div className="py-14 text-center text-gray-400">
                  <Bot className="w-12 h-12 mx-auto mb-2 opacity-30 text-emerald-600" />
                  <h3 className="font-bold text-gray-700 text-base">Universal Natural Language Search</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                    Ask questions naturally in English or Hindi. The AI correlates families, schemes, voter rolls, and problems simultaneously.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Multi-turn Chat Thread */
            <div className="space-y-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2.5 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-slate-900 text-white rounded-tr-xs'
                        : 'bg-gray-100 text-gray-900 rounded-tl-xs border border-gray-200'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    <span className="block text-[10px] text-gray-400 mt-1 text-right">
                      {msg.timestamp}
                    </span>

                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-gray-200/80 flex flex-wrap gap-1.5">
                        {msg.suggestedActions.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(action)}
                            className="text-xs bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50 px-2.5 py-1 rounded-full font-medium transition-colors"
                          >
                            {action} →
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center space-x-2 text-gray-400 text-xs py-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-100" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-200" />
                  <span>Panchayat Assistant is thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200 shrink-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              if (activeMode === 'search') {
                handleExecuteSearch();
              } else {
                handleSendMessage();
              }
            }}
            className="flex items-center space-x-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                className="w-full bg-white border border-gray-300 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                placeholder={
                  activeMode === 'search'
                    ? "Ask anything: 'Show BPL families in Ward 2', 'Who is the sarpanch?'..."
                    : "Ask for scheme guidelines, notice drafting, or field advice..."
                }
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                disabled={isLoading}
              />

              <button
                type="button"
                onClick={handleToggleVoice}
                className={`absolute right-2.5 top-2.5 p-1 rounded-md transition-colors ${
                  isListening 
                    ? 'text-rose-600 bg-rose-100 animate-pulse' 
                    : 'text-gray-400 hover:text-gray-700'
                }`}
                title={isListening ? 'Stop listening' : 'Speak your query'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              {activeMode === 'search' ? (
                <>
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Search</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
