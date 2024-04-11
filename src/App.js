import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import "./App.css";
import ImageUpload from './ImageUpload';
import { db } from './firebase';


function App() {
  const [nameInput, setNameInput] = useState('');
  const [name, setName] = useState(localStorage.getItem('chatUserName') || '');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newMessages = [];
      querySnapshot.forEach((doc) => {
        newMessages.unshift({ id: doc.id, ...doc.data() });
      });
      setMessages(newMessages);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleNameInputChange = (e) => {
    setNameInput(e.target.value);
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('chatUserName', nameInput);
    setName(nameInput);
    setNameInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim() !== '') {
      await addDoc(collection(db, 'messages'), {
        name,
        message,
        timestamp: serverTimestamp(),
      });
      setMessage('');
    }
  };

  return (
    <div className="App">
      {!name && (
        <form onSubmit={handleNameSubmit}>
          <input
            type="text"
            value={nameInput}
            onChange={handleNameInputChange}
            placeholder="Enter your name"
            required
          />
          <button type="submit">Join Chat</button>
        </form>
      )}
      {name && (
        <div className="chat-container">
          <div className="messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.name === name ? 'me' : 'other'}`}
              >
                <div className="message-content">
                  <strong>{msg.name}</strong>: {msg.message}
                </div>
                <div className="timestamp">
                  {new Date(msg.timestamp?.toDate()).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className='message-input'>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message"
              required
            />
            <button type="submit">Send</button>
          </form>
          <ImageUpload />
        </div>
      )}
    </div>
  );
}

export default App;