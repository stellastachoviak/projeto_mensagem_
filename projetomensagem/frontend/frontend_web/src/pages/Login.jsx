import { useState } from "react";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function handleLogin() {
    try {
      const res = await api.post("/login", { email, senha });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.id);

      window.location.href = "/dashboard";
    } catch (e) {
      alert("Login inválido");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Painel do Atendente</h1>

      <input placeholder="Email"
        onChange={e => setEmail(e.target.value)} />

      <input placeholder="Senha" type="password"
        onChange={e => setSenha(e.target.value)} />

      <button onClick={handleLogin}>Entrar</button>
    </div>
  );
}
