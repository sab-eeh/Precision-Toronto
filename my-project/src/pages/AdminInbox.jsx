import ConversationList from "../components/messages/ConversationList";
import ChatWindow from "../components/messages/ChatWindow";

const AdminInbox = () => {
  return (
    <div className="h-[calc(100vh-120px)] w-full flex gap-4">
      {/* Conversations */}
      <div className="w-full md:w-[340px]">
        <ConversationList />
      </div>

      {/* Chat */}
      <div className="flex-1 hidden md:flex">
        <ChatWindow />
      </div>
    </div>
  );
};

export default AdminInbox;
