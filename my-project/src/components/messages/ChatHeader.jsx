import { useMessages } from "../../context/MessageContext";

const ChatHeader = () => {
  const { activePhone } = useMessages();

  const formatPhone = (phone) => {
    if (!phone) return "";
    return phone;
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-[#0B1624] border-b border-white/10">
      {/* LEFT SECTION */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-sm font-semibold text-blue-400">
          {activePhone?.slice(-2)}
        </div>

        {/* Customer Info */}
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-white">
            {formatPhone(activePhone)}
          </span>

          <span className="text-xs text-gray-400">SMS Conversation</span>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-3 text-xs text-gray-400">
        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Active
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-white/10"></div>

        {/* Brand */}
        <span className="text-gray-500">Precision Toronto</span>
      </div>
    </div>
  );
};

export default ChatHeader;
