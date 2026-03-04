import { createContext, useContext, useState } from "react";

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activePhone, setActivePhone] = useState(null);
  const [messages, setMessages] = useState([]);

  return (
    <MessageContext.Provider
      value={{
        conversations,
        setConversations,
        activePhone,
        setActivePhone,
        messages,
        setMessages,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => useContext(MessageContext);
