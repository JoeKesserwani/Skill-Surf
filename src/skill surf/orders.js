import { useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ChatPopup } from "./chatpopup";
import HamburgerMenu from "../components/hamburgermenu";
import { Link } from "react-router-dom";

export const Orders = () => {
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChatOrderId, setActiveChatOrderId] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        await fetchOrders(user.uid);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const fetchOrders = async (uid) => {
    try {
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("participants", "array-contains", uid));
      const snapshot = await getDocs(q);

      const ordersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const bought = ordersList.filter((order) => order.buyerId === uid);
      const sold = ordersList.filter((order) => order.sellerId === uid);

      setBuyerOrders(bought);
      setSellerOrders(sold);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  if (loading) return <p>Loading orders...</p>;

  if (!buyerOrders.length && !sellerOrders.length) {
    return <p>No orders found.</p>;
  }

  return (
    <div className="orders-page">
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

      {buyerOrders.length > 0 && (
        <>
          <h2>Orders You Bought</h2>
          {buyerOrders.map((order) => (
            <div
              key={order.id}
              className="order-card"
              onClick={() => setActiveChatOrderId(order.id)}
            >
              <h3>{order.serviceTitle}</h3>
              <img
                src={
                  order.serviceImageURL ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="Service"
                className="service-image"
              />
              <p>
                <strong>Seller:</strong> {order.sellerName}
              </p>
            </div>
          ))}
        </>
      )}

      {sellerOrders.length > 0 && (
        <>
          <h2>Orders You're Fulfilling</h2>
          {sellerOrders.map((order) => (
            <div
              key={order.id}
              className="order-card"
              onClick={() => setActiveChatOrderId(order.id)}
            >
              <h3>{order.serviceTitle}</h3>
              <img
                src={
                  order.serviceImageURL ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="Service"
                className="service-image"
              />
              <p>
                <strong>Buyer:</strong> {order.buyerName}
              </p>
            </div>
          ))}
        </>
      )}

      {activeChatOrderId && (
        <ChatPopup
          orderId={activeChatOrderId}
          onClose={() => setActiveChatOrderId(null)}
        />
      )}
    </div>
  );
};
