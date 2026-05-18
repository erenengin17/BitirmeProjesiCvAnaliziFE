import axiosInstance from "./axiosInstance";

class AnalysisManager {
  createAnalysis(data) {
    return axiosInstance.post("/api/analyses", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  getRecentAnalyses() {
    return axiosInstance.get("/api/analyses/my/recent");
  }

  getUserAnalyses() {
    return axiosInstance.get("/api/analyses/my");
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

  explainResult(resultId) {
    return axiosInstance.post(`/api/analyses/results/${resultId}/explain`);
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

  getRunById(runId) {
    return axiosInstance.get(`/api/analyses/runs/${runId}`);
  }

  cloneAnalysis(analysisId, newName) {
    return axiosInstance.post(`/api/analyses/${analysisId}/clone`, { newName });
  }
}

export default new AnalysisManager();