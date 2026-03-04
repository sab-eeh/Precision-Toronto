const MessageBubble = ({ message }) => {
  const isOutgoing = message.direction === "outbound";

  const formatTime = (time) => {
    if (!time) return "";

    const date = new Date(time);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`flex ${isOutgoing ? "justify-end" : "justify-start"}`}>
      <div className="flex flex-col max-w-[65%]">
        {/* MESSAGE BUBBLE */}
        <div
          className={`px-4 py-3 text-sm leading-relaxed rounded-2xl break-words
          shadow-md transition-all duration-150
          ${
            isOutgoing
              ? "bg-blue-600 text-white rounded-br-sm"
              : "bg-[#111F33] text-gray-200 border border-white/10 rounded-bl-sm"
          }`}
        >
          {message.body}
        </div>

        {/* MESSAGE TIME */}
        <span
          className={`text-[11px] text-gray-500 mt-1 ${
            isOutgoing ? "text-right pr-1" : "text-left pl-1"
          }`}
        >
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
