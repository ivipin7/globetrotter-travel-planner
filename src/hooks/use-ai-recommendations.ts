import { useState, useEffect, useCallback, useRef } from 'react';
import { aiApi, AIDestinationRecommendation, AITripAnalysis } from '@/lib/api';
import {
  getDestinationRecommendations as getLocalRecommendations,
  calculateBudgetEstimate,
  calculateRecommendedDuration,
  analyzeTripCompletion,
  getSmartTravelTips,
  DestinationRecommendation,
  TripCompletionAnalysis
} from '@/lib/ai-recommendations';

interface UseAIRecommendationsProps {
  destination: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  plannedActivities?: number;
}

interface AIRecommendationsResult {
  recommendations: DestinationRecommendation[];
  budgetEstimate: {
    min: number;
    max: number;
    currency: string;
    perDay: { min: number; max: number };
  } | null;
  durationRecommendation: {
    minimum: number;
    recommended: number;
    ideal: number;
  } | null;
  completionAnalysis: TripCompletionAnalysis | null;
  travelTips: string[];
  isLoading: boolean;
  aiPowered: boolean;
  aiInsights: AIDestinationRecommendation | null;
}

export function useAIRecommendations({
  destination,
  startDate,
  endDate,
  budget = 0,
  plannedActivities = 0
}: UseAIRecommendationsProps): AIRecommendationsResult {
  const [recommendations, setRecommendations] = useState<DestinationRecommendation[]>([]);
  const [budgetEstimate, setBudgetEstimate] = useState<AIRecommendationsResult['budgetEstimate']>(null);
  const [durationRecommendation, setDurationRecommendation] = useState<AIRecommendationsResult['durationRecommendation']>(null);
  const [completionAnalysis, setCompletionAnalysis] = useState<TripCompletionAnalysis | null>(null);
  const [travelTips, setTravelTips] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiPowered, setAiPowered] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIDestinationRecommendation | null>(null);
  
  // Track last analyzed values to prevent duplicate API calls
  const lastAnalyzedRef = useRef<string>('');

  const analyze = useCallback(async () => {
    // Create a signature of current values to detect changes
    const signature = `${destination}|${startDate?.getTime() || ''}|${endDate?.getTime() || ''}|${budget}|${plannedActivities}`;
    
    // Skip if we already analyzed these exact values
    if (signature === lastAnalyzedRef.current) {
      return;
    }
    
    if (!destination || destination.length < 2) {
      setRecommendations([]);
      setBudgetEstimate(null);
      setDurationRecommendation(null);
      setCompletionAnalysis(null);
      setTravelTips([]);
      setAiPowered(false);
      setAiInsights(null);
      lastAnalyzedRef.current = signature;
      return;
    }

    // Update ref before starting analysis
    lastAnalyzedRef.current = signature;
    setIsLoading(true);

    try {
      // Try to get real AI recommendations from Gemini API
      const response = await aiApi.getRecommendations(destination);
      const aiData = response.data;
      setAiInsights(aiData);
      setAiPowered(true);

      // Convert AI response to local format
      const convertedRecs: DestinationRecommendation[] = aiData.areas.map(area => ({
        area: area.area,
        description: area.description,
        highlights: area.highlights,
        estimatedBudget: area.estimatedBudget,
        estimatedDays: { ...area.estimatedDays, max: area.estimatedDays.recommended + 1 },
        bestTimeToVisit: area.bestTimeToVisit,
        travelTips: area.travelTips,
        category: area.category as any
      }));
      setRecommendations(convertedRecs);

      // Use AI duration recommendation
      setDurationRecommendation(aiData.recommendedDuration);

      // Calculate budget based on AI data
      if (startDate && endDate) {
        const tripDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        setBudgetEstimate({
          min: tripDays * aiData.estimatedDailyBudget.budget,
          max: tripDays * aiData.estimatedDailyBudget.luxury,
          currency: aiData.estimatedDailyBudget.currency,
          perDay: {
            min: aiData.estimatedDailyBudget.budget,
            max: aiData.estimatedDailyBudget.moderate
          }
        });

        // Use local analysis for completion score (faster)
        const analysis = analyzeTripCompletion(
          destination,
          startDate,
          endDate,
          budget,
          plannedActivities,
          startDate.getMonth()
        );
        setCompletionAnalysis(analysis);
      } else {
        const days = aiData.recommendedDuration.recommended;
        setBudgetEstimate({
          min: days * aiData.estimatedDailyBudget.budget,
          max: days * aiData.estimatedDailyBudget.luxury,
          currency: aiData.estimatedDailyBudget.currency,
          perDay: {
            min: aiData.estimatedDailyBudget.budget,
            max: aiData.estimatedDailyBudget.moderate
          }
        });
        setCompletionAnalysis(null);
      }

      // Use AI tips
      setTravelTips(aiData.localTips);

    } catch (error) {
      console.warn('Gemini API unavailable, using local recommendations:', error);
      setAiPowered(false);
      setAiInsights(null);

      // Fallback to local recommendations
      const recs = getLocalRecommendations(destination);
      setRecommendations(recs);

      const duration = calculateRecommendedDuration(destination);
      setDurationRecommendation(duration);

      if (startDate && endDate) {
        const tripDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const estimate = calculateBudgetEstimate(destination, tripDays);
        setBudgetEstimate(estimate);

        const analysis = analyzeTripCompletion(
          destination,
          startDate,
          endDate,
          budget,
          plannedActivities,
          startDate.getMonth()
        );
        setCompletionAnalysis(analysis);

        const tips = getSmartTravelTips(destination, startDate.getMonth());
        setTravelTips(tips);
      } else {
        const estimate = calculateBudgetEstimate(destination, duration.recommended);
        setBudgetEstimate(estimate);
        
        const tips = getSmartTravelTips(destination, new Date().getMonth());
        setTravelTips(tips);
      }
    }

    setIsLoading(false);
  // Use timestamps for stable dependencies instead of Date objects
  }, [destination, startDate?.getTime(), endDate?.getTime(), budget, plannedActivities]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      analyze();
    }, 500); // Debounce 500ms for API calls

    return () => clearTimeout(debounceTimer);
  }, [analyze]);

  return {
    recommendations,
    budgetEstimate,
    durationRecommendation,
    completionAnalysis,
    travelTips,
    isLoading,
    aiPowered,
    aiInsights
  };
}

// Hook for auto-saving drafts
export function useAutoDraft<T>(
  key: string,
  data: T,
  enabled: boolean = true,
  debounceMs: number = 2000
) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load draft on mount
  const loadDraft = useCallback((): T | null => {
    try {
      const saved = localStorage.getItem(`draft_${key}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.data;
      }
    } catch (e) {
      console.error('Error loading draft:', e);
    }
    return null;
  }, [key]);

  // Save draft
  const saveDraft = useCallback((dataToSave: T) => {
    try {
      setIsSaving(true);
      localStorage.setItem(`draft_${key}`, JSON.stringify({
        data: dataToSave,
        savedAt: new Date().toISOString()
      }));
      setLastSaved(new Date());
      setIsSaving(false);
    } catch (e) {
      console.error('Error saving draft:', e);
      setIsSaving(false);
    }
  }, [key]);

  // Clear draft
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(`draft_${key}`);
      setLastSaved(null);
    } catch (e) {
      console.error('Error clearing draft:', e);
    }
  }, [key]);

  // Check if draft exists
  const hasDraft = useCallback((): boolean => {
    return localStorage.getItem(`draft_${key}`) !== null;
  }, [key]);

  // Get draft timestamp
  const getDraftTimestamp = useCallback((): Date | null => {
    try {
      const saved = localStorage.getItem(`draft_${key}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return new Date(parsed.savedAt);
      }
    } catch (e) {
      console.error('Error getting draft timestamp:', e);
    }
    return null;
  }, [key]);

  // Auto-save with debounce
  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(() => {
      saveDraft(data);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [data, enabled, debounceMs, saveDraft]);

  // Save on page unload
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      saveDraft(data);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [data, enabled, saveDraft]);

  return {
    loadDraft,
    saveDraft,
    clearDraft,
    hasDraft,
    getDraftTimestamp,
    lastSaved,
    isSaving
  };
}
