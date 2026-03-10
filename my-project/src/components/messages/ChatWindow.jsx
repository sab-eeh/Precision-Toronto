import { useEffect, useRef } from "react";
import { useMessages } from "../../context/MessageContext";
import ReplyBox from "./ReplyBox";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import socket from "../../services/socket";
import { fetchMessages } from "../../services/messageService";

const ChatWindow = () => {
  const { activePhone, messages, setMessages } = useMessages();

  const bottomRef = useRef(null);

  useEffect(() => {
    if (!activePhone) return;

    const loadMessages = async () => {
      try {
        const history = await fetchMessages(activePhone);
        setMessages(history || []);
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };

    loadMessages();
  }, [activePhone, setMessages]);

  /* AUTO SCROLL */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* EMPTY STATE */
  if (!activePhone) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm">
        <div className="text-3xl mb-3">💬</div>
        Select a conversation to start messaging
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full">
      {/* STICKY HEADER */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0B1624]">
        <ChatHeader />
      </div>

      {/* MESSAGE SCROLL AREA */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {messages?.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-24 text-gray-400 text-sm">
            <div className="text-2xl mb-2">📩</div>
            No messages yet
          </div>
        )}

        <div className="space-y-4">
          {(messages || []).map((msg) => (
            <MessageBubble key={msg._id} message={msg} />
          ))}
        </div>

        <div ref={bottomRef} />
      </div>

      {/* REPLY BOX */}
      <div className="border-t border-white/10 bg-[#0B1624]">
        <ReplyBox />
      </div>
    </div>
  );
};

export default ChatWindow;
