INSERT INTO users (nome, tipo, email, senhaHash) VALUES
('Maria Cliente', 'cliente', 'cliente@email.com', '123'),
('Ana Atendente', 'atendente', 'ana@email.com', '123');

INSERT INTO chats (user1, user2) VALUES (1, 2);

INSERT INTO messages (chat_id, sender_id, content) VALUES
(1, 1, 'Olá!'),
(1, 2, 'Olá! Como posso ajudar?');

