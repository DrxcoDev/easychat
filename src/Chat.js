import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useParams } from 'react-router-dom';

function Chat() {
  const { receiverId } = useParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Verifica si el usuario está autenticado y establece el ID del usuario actual
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        console.warn('No user is authenticated');
        setCurrentUserId(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUserId || !receiverId) {
      return;
    }

    console.log('Initializing chat with receiver ID:', receiverId);

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('senderId', 'in', [currentUserId, receiverId]),
      where('receiverId', 'in', [currentUserId, receiverId]),
      orderBy('timestamp')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Received message:', data);
        msgs.push(data);
      });
      setMessages(msgs);
    }, (error) => {
      console.error('Error in snapshot listener:', error);
    });

    return () => unsubscribe();
  }, [currentUserId, receiverId]);

  const sendMessage = async () => {
    if (!currentUserId) {
      console.warn('No user is authenticated, cannot send message');
      return;
    }

    if (message.trim() === '') {
      console.warn('Attempted to send an empty message');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'messages'), {
        senderId: currentUserId,
        receiverId: receiverId,
        message: message,
        timestamp: new Date(),
      });
      console.log('Message sent with ID:', docRef.id);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!currentUserId) {
    return <p>Please log in to view this chat.</p>;
  }

  return (
    <div>
      <h1>Chat with User ID: {receiverId}</h1>
      <div>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {messages.map((msg, index) => (
            <li
              key={index}
              style={{
                textAlign: msg.senderId === currentUserId ? 'right' : 'left',
                margin: '10px 0'
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: msg.senderId === currentUserId ? '#e1ffc7' : '#f1f1f1',
                }}
              >
                <strong>{msg.senderId === currentUserId ? 'Me' : 'Them'}:</strong> {msg.message}
              </div>
            </li>
          ))}
        </ul>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
          style={{ width: '80%', padding: '10px', marginRight: '10px' }}
        />
        <button onClick={sendMessage} style={{ padding: '10px' }}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
