const Router = ReactRouterDOM.HashRouter;
const { Route, Routes } = ReactRouterDOM;

import { UserMsg } from "./cmps/UserMsg.jsx";
import { AppHeader } from "./cmps/AppHeader.jsx";
import { AppFooter } from "./cmps/AppFooter.jsx";
import { Home } from "./pages/Home.jsx";
import { BugIndex } from "./pages/BugIndex.jsx";
import { BugDetails } from "./pages/BugDetails.jsx";
import { AboutUs } from "./pages/AboutUs.jsx";
import { AdminDashboard } from "./pages/AdminDashboard.jsx";
import { UserProfile } from "./pages/UserProfile.jsx";

export function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <UserMsg />
        <AppHeader />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/bug" element={<BugIndex />} />
            <Route path="/bug/:bugId" element={<BugDetails />} />
            <Route path="/user/:userId?" element={<UserProfile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/about" element={<AboutUs />} />
          </Routes>
        </main>
        <AppFooter />
      </div>
    </Router>
  );
}
