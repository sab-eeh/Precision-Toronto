import { useEffect } from "react";
import { useMessages } from "../../context/MessageContext";
import { fetchConversations } from "../../services/messageService";
import socket from "../../services/socket";

const ConversationList = () => {
  const { conversations, setConversations, activePhone, setActivePhone } =
    useMessages();

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
  }, []);

  return (
    <div className="h-full flex flex-col rounded-2xl border border-white/10 bg-[#0B1325]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-white font-semibold text-lg">Messages</h2>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {(conversations || []).map((conv) => (
          <div
            key={conv.phone}
            onClick={() => setActivePhone(conv.phone)}
            className={`px-5 py-4 cursor-pointer border-b border-white/5 hover:bg-white/5 transition
            ${activePhone === conv.phone ? "bg-white/5" : ""}`}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-white font-medium">
                {conv.phone}
              </span>

              <span className="text-xs text-gray-400">
                {new Date(conv.lastTime).toLocaleTimeString()}
              </span>
            </div>

            <p className="text-xs text-gray-400 mt-1 truncate">
              {conv.lastMessage}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
