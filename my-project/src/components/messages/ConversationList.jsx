import { useEffect, useState } from "react";
import { useMessages } from "../../context/MessageContext";
import { fetchConversations } from "../../services/messageService";
import socket from "../../services/socket";

const ConversationList = () => {
  const { conversations, setConversations, activePhone, setActivePhone } =
    useMessages();

  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await fetchConversations();
        setConversations(data || []);
      } catch (error) {
        console.error("Failed loading conversations", error);
      }
    };

    loadConversations();

    const updateConversations = (msg) => {
      setConversations((prev) => {
        const phone = msg.direction === "outbound" ? msg.to : msg.from;

        const existing = prev.find((c) => c.phone === phone);

        if (existing) {
          return prev.map((c) =>
            c.phone === phone
              ? { ...c, lastMessage: msg.body, lastTime: msg.createdAt }
              : c
          );
        }

        return [
          {
            phone,
            lastMessage: msg.body,
            lastTime: msg.createdAt,
          },
          ...prev,
        ];
      });
    };

    socket.on("newMessage", updateConversations);

    return () => {
      socket.off("newMessage", updateConversations);
    };
  }, [setConversations]);

  const filtered = (conversations || []).filter((c) =>
    c.phone.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (time) => {
    if (!time) return "";

    const date = new Date(time);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div className="px-5 py-4 border-b border-white/10">
        <h2 className="text-white font-semibold text-lg">Messages</h2>
      </div>

      {/* SEARCH */}
      <div className="px-4 py-3 border-b border-white/5">
        <input
          type="text"
          placeholder="Search phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#0A1A2B] text-sm text-white px-4 py-2 rounded-lg border border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* CONVERSATION LIST */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-10">
            No conversations yet
          </div>
        )}

        {filtered.map((conv) => {
          const isActive = activePhone === conv.phone;

          return (
            <div
              key={conv.phone}
              onClick={() => setActivePhone(conv.phone)}
              className={`flex items-center gap-3 px-5 py-4 cursor-pointer border-b border-white/5 transition-all duration-150
              
              ${
                isActive
                  ? "bg-blue-500/10 border-l-2 border-l-blue-500"
                  : "hover:bg-white/5"
              }`}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-sm font-semibold text-blue-400 shrink-0">
                {conv.phone.slice(-2)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-white truncate">
                    {conv.phone}
                  </span>

                  <span className="text-xs text-gray-400 ml-2 shrink-0">
                    {formatTime(conv.lastTime)}
                  </span>
                </div>

                <p className="text-xs text-gray-400 truncate mt-1">
                  {conv.lastMessage || "New conversation"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationList;
