import { useState } from "react";
import axios from "axios";
import { API_URL } from "../api/api";

export default function Login() {
  const [email, setEmail] = useState("");

  async function login() {
    await axios.post(`${API_URL}/users/login`, { email });
    alert("Logado!");
  }

  return (
    <div>
      <input placeholder="email" onChange={e => setEmail(e.target.value)} />
      <button onClick={login}>Entrar</button>
    </div>
  );
}
