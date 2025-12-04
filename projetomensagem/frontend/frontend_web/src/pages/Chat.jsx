import { useEffect, useState } from "react";
import { socket } from "../services/socket";
import api from "../services/api";
import { useParams } from "react-router-dom";

export default function Chat() {
  const { chatId } = useParams();
  const userId = localStorage.getItem("userId");

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    loadHistory();
    connectSocket();
  }, []);

  async function loadHistory() {
    const token = localStorage.getItem("token");

    const res = await api.get(`/messages/${chatId}`, {
      headers: { Authorization: "Bearer " + token },
    });

    setMessages(res.data);
  }

  function connectSocket() {
    socket.connect();
    socket.emit("join", { userId });

    socket.on("message", (msg) => {
      if (msg.chat_id === Number(chatId)) {
        setMessages((prev) => [...prev, msg]);
      }
    });
  }

  function sendMessage() {
    const msg = {
      chat_id: Number(chatId),
      sender_id: Number(userId),
      content: text,
    };

    socket.emit("send_message", msg);
    setMessages((prev) => [...prev, msg]);
    setText("");
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Chat {chatId}</h2>

      <div style={{ height: 300, overflowY: "scroll", marginBottom: 20 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <strong>{m.sender_id == userId ? "Você" : "Cliente"}:</strong>
            <p>{m.content}</p>
          </div>
        ))}
      </div>

      <input
        placeholder="Digite sua mensagem"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button onClick={sendMessage}>Enviar</button>
    </div>
  );
}
