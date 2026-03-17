import { Routes, Route } from "react-router-dom";
import Home from "../pages/home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import MainPage from "../pages/MainPage";
import AnalysesPage from "../pages/AnalysesPage";
import AnalysisDetailPage from "../pages/AnalysisDetailPage";
import AnalysisResultsPage  from "../pages/AnalysisResultsPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Signup" element={<Signup />} />
      <Route path="/dashboard" element={<MainPage />} />
      <Route path="/analizler" element={<AnalysesPage />} />
      <Route path="/analizler/:id" element={<AnalysisDetailPage />} />
      <Route path="/analysis-runs/:runId/results" element={<AnalysisResultsPage />} />
    </Routes>
  );
}