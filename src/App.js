import "./App.css";
import { User } from "./user.js";
import { useEffect, useState, createContext } from "react";
import Axios from "axios";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { Home } from "./pages/home";
import { Profile } from "./skill surf/profile.js";
import { SkillSurf } from "./skillsurf.js";
import { Signup } from "./skill surf/signup.js";
import { Signin } from "./skill surf/signin.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchResults } from "./skill surf/search.js";
import { UserProfile } from "./skill surf/userprofile.js";
import { Orders } from "./skill surf/orders.js";
export const AppContext = createContext();

function App() {
  const client = new QueryClient();

  return (
    <AppContext.Provider value={{}}>
      <Router>
        <div className="App">
          <QueryClientProvider client={client}>
            <Routes>
              <Route path="/" element={<SkillSurf></SkillSurf>} />
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/signin" element={<Signin />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/user/:userId" element={<UserProfile />} />
              <Route path="/orders" element={<Orders />} />
            </Routes>
          </QueryClientProvider>
        </div>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
