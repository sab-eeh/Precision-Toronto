import { useState, useRef } from "react";
import { sendReply } from "../../services/messageService";
import { useMessages } from "../../context/MessageContext";

const ReplyBox = () => {
  const { activePhone } = useMessages();

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const textareaRef = useRef(null);

  const handleSend = async () => {
    if (!text.trim() || !activePhone || sending) return;

    const messageText = text;

    setText("");
    setSending(true);

    try {
      await sendReply(activePhone, messageText);
      // message will appear via Socket.IO
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);

    const el = textareaRef.current;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  return (
    <div className="px-6 py-4 bg-[#0B1624] border-t border-white/10">
      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 resize-none bg-[#0A1A2B] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 max-h-[120px] overflow-y-auto"
        />

        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
          ${
            !text.trim() || sending
              ? "bg-blue-600/40 text-white/50 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 text-white shadow-md"
          }`}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ReplyBox;
