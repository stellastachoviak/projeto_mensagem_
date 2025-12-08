CREATE DATABASE IF NOT EXISTS chat_app;
USE chat_app;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100),
    tipo ENUM('cliente','atendente'),
    email VARCHAR(120) UNIQUE,
    senhaHash VARCHAR(255)
);

CREATE TABLE chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user1 INT,
    user2 INT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT,
    sender_id INT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    push_token TEXT
);
