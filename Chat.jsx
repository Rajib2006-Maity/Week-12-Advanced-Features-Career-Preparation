import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../api/api.js';
import { useSocket } from '../hooks/useSocket.js';
import { useAuth } from '../context/AuthContext.jsx';

const Chat = () => {
  const { otherUserId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [otherTyping, setOtherTyping] = useState(false);
  const typingTimeout = useRef(null);
  const bottomRef = useRef(null);

  // Load prior chat history over REST when the page opens.
  useEffect(() => {
    const load = async () => {
      const { data } = await api.get(`/messages/${otherUserId}`);
      setMessages(data.messages);
    };
    load();
  }, [otherUserId]);

  // Join the shared room and listen for live events once the socket is ready.
  useEffect(() => {
    if (!socket) return undefined;

    socket.emit('join-chat', otherUserId);

    const handleNewMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };
    const handleTyping = ({ userId, isTyping }) => {
      if (userId === otherUserId) setOtherTyping(isTyping);
    };

    socket.on('new-message', handleNewMessage);
    socket.on('user-typing', handleTyping);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('user-typing', handleTyping);
    };
  }, [socket, otherUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket) return;
    socket.emit('send-message', { receiverId: otherUserId, content: text });
    setText('');
    socket.emit('typing', { receiverId: otherUserId, isTyping: false });
  };

  const handleTypingChange = (value) => {
    setText(value);
    if (!socket) return;
    socket.emit('typing', { receiverId: otherUserId, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('typing', { receiverId: otherUserId, isTyping: false });
    }, 1500);
  };

  return (
    <div className="chat-page">
      <Helmet>
        <title>Chat — Connectly</title>
      </Helmet>

      <div className="chat-page__messages">
        {messages.map((m) => (
          <div
            key={m._id || m.createdAt}
            className={`chat-bubble ${m.sender === user.id ? 'chat-bubble--mine' : ''}`}
          >
            {m.content}
          </div>
        ))}
        {otherTyping && <p className="chat-page__typing">Typing…</p>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="chat-page__form">
        <input
          value={text}
          onChange={(e) => handleTypingChange(e.target.value)}
          placeholder="Type a message…"
          maxLength={2000}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
