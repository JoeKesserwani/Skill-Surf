import { useEffect, useState } from "react";
import { db } from "../config/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getDoc } from "firebase/firestore";

export const Admin = () => {
  const [services, setServices] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    const userList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUsers(userList);
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      alert("User deleted.");
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const banUser = async (userId) => {
    try {
      await updateDoc(doc(db, "users", userId), { banned: true });
      alert("User banned.");
      fetchUsers();
    } catch (err) {
      console.error("Error banning user:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const checkAdmin = async (user) => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setIsAdmin(userSnap.data().isAdmin === true);
      }
    };

    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/signin");
        return;
      }
      checkAdmin(user);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      const querySnapshot = await getDocs(collection(db, "services"));
      const servicesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServices(servicesList);
    };

    fetchServices();
  }, []);

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "services", id));
    setServices(services.filter((s) => s.id !== id));
  };

  if (!isAdmin) return <p>Access denied</p>;

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>

      <div className="webservices">
        {services.map((service) => (
          <div key={service.id} className="service-card">
            <img src={service.imageURL} alt={service.title} width="100" />
            <div>
              <h3>{service.title}</h3>
              <p>{service.Sdescription}</p>
              <p>
                <strong>User:</strong> {service.userName}
              </p>
              <button onClick={() => handleDelete(service.id)}>Delete</button>
            </div>
          </div>
        ))}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Ban</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name || "No name"}</td>
                <td>{user.email}</td>
                <td>
                  <button className="ban-btn" onClick={() => banUser(user.id)}>
                    Ban
                  </button>
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => deleteUser(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
