import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const fetchConversations = async () => {
  const res = await axios.get(`${API}api/messages/conversations`);
  return res.data.data || [];
};

export const fetchMessages = async (phone) => {
  const res = await axios.get(`${API}api/messages/${phone}`);
  return res.data.data || [];
};

export const sendReply = async (phone, message) => {
  if (!phone || !message) {
    throw new Error("phone and message required");
  }

  const res = await axios.post(`${API}api/messages/reply`, {
    phone,
    message,
  });

  return res.data;
};
