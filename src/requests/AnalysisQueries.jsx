import { useMutation, useQuery } from "@tanstack/react-query";
import AnalysisManager from "../requests/AnalysisManager";

export const useCreateAnalysis = () => {
  return useMutation({
    mutationFn: (payload) => AnalysisManager.createAnalysis(payload),
  });
};

export const useRecentAnalyses = (userId) => {
  return useQuery({
    queryKey: ["recentAnalyses", userId],
    queryFn: () => AnalysisManager.getRecentAnalyses(userId),
    enabled: !!userId,
  });
};

export const useUserAnalyses = (userId) => {
  return useQuery({
    queryKey: ["userAnalyses", userId],
    queryFn: () => AnalysisManager.getUserAnalyses(userId),
    enabled: !!userId,
  });
};

export const useAnalysisById = (analysisId) => {
  return useQuery({
    queryKey: ["analysisDetail", analysisId],
    queryFn: () => AnalysisManager.getAnalysisById(analysisId),
    enabled: !!analysisId,
  });
};