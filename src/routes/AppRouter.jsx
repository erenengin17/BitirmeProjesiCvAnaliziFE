import { Routes, Route } from "react-router-dom";
import Home from "../pages/home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import MainPage from "../pages/MainPage";
import AnalysesPage from "../pages/AnalysesPage";
import AnalysisDetailPage from "../pages/AnalysisDetailPage";
import AnalysisResultsPage from "../pages/AnalysisResultsPage";
import SettingsPage from "../pages/SettingsPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import PipelineDashboardPage from "../pages/PipelineDashboardPage";
import PipelineDetailPage from "../pages/PipelineDetailPage";
import AnalyticsDashboardPage from "../pages/AnalyticsDashboardPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<MainPage />} />
      <Route path="/analizler" element={<AnalysesPage />} />
      <Route path="/analizler/:id" element={<AnalysisDetailPage />} />
      <Route path="/analizler/:runId/results" element={<AnalysisResultsPage />} />
      <Route path="/pipeline" element={<PipelineDashboardPage />} />
      <Route path="/pipeline/:analysisId" element={<PipelineDetailPage />} />
      <Route path="/analytics" element={<AnalyticsDashboardPage />} />
      <Route path="/ayarlar" element={<SettingsPage />} />
      <Route path="/sifremi-unuttum" element={<ForgotPasswordPage />} />
    </Routes>
  );
}