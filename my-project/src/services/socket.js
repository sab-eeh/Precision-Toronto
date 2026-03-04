import { io } from "socket.io-client";

const API = import.meta.env.VITE_API_URL;

const socket = io(API, {
  transports: ["websocket"],
  withCredentials: true,
  autoConnect: true,
});

export default socket;
