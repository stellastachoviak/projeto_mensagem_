import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";

export default function ChatScreen({ route }) {
  const { agent, userName } = route.params;

  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);

  const socketRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send("@+" + userName);
    };

    socket.onmessage = (event) => {
      setMessages((prev) => [
        ...prev,
        { self: false, text: event.data },
      ]);
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.send("@-" + userName);
        socketRef.current.close();
      }
    };
  }, []);

  function sendMessage() {
    if (!msg.trim()) return;

    const obj = {
      to: agent.name,
      from: userName,
      msg: msg,
    };

    socketRef.current.send("!" + JSON.stringify(obj));

    setMessages((prev) => [...prev, { self: true, text: msg }]);

    setMsg("");
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{agent.name}</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.self ? styles.bubbleSelf : styles.bubbleOther,
            ]}
          >
            <Text style={item.self ? styles.textSelf : styles.textOther}>
              {item.text}
            </Text>
          </View>
        )}
        contentContainerStyle={{ padding: 10 }}
      />

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Digite sua mensagem..."
          value={msg}
          onChangeText={setMsg}
        />

        <TouchableOpacity style={styles.btn} onPress={sendMessage}>
          <Text style={styles.btnText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ECE5DD" },
  header: { padding: 15, backgroundColor: "#075E54" },
  headerText: { color: "white", fontSize: 18, fontWeight: "bold" },
  bubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  bubbleSelf: { backgroundColor: "#DCF8C6", alignSelf: "flex-end" },
  bubbleOther: { backgroundColor: "white", alignSelf: "flex-start" },
  textSelf: { color: "#000" },
  textOther: { color: "#000" },
  inputArea: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#eee",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  btn: {
    backgroundColor: "#075E54",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 10,
  },
  btnText: { color: "#fff", fontWeight: "bold" },
});
