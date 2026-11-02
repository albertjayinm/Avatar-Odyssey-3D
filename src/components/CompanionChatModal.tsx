import React, { useState } from 'react';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { Creature } from '../types';
import { soundManager } from '../utils/sound';

interface Props {
  activeCompanion: Creature;
  levelName: string;
  onClose: () => void;
}

interface ChatMessage {
  sender: 'player' | 'creature';
  creatureSound?: string;
  text: string;
}

export const CompanionChatModal: React.FC<Props> = ({
  activeCompanion,
  levelName,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'creature',
      creatureSound: `*Wiggles tail cheerfully*`,
      text: `Hello friend! I love adventuring with you in ${levelName}!`,
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');

    // Add player message
    setMessages((prev) => [...prev, { sender: 'player', text: userText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat-creature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatureName: activeCompanion.name,
          personality: activeCompanion.description,
          element: activeCompanion.element,
          message: userText,
          levelName,
        }),
      });

      const data = await res.json();
      soundManager.playCreatureHappy();

      setMessages((prev) => [
        ...prev,
        {
          sender: 'creature',
          creatureSound: data.creatureSound,
          text: data.translation,
        },
      ]);
    } catch (err) {
      soundManager.playCreatureHappy();
      setMessages((prev) => [
        ...prev,
        {
          sender: 'creature',
          creatureSound: '*Happy chirps*',
          text: `I'm super happy to explore ${levelName} right by your side! Let's find berries!`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-purple-500/40 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-purple-900/50 flex items-center justify-between bg-gradient-to-r from-purple-950/80 to-slate-900">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow"
              style={{ backgroundColor: activeCompanion.primaryColor }}
            >
              🐾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{activeCompanion.name}</h2>
                <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                  {activeCompanion.element}
                </span>
              </div>
              <p className="text-xs text-purple-200/80 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-300" /> AI Companion Speech Translator
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat History */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.sender === 'player' ? 'items-end' : 'items-start'
              }`}
            >
              {msg.sender === 'creature' && msg.creatureSound && (
                <span className="text-[11px] italic font-semibold text-purple-300 px-1 mb-1">
                  {msg.creatureSound}
                </span>
              )}

              <div
                className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow ${
                  msg.sender === 'player'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-slate-800 text-purple-100 border border-slate-700/80 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-purple-300 italic animate-pulse">
              <MessageCircle className="w-4 h-4" /> {activeCompanion.name} is thinking...
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Say something to ${activeCompanion.name}...`}
            className="flex-1 bg-slate-800 text-white text-xs px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white p-3 rounded-xl transition cursor-pointer shadow"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
