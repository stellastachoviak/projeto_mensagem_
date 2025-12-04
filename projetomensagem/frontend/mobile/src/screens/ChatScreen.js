import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet
} from "react-native";

export default function ChatScreen() {
  const [user, setUser] = useState("Khemily");
  const [toSend, setToSend] = useState("");
  const [msg, setMsg] = useState("");
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);

  const socketRef = useRef(null);

  const openConnection = () => {
    if (!user.trim()) {
      alert("Digite o nome de usuário!");
      return;
    }

    const socket = new WebSocket("ws://localhost:8080");
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      socket.send("@+" + user);
    };

    socket.onclose = () => setConnected(false);

    socket.onerror = (err) => alert("Erro: " + err.message);

    socket.onmessage = (msg) => {
      setMessages((prev) => [...prev, { self: false, text: msg.data }]);
    };
  };

  const sendMessage = () => {
    if (!msg.trim() || !toSend.trim() || !socketRef.current) return;

    const obj = { to: toSend, from: user, msg: msg };

    socketRef.current.send("!" + JSON.stringify(obj));

    setMessages((prev) => [...prev, { self: true, text: msg }]);
    setMsg("");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{toSend || "Chat"}</Text>
      </View>

      {/* Chat Messages */}
      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.self ? styles.bubbleSelf : styles.bubbleOther
            ]}
          >
            <Text style={item.self ? styles.textSelf : styles.textOther}>
              {item.text}
            </Text>
          </View>
        )}
        contentContainerStyle={{ padding: 10 }}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Mensagem"
          value={msg}
          onChangeText={setMsg}
          style={styles.input}
        />

        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={{ color: "white", fontWeight: "bold" }}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// -------------------------------------------
// STYLES – Estilo WhatsApp
// -------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECE5DD",
  },
  header: {
    backgroundColor: "#075E54",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  bubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: "75%",
  },
  bubbleSelf: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
  },
  bubbleOther: {
    backgroundColor: "white",
    alignSelf: "flex-start",
  },
  textSelf: {
    color: "#000",
  },
  textOther: {
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#EEE",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sendButton: {
    backgroundColor: "#075E54",
    padding: 12,
    borderRadius: 30,
    marginLeft: 10,
  },
});
