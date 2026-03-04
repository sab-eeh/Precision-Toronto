import axios from "axios";

export const fetchConversations = async () => {
  const res = await axios.get("/api/messages/conversations");
  return res.data.data;
};

export const fetchMessages = async (phone) => {
  const res = await axios.get(`/api/messages/${phone}`);
  return res.data.data;
};

export const sendReply = async (payload) => {
  return axios.post("/api/messages/reply", payload);
};
