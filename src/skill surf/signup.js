import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { SkillSurf } from "../skillsurf";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PropTypes from "prop-types";
import { auth, provider } from "../config/firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db } from "../config/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase";

export const Signup = () => {
  const navigate = useNavigate();
  const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
      .string()
      .min(6, "Minimum 6 characters")
      .required("Password is required"),
    image: yup
      .mixed()
      .test(
        "required",
        "Profile image is required",
        (value) => value && value.length > 0
      ),
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onEmailSignup = async (data) => {
    try {
      const { name, email, password, image } = data;

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const imageFile = image[0];
      const imageRef = ref(
        storage,
        `profileImages/${user.uid}/${imageFile.name}`
      );
      await uploadBytes(imageRef, imageFile);
      const photoURL = await getDownloadURL(imageRef);

      await updateProfile(user, {
        displayName: name,
        photoURL,
      });

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        photoURL,
        description: "Hello! I'm new to SkillSurf.",
      });

      navigate("/");
    } catch (error) {
      console.error("Signup error:", error.message);
      alert(error.message);
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
          name: user.displayName,
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
    <div className="mainsignup">
      <head>
        <title>SkillSurf</title>
      </head>
      <div className="signup">
        <div className="header1">
          <Link to="/" id="logo">
            <h1 id="logo">
              Skill<span style={{ color: "seagreen" }}>Surf</span>
            </h1>
          </Link>
          <h1>
            <Link to="/signin" id="signin2">
              Log In
            </Link>
          </h1>
        </div>
      </div>

      <div className="container">
        <div className="signupbox">
          <h1>SignUp</h1>
          <form
            onSubmit={handleSubmit(onEmailSignup)}
            className="email-signup-form"
          >
            <input type="text" placeholder="Name" {...register("name")} />
            {errors.name && <p className="error">{errors.name.message}</p>}

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

            <label>Choose a profile picture:</label>
            <input type="file" accept="image/*" {...register("image")} />
            {errors.image && <p className="error">{errors.image.message}</p>}

            <button type="submit" className="email-signup-btn">
              Sign Up
            </button>
          </form>
          <p>
            Already have an account? <Link to="/signin">Log In</Link>
          </p>
          <p>or</p>

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
