import { useMutation, useQuery } from "@tanstack/react-query";
import AnalysisManager from "../requests/AnalysisManager";

export const useCreateAnalysis = () => {
  return useMutation({
    mutationFn: (payload) => AnalysisManager.createAnalysis(payload),
  });
};

export const useRecentAnalyses = () => {
  return useQuery({
    queryKey: ["recentAnalyses"],
    queryFn: () => AnalysisManager.getRecentAnalyses(),
  });
};

export const useUserAnalyses = () => {
  return useQuery({
    queryKey: ["userAnalyses"],
    queryFn: () => AnalysisManager.getUserAnalyses(),
  });
};

export const useAnalysisById = (analysisId) => {
  return useQuery({
    queryKey: ["analysisDetail", analysisId],
    queryFn: () => AnalysisManager.getAnalysisById(analysisId),
    enabled: !!analysisId,
    retry: false,
  });
};

export const useAnalysisFiles = (analysisId) => {
  return useQuery({
    queryKey: ["analysisFiles", analysisId],
    queryFn: () => AnalysisManager.getAnalysisFiles(analysisId),
    enabled: !!analysisId,
  });
};

export const useRunAnalysis = () => {
  return useMutation({
    mutationFn: ({ analysisId, payload }) =>
      AnalysisManager.runAnalysis(analysisId, payload),
  });
};

export const useRunResults = (runId) => {
  return useQuery({
    queryKey: ["analysisResults", runId],
    queryFn: () => AnalysisManager.getRunResults(runId),
    enabled: !!runId,
  });
};

export const useUpdateResultNote = () => {
  return useMutation({
    mutationFn: ({ resultId, note }) => AnalysisManager.updateResultNote(resultId, note),
  });
};

export const useExplainResult = () => {
  return useMutation({
    mutationFn: (resultId) => AnalysisManager.explainResult(resultId),
  });
};


export const useDeleteAnalysis = () => {
  return useMutation({
    mutationFn: (analysisId) => AnalysisManager.deleteAnalysis(analysisId),
  });
};

export const useUpdateAnalysis = () => {
  return useMutation({
    mutationFn: ({ analysisId, data }) => AnalysisManager.updateAnalysis(analysisId, data),
  });
};

export const useAnalysisRuns = (analysisId) => {
  return useQuery({
    queryKey: ["analysisRuns", analysisId],
    queryFn: () => AnalysisManager.getAnalysisRuns(analysisId),
    enabled: !!analysisId,
  });
};

export const useRunById = (runId) => {
  return useQuery({
    queryKey: ["runById", runId],
    queryFn: () => AnalysisManager.getRunById(runId),
    enabled: !!runId,
  });
};

export const useCloneAnalysis = () => {
  return useMutation({
    mutationFn: ({ analysisId, newName }) => AnalysisManager.cloneAnalysis(analysisId, newName),
  });
};

export const useLastRun = (analysisId) => {
  return useQuery({
    queryKey: ["lastRun", analysisId],
    queryFn: async () => {
      const res = await AnalysisManager.getLastRun(analysisId);
      return res.data;
    },
    enabled: !!analysisId,
  });
};