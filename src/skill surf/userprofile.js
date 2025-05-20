import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { db, auth } from "../config/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import HamburgerMenu from "../components/hamburgermenu";

export const UserProfile = () => {
  const { userId } = useParams();
  const [userInfo, setUserInfo] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserInfo(docSnap.data());
        } else {
          console.log("User not found");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    const fetchUserServices = async () => {
      try {
        const servicesSnapshot = await getDocs(collection(db, "services"));
        const userServices = servicesSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((service) => service.userId === userId);
        setServices(userServices);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchUserInfo();
    fetchUserServices();
    setLoading(false);
  }, [userId]);

  if (loading) return <p>Loading...</p>;

  if (!userInfo) return <p>User not found.</p>;

  return (
    <div className="user-profile">
      <head>
        <title>SkillSurf</title>
      </head>
      <div className="navbar">
        <div className="ham">
          <HamburgerMenu />
        </div>
        <Link to="/" id="logo">
          <h1 id="logo">
            Skill<span style={{ color: "seagreen" }}>Surf</span>
          </h1>
        </Link>
      </div>

      <div className="profilebox">
        <img
          src={
            userInfo.photoURL ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
          }
          className="pfp"
          alt="Profile"
        />
        <h1>{userInfo.name || "Unnamed User"}</h1>
        <p className="description">{userInfo.description}</p>
      </div>
      <div className="profile-extras">
        {userInfo.linkedIn && (
          <p>
            <strong>LinkedIn: </strong>
            <a
              href={userInfo.linkedIn}
              target="_blank"
              rel="noopener noreferrer"
            >
              {userInfo.linkedIn}
            </a>
          </p>
        )}

        {userInfo.resumeURL && (
          <p>
            <strong>Resume: </strong>
            <a
              href={userInfo.resumeURL}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Resume
            </a>
          </p>
        )}

        {userInfo.mediaURLs?.length > 0 && (
          <div className="media-preview">
            <h3>Media</h3>
            <div className="media-grid">
              {userInfo.mediaURLs.map((media, i) => {
                const url = typeof media === "string" ? media : media.url;
                return (
                  <div key={i} className="media-item">
                    {url.includes(".mp4") || url.includes("video") ? (
                      <video src={url} controls width="200" />
                    ) : (
                      <img src={url} alt={`Media ${i + 1}`} width="200" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div className="services">
        <h2 style={{ color: "seagreen" }}>
          Services by {userInfo.name || "this user"}
        </h2>
        {services.length > 0 ? (
          services.map((service) => (
            <div key={service.id} className="service-cards">
              {service.imageURL && (
                <img
                  src={service.imageURL}
                  alt={service.title}
                  width="200"
                  className="simage"
                />
              )}
              <strong>{service.title}</strong>
              <p>{service.Sdescription}</p>
              <p>(${service.price})</p>
            </div>
          ))
        ) : (
          <p>No services found.</p>
        )}
      </div>
    </div>
  );
};
