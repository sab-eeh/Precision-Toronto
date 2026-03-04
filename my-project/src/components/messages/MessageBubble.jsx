const MessageBubble = ({ message }) => {
  const isOutgoing = message.direction === "outbound";

  return (
    <div className={`flex ${isOutgoing ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] px-4 py-2 text-sm rounded-xl shadow
          ${
            isOutgoing
              ? "bg-blue-600 text-white"
              : "bg-white/10 text-gray-200 border border-white/10"
          }`}
      >
        {message.body}
      </div>
    </div>
  );
};

export default MessageBubble;
