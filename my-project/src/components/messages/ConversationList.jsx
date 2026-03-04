import { useEffect } from "react";
import { useMessages } from "../../context/MessageContext";
import { fetchConversations } from "../../services/messageService";

const ConversationList = () => {
  const { conversations, setConversations, activePhone, setActivePhone } =
    useMessages();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchConversations();
        console.log("Conversations:", data);

        setConversations(data || []);
      } catch (error) {
        console.error("Failed to load conversations", error);
      }
    };

    load();
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
