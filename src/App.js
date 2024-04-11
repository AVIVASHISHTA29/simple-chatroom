import { addDoc, collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import "./App.css";
import ImageUpload from './ImageUpload';
import VoiceMemoUpload from './VoiceMemoUpload';
import { db } from './firebase';

function App() {
  const [nameInput, setNameInput] = useState('');
  const [name, setName] = useState(localStorage.getItem('chatUserName') || '');
  const [message, setMessage] = useState('');
  const [chatItems, setChatItems] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, 'messages')), (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        type: 'message',
        ...doc.data(),
      }));

      const imageQuery = query(collection(db, 'images'), orderBy('timestamp', 'desc'), limit(20));
      const unsubscribeImages = onSnapshot(imageQuery, (querySnapshot) => {
        const images = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          type: 'image',
          ...doc.data(),
        }));

        const voiceQuery = query(collection(db, 'voice-memos'), orderBy('timestamp', 'desc'), limit(20));
        const unsubscribeVoiceMemos = onSnapshot(voiceQuery, (voiceSnapshot) => {
          const voiceMemos = voiceSnapshot.docs.map((doc) => ({
            id: doc.id,
            type: 'voice',
            ...doc.data(),
          }));

          const mergedItems = [...messages, ...images, ...voiceMemos].sort((a, b) => a.timestamp - b.timestamp);
          setChatItems(mergedItems);
        });

        return () => {
          unsubscribeVoiceMemos();
        };
      });

      return () => {
        unsubscribeImages();
      };
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
        timestamp: new Date(),
      });
      setMessage('');
    }
  };

  return (
    <div className="app-container">
      {!name && (
        <div className="join-container">
          <h2>Welcome to the Chat App!</h2>
          <form onSubmit={handleNameSubmit}>
            <input
              type="text"
              value={nameInput}
              onChange={handleNameInputChange}
              placeholder="Enter your name"
              className="name-input"
              required
            />
            <button type="submit" className="join-button">Join Chat</button>
          </form>
        </div>
      )}
      {name && (
        <div className="chat-container">
          <div className="chat-items">
            {chatItems.map((item) => (
              <div key={item.id} className={`chat-item ${item.type}`}>
                {item.type === 'message' && (
                  <div className="message-content">
                    <strong>{item.name}</strong>: {item.message}
                    <div className="timestamp">
                      {new Date(item.timestamp?.toDate()).toLocaleString()}
                    </div>
                  </div>
                )}
                {item.type === 'image' && (
                  <div className="image-content">
                    <img src={item.url} alt="Uploaded" className="uploaded-image" />
                    <div className="image-user">{item.userName}</div>
                    <div className="timestamp">
                      {new Date(item.timestamp?.toDate()).toLocaleString()}
                    </div>
                  </div>
                )}
                {item.type === 'voice' && (
                  <div className="voice-memo">
                    <audio controls src={item.url}></audio>
                    <div className="voice-memo-user">{item.userName}</div>
                    <div className="timestamp">
                      {new Date(item.timestamp?.toDate()).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="message-form">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message"
              className="message-input"
              required
            />
            <button type="submit" className="send-button">Send</button>
          </form>
          <ImageUpload userName={name} />
          <VoiceMemoUpload userName={name} />
        </div>
      )}
    </div>
  );
}

export default App;