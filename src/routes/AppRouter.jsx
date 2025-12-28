import { Routes, Route } from "react-router-dom";
import Home from "../pages/home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Signup" element={<Signup />} />
    </Routes>
  );
}