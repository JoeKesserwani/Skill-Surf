import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useNavigate,
} from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db, provider } from "../config/firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const Signin = () => {
  const navigate = useNavigate();

  const schema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string().required("Password is required"),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onLogin = async (data) => {
    try {
      const { email, password } = data;
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err.message);
      alert("Invalid credentials. Please try again.");
    }
  };
  const onGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          name: user.userName,
          email: user.email,
          photoURL: user.photoURL,
          description: "Hello! I'm new to SkillSurf.",
        });
      }

      navigate("/");
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  return (
    <div className="signin">
      <div className="header1">
        <Link to="/" id="logo">
          <h1 id="logo">
            Skill<span style={{ color: "seagreen" }}>Surf</span>
          </h1>
        </Link>
        <h1>
          <Link to="/signup" id="signin2">
            signup
          </Link>
        </h1>
      </div>
      <div className="container">
        <div className="signinbox">
          <h1>Log In</h1>
          <form onSubmit={handleSubmit(onLogin)}>
            <input type="email" placeholder="Email" {...register("email")} />
            {errors.email && <p className="error">{errors.email.message}</p>}

            <input
              type="password"
              placeholder="Password"
              {...register("password")}
            />
            {errors.password && (
              <p className="error">{errors.password.message}</p>
            )}

            <button type="submit" className="loginbtn">
              Log In
            </button>
          </form>
          <p>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
          <br />
          <div className="googlesignup">
            <button className="googlebtn" onClick={onGoogleSignIn}>
              <img
                src="https://img.icons8.com/color/48/000000/google-logo.png"
                alt="google logo"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
