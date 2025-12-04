require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERRO: Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-super-seguro-aqui';
const PORT = process.env.PORT || 3000;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !users) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const validPassword = await bcrypt.compare(password, users.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: users.id, email: users.email, role: users.role, name: users.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        avatar: users.avatar
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (!['cliente', 'atendente'].includes(role)) {
      return res.status(400).json({ error: 'Tipo de usuário inválido' });
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email, password: hashedPassword, role }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({ error: 'Erro ao criar usuário' });
    }

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      userId: data.id
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/contacts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = supabase
      .from('users')
      .select('id, name, email, role, avatar, online');

    if (userRole === 'cliente') {
      query = query.eq('role', 'atendente');
    } else if (userRole === 'atendente') {
      query = query.neq('id', userId);
    }

    const { data: contacts, error } = await query;

    if (error) {
      console.error('Erro ao buscar contatos:', error);
      return res.status(500).json({ error: 'Erro ao buscar contatos' });
    }

    res.json({ contacts });
  } catch (error) {
    console.error('Erro ao buscar contatos:', error);
    res.status(500).json({ error: 'Erro ao buscar contatos' });
  }
});

app.get('/chats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: chats, error } = await supabase
      .from('chats')
      .select(`
        id,
        created_at,
        updated_at,
        user1:users!chats_user1_id_fkey(id, name, role, avatar, online),
        user2:users!chats_user2_id_fkey(id, name, role, avatar, online)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Erro ao buscar chats' });
    }

    const formattedChats = await Promise.all(
      chats.map(async (chat) => {
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('message, created_at')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', chat.id)
          .eq('is_read', false)
          .neq('sender_id', userId);

        const otherUser = chat.user1.id === userId ? chat.user2 : chat.user1;

        return {
          id: chat.id,
          otherUser: {
            id: otherUser.id,
            name: otherUser.name,
            role: otherUser.role,
            avatar: otherUser.avatar,
            online: otherUser.online
          },
          lastMessage: lastMessage?.message || null,
          lastMessageTime: lastMessage?.created_at || null,
          unreadCount: unreadCount || 0,
          updatedAt: chat.updated_at
        };
      })
    );

    res.json({ chats: formattedChats });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar chats' });
  }
});

app.post('/chats', authenticateToken, async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!otherUserId) {
      return res.status(400).json({ error: 'ID do outro usuário é obrigatório' });
    }

    const { data: otherUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', otherUserId)
      .single();

    if (userError || !otherUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (userRole === 'cliente' && otherUser.role === 'cliente') {
      return res.status(403).json({ error: 'Clientes não podem conversar entre si' });
    }

    const { data: existingChats } = await supabase
      .from('chats')
      .select('id')
      .or(
        `and(user1_id.eq.${userId},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${userId})`
      );

    if (existingChats && existingChats.length > 0) {
      return res.json({ chatId: existingChats[0].id, existing: true });
    }

    const { data: newChat, error: chatError } = await supabase
      .from('chats')
      .insert([{ user1_id: userId, user2_id: otherUserId }])
      .select()
      .single();

    if (chatError) {
      return res.status(500).json({ error: 'Erro ao criar chat' });
    }

    res.status(201).json({ chatId: newChat.id, existing: false });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar chat' });
  }
});

app.get('/messages/:chatId', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    const { data: chat } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .single();

    if (!chat) {
      return res.status(403).json({ error: 'Acesso negado a este chat' });
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        chat_id,
        sender_id,
        message,
        message_type,
        is_read,
        created_at,
        sender:users!messages_sender_id_fkey(name, role, avatar)
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      return res.status(500).json({ error: 'Erro ao buscar mensagens' });
    }

    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('chat_id', chatId)
      .eq('is_read', false)
      .neq('sender_id', userId);

    const formattedMessages = messages.reverse().map((msg) => ({
      id: msg.id,
      chatId: msg.chat_id,
      senderId: msg.sender_id,
      senderName: msg.sender.name,
      senderRole: msg.sender.role,
      senderAvatar: msg.sender.avatar,
      message: msg.message,
      messageType: msg.message_type,
      isRead: msg.is_read,
      createdAt: msg.created_at
    }));

    res.json({ messages: formattedMessages });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

const connectedUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Token não fornecido'));

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Token inválido'));
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    socket.userName = decoded.name;
    next();
  });
});

io.on('connection', async (socket) => {
  connectedUsers.set(socket.userId, socket.id);

  try {
    await supabase.from('users').update({ online: true }).eq('id', socket.userId);
    socket.broadcast.emit('user_online', { userId: socket.userId });
  } catch (error) {}

  try {
    const { data: chats } = await supabase
      .from('chats')
      .select('id')
      .or(`user1_id.eq.${socket.userId},user2_id.eq.${socket.userId}`);

    if (chats) {
      chats.forEach((chat) => {
        socket.join(`chat_${chat.id}`);
      });
    }
  } catch (error) {}

  socket.on('send_message', async (data) => {
    try {
      const { chatId, message, messageType = 'text' } = data;

      const { data: chat } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .or(`user1_id.eq.${socket.userId},user2_id.eq.${socket.userId}`)
        .single();

      if (!chat) {
        return socket.emit('error', { message: 'Acesso negado a este chat' });
      }

      const receiverId =
        chat.user1_id === socket.userId ? chat.user2_id : chat.user1_id;

      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert([
          {
            chat_id: chatId,
            sender_id: socket.userId,
            receiver_id: receiverId,
            message,
            message_type: messageType
          }
        ])
        .select()
        .single();

      if (error) {
        return socket.emit('error', { message: 'Erro ao enviar mensagem' });
      }

      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);

      const messageData = {
        id: newMessage.id,
        chatId,
        senderId: socket.userId,
        senderName: socket.userName,
        senderRole: socket.userRole,
        receiverId,
        message,
        messageType,
        isRead: false,
        createdAt: newMessage.created_at
      };

      io.to(`chat_${chatId}`).emit('new_message', messageData);

      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('push_notification', {
          title: `Nova mensagem de ${socket.userName}`,
          body: message,
          chatId,
          senderId: socket.userId
        });
      }
    } catch (error) {}
  });

  socket.on('mark_as_read', async (data) => {
    try {
      const { chatId } = data;

      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('chat_id', chatId)
        .eq('receiver_id', socket.userId)
        .eq('is_read', false);

      socket
        .to(`chat_${chatId}`)
        .emit('messages_read', { chatId, userId: socket.userId });
    } catch (error) {}
  });

  socket.on('typing', (data) => {
    socket.to(`chat_${data.chatId}`).emit('user_typing', {
      chatId: data.chatId,
      userId: socket.userId,
      userName: socket.userName
    });
  });

  socket.on('stop_typing', (data) => {
    socket.to(`chat_${data.chatId}`).emit('user_stop_typing', {
      chatId: data.chatId,
      userId: socket.userId
    });
  });

  socket.on('disconnect', async () => {
    connectedUsers.delete(socket.userId);

    try {
      await supabase.from('users').update({ online: false }).eq('id', socket.userId);
      socket.broadcast.emit('user_offline', { userId: socket.userId });
    } catch (error) {}
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 WebSocket pronto para conexões`);
  console.log(`🔗 Supabase conectado: ${supabaseUrl}`);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
: