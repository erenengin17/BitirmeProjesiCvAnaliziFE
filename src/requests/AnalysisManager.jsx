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

  getFileContent(fileId) {
    return axiosInstance.get(`/api/analyses/files/${fileId}/content`, {
      responseType: "blob",
    });
  }

  updateResultNote(resultId, note) {
    return axiosInstance.put(`/api/analyses/results/${resultId}/note`, { note });
  }

  deleteAnalysis(analysisId) {
    return axiosInstance.delete(`/api/analyses/${analysisId}`);
  }

  updateAnalysis(analysisId, data) {
    return axiosInstance.patch(`/api/analyses/${analysisId}`, data);
  }

  getAnalysisRuns(analysisId) {
    return axiosInstance.get(`/api/analyses/${analysisId}/runs`);
  }
}

export default new AnalysisManager();