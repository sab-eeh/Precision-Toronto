import { useState } from "react";
import { useMessages } from "../../context/MessageContext";
import {
  deleteConversation,
  fetchConversations,
  togglePinConversation,
} from "../../services/messageService";

const ChatHeader = () => {
  const {
    activePhone,
    setMessages,
    setActivePhone,
    conversations,
    setConversations,
  } = useMessages();

  const [menuOpen, setMenuOpen] = useState(false);

  const handlePin = async () => {
    if (!activePhone) return;

    const convo = conversations.find((c) => c.phone === activePhone);

    await togglePinConversation(activePhone, !convo?.pinned);

    const updated = await fetchConversations();
    setConversations(updated);
  };

  const handleDelete = async () => {
    if (!activePhone) return;

    const confirmDelete = window.confirm("Delete this entire conversation?");

    if (!confirmDelete) return;

    await deleteConversation(activePhone);

    setMessages([]);
    setActivePhone(null);

    const updated = await fetchConversations();
    setConversations(updated);

    setMenuOpen(false);
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-[#0B1624] border-b border-white/10">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-sm font-semibold text-blue-400">
          {activePhone?.slice(-2)}
        </div>

        {/* Contact Info */}
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">
            {activePhone}
          </span>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>SMS Conversation</span>

            <span className="w-1 h-1 bg-gray-500 rounded-full"></span>

            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Active
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="relative">
        {/* Action button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-gray-400 hover:text-white text-lg px-3"
        >
          ⋮
        </button>

        {/* Dropdown menu */}
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-44 bg-[#0F2235] border border-white/10 rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={handlePin}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
            >
              Pin chat
            </button>

            <button
              onClick={handleDelete}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
            >
              Delete chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
