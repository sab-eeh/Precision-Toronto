import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const fetchConversations = async () => {
  const res = await axios.get(`${API}/api/messages/conversations`);
  return res.data.data || [];
};

export const fetchMessages = async (phone) => {
  const res = await axios.get(`${API}/api/messages/${phone}`);
  return res.data.data || [];
};

export const sendReply = async (payload) => {
  return axios.post(`${API}/api/messages/reply`, payload);
};
