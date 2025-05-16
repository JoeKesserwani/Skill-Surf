import { useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase";

export const ChatPopup = ({ orderId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        const messagesRef = collection(db, "chats", orderId, "messages");
        const q = query(messagesRef, orderBy("timestamp"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const msgs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMessages(msgs);
        });

        return () => unsubscribe();
      }
    });

    return () => unsub();
  }, [orderId]);

  const handleSendMessage = async () => {
    if (newMessage.trim().length === 0) return;

    try {
      const messageRef = collection(db, "chats", orderId, "messages");
      await addDoc(messageRef, {
        text: newMessage,
        senderId: userId,
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileRef = ref(
      storage,
      `chat_files/${orderId}/${Date.now()}_${file.name}`
    );
    try {
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      const isImage = file.type.startsWith("image/");
      const messageRef = collection(db, "chats", orderId, "messages");
      await addDoc(messageRef, {
        text: "",
        senderId: userId,
        timestamp: serverTimestamp(),
        fileUrl: downloadURL,
        fileName: file.name,
        fileType: file.type,
        isImage,
      });
    } catch (err) {
      console.error("Error uploading file:", err);
    }
  };

  return (
    <div className="chat-popup">
      <button onClick={onClose}>Close</button>
      <div className="chat-messages">
        {messages.map((msg, index) => {
          const isCurrentUser = msg.senderId === userId;

          return (
            <div
              key={index}
              className={`message-row ${
                isCurrentUser ? "message-row-right" : "message-row-left"
              }`}
            >
              <div
                className={`message-bubble ${
                  isCurrentUser ? "my-message" : "other-message"
                }`}
              >
                {msg.text && <p className="message-text">{msg.text}</p>}

                {/* Display image */}
                {msg.isImage && msg.fileUrl && (
                  <img
                    src={msg.fileUrl}
                    alt="uploaded"
                    className="chat-image"
                    style={{
                      maxWidth: "200px",
                      marginTop: "0.5rem",
                      borderRadius: "8px",
                    }}
                  />
                )}

                {/* Display other file types */}
                {!msg.isImage && msg.fileUrl && (
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "blue",
                      textDecoration: "underline",
                      marginTop: "0.5rem",
                    }}
                  >
                    📎 {msg.fileName || "Download File"}
                  </a>
                )}

                <p className="message-time">
                  {msg.timestamp?.toDate
                    ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="chat-input-field"
        />
        <input
          type="file"
          onChange={handleFileChange}
          className="chat-file-input"
        />
        <button onClick={handleSendMessage} className="chat-send-button">
          Send
        </button>
      </div>
    </div>
  );
};
