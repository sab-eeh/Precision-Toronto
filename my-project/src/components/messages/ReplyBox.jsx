import { useState } from "react";
import { sendReply } from "../../services/messageService";
import { useMessages } from "../../context/MessageContext";

const ReplyBox = () => {
  const { activePhone } = useMessages();
  const [text, setText] = useState("");

  const handleSend = async () => {
    if (!text.trim() || !activePhone) return;

    try {
      await sendReply(activePhone, text);
      setText("");
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  return (
    <div className="flex gap-3 p-4 border-t border-slate-800">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type message..."
        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
      />

      <button
        onClick={handleSend}
        className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg text-white"
      >
        Send
      </button>
    </div>
  );
};

export default ReplyBox;
