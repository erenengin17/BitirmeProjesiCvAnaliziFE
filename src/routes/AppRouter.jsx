import { Routes, Route } from "react-router-dom";
import Home from "../pages/home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import MainPage from "../pages/MainPage";
import AnalysesPage from "../pages/AnalysesPage";
import AnalysisDetailPage from "../pages/AnalysisDetailPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Signup" element={<Signup />} />
      <Route path="/dashboard" element={<MainPage />} />
      <Route path="/analizler" element={<AnalysesPage />} />
      <Route path="/analizler/:id" element={<AnalysisDetailPage />} />
    </Routes>
  );
}