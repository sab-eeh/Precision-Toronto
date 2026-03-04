import { useMessages } from "../../context/MessageContext";

const ChatHeader = () => {
  const { activePhone } = useMessages();

  return (
    <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
      <div>
        <p className="text-white font-semibold text-sm">{activePhone}</p>
        <p className="text-xs text-gray-400">SMS conversation</p>
      </div>

      <div className="text-xs text-gray-500">Precision Toronto</div>
    </div>
  );
};

export default ChatHeader;
