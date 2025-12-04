import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    loadChats();
  }, []);

  async function loadChats() {
    const token = localStorage.getItem("token");

    const res = await api.get("/chats", {
      headers: { Authorization: "Bearer " + token },
    });

    setChats(res.data);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Conversas</h2>

      {chats.map(c => (
        <div
          key={c.id}
          onClick={() => window.location.href = `/chat/${c.id}`}
          style={{
            background: "#eee",
            padding: 10,
            marginBottom: 8,
            cursor: "pointer",
            borderRadius: 6,
          }}>
          <strong>{c.nome}</strong>
          <div>{c.online ? "🟢 online" : "🔴 offline"}</div>
        </div>
      ))}
    </div>
  );
}
