import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { Link } from "react-router-dom";
import HamburgerMenu from "../components/hamburgermenu";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  setDoc,
} from "firebase/firestore";

const useQuery = () => new URLSearchParams(useLocation().search);

export const SearchResults = () => {
  const query = useQuery().get("query") || "";
  const [results, setResults] = useState([]);
  const [user, setUser] = useState(null);
  const [photoURL, setPhotoURL] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [buyerMessage, setBuyerMessage] = useState("");

  const handleBuy = async () => {
    if (!user || !selectedService) return;

    if (buyerMessage.length < 30) return;

    try {
      const orderRef = await addDoc(collection(db, "orders"), {
        serviceId: selectedService.id,
        serviceTitle: selectedService.title,
        buyerId: user.uid,
        buyerName: user.displayName,
        sellerId: selectedService.userId,
        sellerName: selectedService.userName,
        price: selectedService.price,
        buyerDescription: buyerMessage,
        createdAt: serverTimestamp(),
        participants: [user.uid, selectedService.userId],
        serviceImageURL: selectedService.imageURL,
      });

      await setDoc(doc(db, "chats", orderRef.id), {
        orderId: orderRef.id,
        buyerId: user.uid,
        sellerId: selectedService.userId,
        timestamp: serverTimestamp(),
      });

      await addDoc(collection(db, "chats", orderRef.id, "messages"), {
        text: buyerMessage,
        senderId: user.uid,
        timestamp: serverTimestamp(),
      });

      alert("Order placed and chat started!");
      setSelectedService(null);
      setBuyerMessage("");
    } catch (error) {
      console.error("Error placing order: ", error);
      alert("Could not place the order.");
    }
  };
  useEffect(() => {
    const fetchMatchingServices = async () => {
      const allServicesSnapshot = await getDocs(collection(db, "services"));
      const allServices = allServicesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const matched = allServices.filter((service) =>
        service.title.toLowerCase().includes(query.toLowerCase())
      );

      setResults(matched);
    };

    fetchMatchingServices();
  }, [query]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setPhotoURL(user.photoURL);
      } else {
        setPhotoURL(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading user info...</p>;

  return (
    <div className="search-results">
      <div className="navbar">
        <div className="ham">
          <HamburgerMenu />
        </div>

        <Link to="/" id="logo">
          <h1 id="logo">
            Skill<span style={{ color: "seagreen" }}>Surf</span>
          </h1>
        </Link>
        <Link to="/profile">
          <img
            src={
              user?.photoURL && user.photoURL !== "null"
                ? user.photoURL
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            className="profile-image"
          />
        </Link>
      </div>

      <div>
        <h2>Search Results for "{query}"</h2>
        {results.length === 0 ? (
          <p>No matching services found.</p>
        ) : (
          <div className="services">
            <div className="webservices">
              {results.map((service) => (
                <div
                  key={service.id}
                  className="service-card"
                  onClick={() => setSelectedService(service)}
                >
                  <img
                    src={service.imageURL}
                    alt={service.title}
                    className="simage"
                  />

                  <div className="service-header">
                    <strong className="stitle">{service.title}</strong>
                  </div>
                  <Link to={`/user/${service.userId}`}>
                    <img
                      src={
                        service.userPhotoURL
                          ? service.userPhotoURL
                          : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt="Owner"
                      className="owner-photo"
                    />
                  </Link>
                  <h3 className="owner-name"> {service.userName}</h3>

                  <p>${service.price}</p>
                </div>
              ))}
            </div>
            {selectedService && (
              <div
                className="modal-backdrop"
                onClick={() => setSelectedService(null)}
              >
                <div
                  className="modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={selectedService.imageURL}
                    alt={selectedService.title}
                    className="modal-image"
                  />
                  <h2>{selectedService.title}</h2>
                  <div className="service-headers">
                    <Link to={`/user/${selectedService.userId}`}>
                      <img
                        src={
                          selectedService.userPhotoURL
                            ? selectedService.userPhotoURL
                            : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        }
                        alt="Owner"
                        className="owner-photo-large"
                      />
                    </Link>
                    <h3> {selectedService.userName}</h3>
                  </div>
                  <p>{selectedService.Sdescription}</p>
                  <p>
                    <strong>Price:</strong> ${selectedService.price}
                  </p>
                  {user && user.uid !== selectedService.userId && (
                    <div className="buyer-form">
                      <label htmlFor="buyerMessage">
                        <strong>
                          Describe your request (min. 30 characters):
                        </strong>
                      </label>
                      <textarea
                        id="buyerMessage"
                        rows="4"
                        value={buyerMessage}
                        onChange={(e) => setBuyerMessage(e.target.value)}
                        placeholder="Describe what exactly you want from this service..."
                        className="buyer-textarea"
                      ></textarea>

                      <button
                        className="buy-button"
                        disabled={buyerMessage.trim().length < 30}
                        onClick={handleBuy}
                      >
                        Buy
                      </button>
                    </div>
                  )}
                  <button onClick={() => setSelectedService(null)}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
