import { useState } from "react";
import { sendReply } from "../../services/messageService";
import { useMessages } from "../../context/MessageContext";

const ReplyBox = () => {
  const { activePhone, setMessages } = useMessages();
  const [text, setText] = useState("");

  const handleSend = async () => {
    if (!text.trim() || !activePhone) return;

    const optimisticMessage = {
      body: text,
      from: "admin",
      to: activePhone,
      direction: "outbound",
      createdAt: new Date(),
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      await sendReply(activePhone, text);
      setText("");
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 border-t border-slate-800 bg-[#0f172a]">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type message..."
        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
      />

      <button
        onClick={handleSend}
        className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-xl text-white font-medium transition"
      >
        Send
      </button>
    </div>
  );
};

export default ReplyBox;
