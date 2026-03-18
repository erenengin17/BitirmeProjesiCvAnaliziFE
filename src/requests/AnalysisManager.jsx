import axiosInstance from "./axiosInstance";

class AnalysisManager {
  createAnalysis(data) {
    return axiosInstance.post("/api/analyses", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
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

  getAnalysisFiles(analysisId) {
    return axiosInstance.get(`/api/analyses/${analysisId}/files`);
  }

  runAnalysis(analysisId, payload) {
    return axiosInstance.post(`/api/analyses/${analysisId}/run`, payload);
  }

  getRunResults(runId) {
    return axiosInstance.get(`/api/analyses/runs/${runId}/results`);
  }
  
  getLastRun(analysisId) {
  return axiosInstance.get(`/api/analyses/${analysisId}/last-run`);
}
}

export default new AnalysisManager();