import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useNavigate,
} from "react-router-dom";
import { Signup } from "./skill surf/signup";
import { Signin } from "./skill surf/signin";
import HamburgerMenu from "./components/hamburgermenu";
import { auth } from "./config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { db } from "./config/firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { navigate } from "react-router-dom";
import { SearchResults } from "./skill surf/search";

export const SkillSurf = () => {
  const [photoURL, setPhotoURL] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [buyerMessage, setBuyerMessage] = useState("");

  const navigate = useNavigate();

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

  const handleSearch = (e) => {
    e.preventDefault();

    if (search.trim()) {
      navigate(`/search?query=${encodeURIComponent(search)}`);
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesCollection = collection(db, "services");

        const servicesSnapshot = await getDocs(servicesCollection);

        const servicesList = servicesSnapshot.docs.map((doc) => ({
          id: doc.id,

          ...doc.data(),
        }));

        setServices(servicesList);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, []);

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
    <div className="skillsurf">
      <head>
        <title>SkillSurf</title>
      </head>
      <Routes>
        <Route path="/signup" element={<Signup />}></Route>

        <Route path="/signin" element={<Signin></Signin>} />
      </Routes>

      <div className="navbar">
        <div className="ham">
          <HamburgerMenu />
        </div>

        <h1 id="logo">
          Skill<span style={{ color: "seagreen" }}>Surf</span>
        </h1>

        {user && (
          <button
            id="logout-button"
            onClick={() => {
              signOut(auth)
                .then(() => {
                  console.log("User signed out");
                })

                .catch((error) => {
                  console.error("Error signing out: ", error);
                });
            }}
          >
            Logout
          </button>
        )}

        {!user && (
          <>
            <Link to="/signup" id="signup">
              Signup
            </Link>

            <Link to="/signin" id="signin">
              Log In
            </Link>
          </>
        )}

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

      <form onSubmit={handleSearch} className="search">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search services..."
          id="search-input"
        />

        <button type="submit">Search</button>
      </form>

      <div className="webservices">
        {services.map((service) => (
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                  <strong>Describe your request (min. 30 characters):</strong>
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
            <button onClick={() => setSelectedService(null)}>Close</button>
          </div>
        </div>
      )}
      <footer className="footer">
        <div className="footer-content">
          <p>
            &copy; {new Date().getFullYear()} SkillSurf. All rights reserved.
          </p>
          <p>
            <Link to="/about">About</Link> | <Link to="/terms">Terms</Link> |{" "}
            <Link to="/privacy">Privacy</Link>
          </p>
        </div>
      </footer>
    </div>
  );
};
