import { Link } from "react-router-dom";
import HamburgerMenu from "../components/hamburgermenu";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase";
import { deleteObject, getStorage } from "firebase/storage";

export const Profile = (props) => {
  const [photoURL, setPhotoURL] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [description, setDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [Sdescription, setSDescription] = useState("");
  const [price, setPrice] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [services, setServices] = useState([]);
  const [userServices, setUserServices] = useState([]);
  const [resumeURL, setResume] = useState("");
  const [mediaURLs, setMedia] = useState([]);
  const [mediaPreviewURLs, setMediaPreviewURLs] = useState([]);
  const [serviceImageFile, setServiceImageFile] = useState(null);
  const [userPhotoURL, setUserPhotoURL] = useState(null);
  const [userName, setUserName] = useState("");

  const navigate = useNavigate();
  const handleDeleteService = async (service) => {
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;

    try {
      if (service.imageURL) {
        try {
          const imageRef = ref(storage, service.imageURL);
          await deleteObject(imageRef);
        } catch (err) {
          console.warn(
            "Failed to delete image from storage. It may not exist.",
            err
          );
        }
      }

      await deleteDoc(doc(db, "services", service.id));
      setUserServices((prev) => prev.filter((s) => s.id !== service.id));
      alert("Service deleted successfully.");
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Failed to delete service.");
    }
  };

  const handleDeleteMedia = async (mediaObj) => {
    if (!window.confirm("Are you sure you want to delete this media file?"))
      return;

    try {
      const fileRef = ref(storage, mediaObj.path);
      await deleteObject(fileRef);

      const updatedMedia = mediaURLs.filter((m) => m.url !== mediaObj.url);
      await setDoc(
        doc(db, "users", auth.currentUser.uid),
        { mediaURLs: updatedMedia },
        { merge: true }
      );

      setMedia(updatedMedia);
      alert("Media deleted successfully.");
    } catch (error) {
      console.error("Error deleting media:", error);
      alert("Failed to delete media.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageURL = "";

      if (serviceImageFile) {
        const imageRef = ref(
          storage,
          `serviceImages/${auth.currentUser.uid}_${serviceImageFile.name}`
        );
        const snapshot = await uploadBytes(imageRef, serviceImageFile);
        imageURL = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, "services"), {
        title,
        Sdescription,
        price,
        imageURL,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userPhotoURL: user.photoURL,
        userName: user.displayName,
      });

      alert("Service added!");
      setShowModal(false);
      setTitle("");
      setSDescription("");
      setPrice("");
      setServiceImageFile(null);
      setUserPhotoURL(null);
      setUserName("");
    } catch (error) {
      console.error("Error adding service:", error);
    }
  };

  const handleDescriptionChange = (e) => setDescription(e.target.value);
  const handleLinkedInChange = (e) => setLinkedIn(e.target.value);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);

    setMediaFiles((prev) => [...prev, ...files]);

    const previews = files.map((file) => URL.createObjectURL(file));
    setMediaPreviewURLs((prev) => [...prev, ...previews]);
  };

  const saveProfileExtras = async () => {
    if (!linkedIn && !resumeFile && mediaFiles.length === 0) {
      alert("Please upload a file or add a LinkedIn link.");
      return;
    }

    let resumeDownloadURL = resumeURL;
    let uploadedMediaURLs = [];

    try {
      if (resumeFile) {
        const resumeRef = ref(
          storage,
          `resumes/${auth.currentUser.uid}_${resumeFile.name}`
        );
        const snapshot = await uploadBytes(resumeRef, resumeFile);
        resumeDownloadURL = await getDownloadURL(snapshot.ref);
      }

      for (const file of mediaFiles) {
        const filePath = `media/${auth.currentUser.uid}_${file.name}`;
        const mediaRef = ref(storage, filePath);
        const snapshot = await uploadBytes(mediaRef, file);
        const url = await getDownloadURL(snapshot.ref);
        uploadedMediaURLs.push({ url, path: filePath });
      }

      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      const oldMedia = userDoc.exists() ? userDoc.data().mediaURLs || [] : [];

      const combinedMedia = [...oldMedia, ...uploadedMediaURLs];

      await setDoc(
        doc(db, "users", auth.currentUser.uid),
        {
          linkedIn,
          resumeURL: resumeDownloadURL,
          mediaURLs: [...oldMedia, ...uploadedMediaURLs],
        },
        { merge: true }
      );

      setResume(resumeDownloadURL);
      setMedia(combinedMedia);
      alert("Profile extras saved!");
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Failed to save profile extras.");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const docRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setDescription(data.description || "");
            setLinkedIn(data.linkedIn || "");
            setResume(data.resumeURL || "");
            setMedia(data.mediaURLs || []);
            setUserPhotoURL(data.photoURL);
            setUserName(data.userName);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchDescription = async () => {
      if (auth.currentUser) {
        const docRef = doc(db, "users", auth.currentUser.uid);
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setDescription(docSnap.data().description || "");
            console.log("Fetched description:", docSnap.data().description);
          } else {
            console.log("No description found for this user.");
          }
        } catch (error) {
          console.error("Error fetching description:", error);
        }
      }
    };
    fetchDescription();
  }, []);

  const saveDescription = async () => {
    console.log("Save button clicked");
    if (auth.currentUser) {
      const docRef = doc(db, "users", auth.currentUser.uid);
      try {
        await setDoc(docRef, { description }, { merge: true });
        alert("Description saved!");
      } catch (error) {
        console.error("Error saving description:", error);
        alert("Failed to save description. Please try again.");
      }
    } else {
      alert("You must be logged in to save your description.");
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      if (!user) return;
      try {
        const servicesSnapshot = await getDocs(collection(db, "services"));
        const servicesList = servicesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setServices(servicesList);

        const ownedServices = servicesList.filter(
          (service) => service.userId === user.uid
        );
        setUserServices(ownedServices);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
        setShowPopup(true);
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
  const handleClosePopup = () => {
    setShowPopup(false);
    navigate("/signin");
  };

  if (!user && !showPopup) return null;

  return (
    <div className="profile">
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
      {showPopup ? (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Please log in to access this page.</h2>
            <button onClick={handleClosePopup}>OK</button>
          </div>
        </div>
      ) : (
        <div>
          <div className="profilebox">
            <div className="pfp-container">
              <img
                src={
                  user?.photoURL ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                className="pfp"
                alt="Profile"
              />
              <label className="change-pfp-btn">
                Change
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    try {
                      const imageRef = ref(
                        storage,
                        `profilePictures/${auth.currentUser.uid}_${file.name}`
                      );
                      await uploadBytes(imageRef, file);
                      const downloadURL = await getDownloadURL(imageRef);

                      await setDoc(
                        doc(db, "users", auth.currentUser.uid),
                        { photoURL: downloadURL },
                        { merge: true }
                      );
                      await updateProfile(auth.currentUser, {
                        photoURL: downloadURL,
                      });

                      setPhotoURL(downloadURL);
                      alert("Profile picture updated!");
                    } catch (err) {
                      console.error("Failed to update profile picture:", err);
                      alert("Error uploading profile picture.");
                    }
                  }}
                />
              </label>
              <h1>{auth.currentUser?.displayName}</h1>
            </div>

            <div className="description">
              <textarea
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Add a description about yourself..."
                className="description-input"
              ></textarea>
              <button onClick={saveDescription} className="save-button">
                Save Description
              </button>
            </div>
          </div>
          <div className="profile-extras">
            <input
              type="text"
              placeholder="LinkedIn URL"
              value={linkedIn}
              onChange={handleLinkedInChange}
            />

            <div>
              <label>Upload Resume (PDF):</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setResumeFile(e.target.files[0])}
              />
            </div>

            <div>
              <label>Upload Media (Images/Videos):</label>
              <input type="file" multiple onChange={handleMediaChange} />
            </div>

            <button onClick={saveProfileExtras} className="save-button">
              Save
            </button>

            {mediaURLs.length > 0 && (
              <div className="media-preview">
                <h3>Media Preview</h3>
                <div className="media-grid">
                  {mediaURLs.map((media, i) => {
                    const mediaUrl =
                      typeof media === "string" ? media : media?.url;

                    return (
                      <div
                        key={i}
                        className="media-item"
                        style={{ position: "relative" }}
                      >
                        <button
                          onClick={() => handleDeleteMedia(media)}
                          style={{}}
                          className="delete-button"
                        >
                          ×
                        </button>

                        {mediaUrl?.includes(".mp4") ||
                        mediaUrl?.includes("video") ? (
                          <video src={mediaUrl} controls width="200" />
                        ) : (
                          <img
                            src={mediaUrl}
                            alt={`Media ${i + 1}`}
                            width="200"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="services">
            {user && userServices.length === 0 && (
              <div className="addservice">
                <button
                  className="addservicebtn"
                  onClick={() => setShowModal(true)}
                >
                  +
                </button>
                <h3>Add a Service</h3>
              </div>
            )}

            {user && userServices.length > 0 ? (
              <>
                <div className="service-header">
                  <h1 style={{ color: "seagreen" }}>Your Services</h1>
                  <div className="servicebtn">
                    <button
                      className="addservicebtn"
                      onClick={() => setShowModal(true)}
                    >
                      +
                    </button>
                  </div>
                </div>
                {userServices.map((service) => (
                  <div className="service-cards" key={service.id}>
                    {service.imageURL && (
                      <img
                        src={service.imageURL}
                        alt={service.title}
                        width="200"
                        className="simage"
                      />
                    )}
                    <strong>{service.title}</strong> {service.Sdescription}
                    <p>
                      {" "}
                      ($
                      {service.price})
                    </p>
                    <button onClick={() => handleDeleteService(service)}>
                      remove service
                    </button>
                  </div>
                ))}
              </>
            ) : null}
          </div>

          {showModal && (
            <div className="smodal-backdrop">
              <div className="smodal">
                <h2>Add a New Service</h2>
                <form onSubmit={handleSubmit}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setServiceImageFile(e.target.files[0])}
                  />
                  <input
                    type="text"
                    placeholder="Service Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  <textarea
                    placeholder="Description"
                    value={Sdescription}
                    onChange={(e) => setSDescription(e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                  <button type="submit">Submit</button>
                  <button type="button" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
