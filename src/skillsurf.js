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
import { collection, getDocs, addDoc } from "firebase/firestore";
import { navigate } from "react-router-dom";
import { SearchResults } from "./skill surf/search";

export const SkillSurf = () => {
  const [photoURL, setPhotoURL] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

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

  const handleBuy = async (service) => {
    if (!user) {
      alert("You must be signed in to purchase a service.");
      return;
    }

    try {
      const purchasesRef = collection(db, "purchases");
      await addDoc(purchasesRef, {
        buyerId: user.uid,
        serviceId: service.id,
        title: service.title,
        sellerId: service.ownerId,
        price: service.price,
        timestamp: new Date(),
      });

      alert(`You have purchased: ${service.title}`);
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Error purchasing service. Please try again.");
    }
  };

  return (
    <div className="skillsurf">
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
          <div key={service.id} className="service-card">
            <img
              src={service.imageURL}
              alt={service.title}
              className="simage"
            />
            <strong>{service.title}</strong>
            <p>{service.Sdescription}</p>
            <p>${service.price}</p>

            {user && user.uid !== service.ownerId ? (
              <button onClick={() => handleBuy(service)}>Buy</button>
            ) : (
              <p style={{ fontStyle: "italic", color: "gray" }}>
                {user?.uid === service.ownerId
                  ? "This is your service"
                  : "Sign in to buy"}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
