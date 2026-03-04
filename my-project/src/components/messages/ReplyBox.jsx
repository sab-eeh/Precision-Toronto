import { useState } from "react";
import { useMessages } from "../../context/MessageContext";
import { sendReply } from "../../services/messageService";

const ReplyBox = () => {
  const { activePhone } = useMessages();
  const [text, setText] = useState("");

  const handleSend = async () => {
    if (!text.trim()) return;

    await sendReply({
      to: activePhone,
      message: text,
    });

    setText("");
  };

  return (
    <div className="border-t border-white/10 p-4 flex gap-3">
      <input
        className="flex-1 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        placeholder="Type message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={handleSend}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium"
      >
        Send
      </button>
    </div>
  );
};

export default ReplyBox;
