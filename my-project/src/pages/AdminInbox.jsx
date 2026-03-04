import { useNavigate } from "react-router-dom";
import ConversationList from "../components/messages/ConversationList";
import ChatWindow from "../components/messages/ChatWindow";

const AdminInbox = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full flex flex-col bg-[#070F1A] text-white">
      {/* HEADER */}
      <div className="h-[64px] flex items-center justify-between px-6 border-b border-white/10 bg-[#0B1624]">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold">
            PT
          </div>

          <div className="flex flex-col">
            <h1 className="text-sm font-semibold tracking-wide">
              Precision Toronto
            </h1>

            <span className="text-xs text-gray-400">Messaging Inbox</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* Dashboard Button */}
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="px-4 py-2 text-sm rounded-lg border border-white/10 bg-[#0A1A2B] hover:bg-white/5 transition"
          >
            Dashboard
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden p-6 gap-6">
        {/* LEFT PANEL — Conversations */}
        <div
          className="w-full md:w-[340px] lg:w-[360px] 
  rounded-2xl border border-white/10 
  bg-[#0B1624] shadow-xl overflow-hidden"
        >
          <ConversationList />
        </div>

        {/* CHAT PANEL */}
        <div
          className="flex-1 hidden md:flex 
  rounded-2xl border border-white/10 
  bg-[#0B1624] shadow-xl overflow-hidden"
        >
          <ChatWindow />
        </div>
      </div>
    </div>
  );
};

export default AdminInbox;
