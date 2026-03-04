import { useEffect } from "react";
import { useMessages } from "../../context/MessageContext";
import { fetchMessages } from "../../services/messageService";
import ReplyBox from "./ReplyBox";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";

const ChatWindow = () => {
  const { activePhone, messages, setMessages } = useMessages();

  useEffect(() => {
    if (!activePhone) return;

    const loadMessages = async () => {
      const data = await fetchMessages(activePhone);
      setMessages(data);
    };

    loadMessages();
  }, [activePhone]);

  if (!activePhone) {
    return (
      <div className="flex-1 rounded-2xl border border-white/10 bg-[#0B1325] flex items-center justify-center text-gray-400">
        Select a conversation
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 rounded-2xl border border-white/10 bg-[#0B1325]">
      <ChatHeader />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg._id} message={msg} />
        ))}
      </div>

      <ReplyBox />
    </div>
  );
};

export default ChatWindow;
