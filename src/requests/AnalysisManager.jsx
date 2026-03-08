import axiosInstance from "./axiosInstance";

class AnalysisManager {
  createAnalysis(data) {
    return axiosInstance.post("/api/analyses", data);
  }

  getRecentAnalyses(userId) {
    return axiosInstance.get(`/api/analyses/recent/${userId}`);
  }

  getUserAnalyses(userId) {
    return axiosInstance.get(`/api/analyses/user/${userId}`);
  }

  getAnalysisById(analysisId) {
    return axiosInstance.get(`/api/analyses/${analysisId}`);
  }
}

export default new AnalysisManager();