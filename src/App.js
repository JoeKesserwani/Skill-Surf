import "./App.css";
import { createContext } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Profile } from "./skill surf/profile.js";
import { SkillSurf } from "./skillsurf.js";
import { Signup } from "./skill surf/signup.js";
import { Signin } from "./skill surf/signin.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchResults } from "./skill surf/search.js";
import { UserProfile } from "./skill surf/userprofile.js";
import { Orders } from "./skill surf/orders.js";
import { Admin } from "./skill surf/admin.js";
export const AppContext = createContext();
const queryClient = new QueryClient();

function App() {
  return (
    <AppContext.Provider value={{}}>
      <Router>
        <div className="App">
          <QueryClientProvider client={queryClient}>
            <Routes>
              <Route path="/" element={<SkillSurf></SkillSurf>} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/signin" element={<Signin />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/user/:userId" element={<UserProfile />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </QueryClientProvider>
        </div>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
