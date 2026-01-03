import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Sparkles,
  MapPin,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Target,
  Info,
  Zap,
  Globe
} from 'lucide-react';
import { DestinationRecommendation, TripCompletionAnalysis } from '@/lib/ai-recommendations';
import { AIDestinationRecommendation } from '@/lib/api';
import { cn } from '@/lib/utils';

interface AIRecommendationsCardProps {
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
  onSelectArea?: (area: DestinationRecommendation) => void;
  aiPowered?: boolean;
  aiInsights?: AIDestinationRecommendation | null;
}

const categoryColors: Record<string, string> = {
  cultural: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  adventure: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  relaxation: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  nature: 'bg-green-500/10 text-green-600 border-green-500/20',
  urban: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  historical: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
};

const categoryIcons: Record<string, string> = {
  cultural: '🎭',
  adventure: '🏔️',
  relaxation: '🏖️',
  nature: '🌿',
  urban: '🏙️',
  historical: '🏛️'
};

export function AIRecommendationsCard({
  recommendations,
  budgetEstimate,
  durationRecommendation,
  completionAnalysis,
  travelTips,
  isLoading,
  onSelectArea,
  aiPowered = false,
  aiInsights = null
}: AIRecommendationsCardProps) {
  const [showAllAreas, setShowAllAreas] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  if (isLoading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            {aiPowered ? 'Gemini AI Analyzing...' : 'AI Analyzing...'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  const visibleAreas = showAllAreas ? recommendations : recommendations.slice(0, 2);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Travel Insights
          </CardTitle>
          {aiPowered && (
            <Badge variant="outline" className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30 text-blue-600">
              <Zap className="h-3 w-3 mr-1" />
              Gemini AI
            </Badge>
          )}
        </div>
        <CardDescription>
          {aiPowered 
            ? `Real-time insights for ${aiInsights?.destination || 'your destination'}`
            : 'Smart recommendations powered by AI'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Overview (when powered by Gemini) */}
        {aiPowered && aiInsights && (
          <div className="p-3 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg border border-blue-500/20">
            <div className="flex items-start gap-2">
              <Globe className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">{aiInsights.destination}, {aiInsights.country}</p>
                <p className="text-xs text-muted-foreground mt-1">{aiInsights.overview}</p>
              </div>
            </div>
            {aiInsights.weatherInfo && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                🌤️ {aiInsights.weatherInfo}
              </p>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          {durationRecommendation && (
            <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Recommended</p>
                <p className="font-semibold">{durationRecommendation.recommended} days</p>
              </div>
            </div>
          )}
          {budgetEstimate && (
            <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Est. Budget</p>
                <p className="font-semibold">
                  {budgetEstimate.min.toLocaleString()} - {budgetEstimate.max.toLocaleString()} {budgetEstimate.currency}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Safety & Visa Info (Gemini only) */}
        {aiPowered && aiInsights && (aiInsights.safetyInfo || aiInsights.visaInfo) && (
          <Collapsible open={showMoreInfo} onOpenChange={setShowMoreInfo}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between text-xs">
                <span className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Safety & Visa Info
                </span>
                {showMoreInfo ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {aiInsights.safetyInfo && (
                <p className="text-xs text-muted-foreground p-2 bg-amber-500/5 border border-amber-500/20 rounded">
                  <span className="font-medium">🛡️ Safety:</span> {aiInsights.safetyInfo}
                </p>
              )}
              {aiInsights.visaInfo && (
                <p className="text-xs text-muted-foreground p-2 bg-blue-500/5 border border-blue-500/20 rounded">
                  <span className="font-medium">📋 Visa:</span> {aiInsights.visaInfo}
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Completion Analysis */}
        {completionAnalysis && (
          <CompletionAnalysisSection analysis={completionAnalysis} />
        )}

        {/* Recommended Areas */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Recommended Areas
          </h4>
          <div className="space-y-2">
            {visibleAreas.map((area, index) => (
              <AreaCard
                key={index}
                area={area}
                onSelect={onSelectArea}
              />
            ))}
          </div>
          {recommendations.length > 2 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setShowAllAreas(!showAllAreas)}
            >
              {showAllAreas ? (
                <>Show Less <ChevronUp className="ml-1 h-4 w-4" /></>
              ) : (
                <>Show {recommendations.length - 2} More Areas <ChevronDown className="ml-1 h-4 w-4" /></>
              )}
            </Button>
          )}
        </div>

        {/* Travel Tips */}
        {travelTips.length > 0 && (
          <Collapsible open={showTips} onOpenChange={setShowTips}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Smart Travel Tips ({travelTips.length})
                </span>
                {showTips ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                <ul className="space-y-2">
                  {travelTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}

function AreaCard({
  area,
  onSelect
}: {
  area: DestinationRecommendation;
  onSelect?: (area: DestinationRecommendation) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cn(
        "p-3 bg-background rounded-lg border transition-all",
        onSelect && "cursor-pointer hover:border-primary/50"
      )}
      onClick={() => onSelect?.(area)}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span>{categoryIcons[area.category]}</span>
            <h5 className="font-medium">{area.area}</h5>
            <Badge variant="outline" className={cn("text-xs", categoryColors[area.category])}>
              {area.category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{area.description}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t space-y-3">
          <div className="flex flex-wrap gap-1">
            {area.highlights.map((highlight, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {highlight}
              </Badge>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {area.estimatedDays.min}-{area.estimatedDays.max} days
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              {area.estimatedBudget.min}-{area.estimatedBudget.max} {area.estimatedBudget.currency}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Best time: </span>
            {area.bestTimeToVisit.slice(0, 3).join(', ')}
          </div>
        </div>
      )}
    </div>
  );
}

function CompletionAnalysisSection({ analysis }: { analysis: TripCompletionAnalysis }) {
  const scoreColor = analysis.overallScore >= 75 ? 'text-green-600' :
    analysis.overallScore >= 50 ? 'text-yellow-600' : 'text-red-600';
  
  const scoreLabel = analysis.overallScore >= 75 ? 'Highly Achievable' :
    analysis.overallScore >= 50 ? 'Moderately Achievable' : 'May Need Adjustments';

  return (
    <div className="p-4 bg-background rounded-lg border space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h4 className="font-medium">Trip Completion Score</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-2xl font-bold", scoreColor)}>
            {analysis.overallScore}%
          </span>
          <Badge
            variant="outline"
            className={cn(
              analysis.confidence === 'high' ? 'border-green-500 text-green-600' :
              analysis.confidence === 'medium' ? 'border-yellow-500 text-yellow-600' :
              'border-red-500 text-red-600'
            )}
          >
            {analysis.confidence} confidence
          </Badge>
        </div>
      </div>

      <p className={cn("text-sm font-medium", scoreColor)}>{scoreLabel}</p>

      <div className="grid grid-cols-2 gap-3">
        <ScoreBar label="Budget" score={analysis.breakdown.budgetScore} icon={DollarSign} />
        <ScoreBar label="Time" score={analysis.breakdown.timeScore} icon={Clock} />
        <ScoreBar label="Activities" score={analysis.breakdown.activityScore} icon={Calendar} />
        <ScoreBar label="Season" score={analysis.breakdown.seasonScore} icon={TrendingUp} />
      </div>

      {(analysis.suggestions.length > 0 || analysis.risks.length > 0) && (
        <div className="space-y-2 pt-2 border-t">
          {analysis.suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-2 text-sm">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>{suggestion}</span>
            </div>
          ))}
          {analysis.risks.map((risk, index) => (
            <div key={index} className="flex items-start gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{risk}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreBar({
  label,
  score,
  icon: Icon
}: {
  label: string;
  score: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const color = score >= 75 ? 'bg-green-500' :
    score >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Icon className="h-3 w-3" />
          {label}
        </span>
        <span className="font-medium">{score}%</span>
      </div>
      <Progress value={score} className="h-1.5" />
    </div>
  );
}

// Budget Suggestion Component
interface BudgetSuggestionProps {
  budgetEstimate: {
    min: number;
    max: number;
    currency: string;
    perDay: { min: number; max: number };
  } | null;
  currentBudget: number;
  onSuggestedBudgetClick?: (budget: number) => void;
}

export function BudgetSuggestion({
  budgetEstimate,
  currentBudget,
  onSuggestedBudgetClick
}: BudgetSuggestionProps) {
  if (!budgetEstimate) return null;

  const isUnder = currentBudget < budgetEstimate.min;
  const isOver = currentBudget > budgetEstimate.max;
  const isGood = currentBudget >= budgetEstimate.min && currentBudget <= budgetEstimate.max;

  return (
    <div className={cn(
      "p-3 rounded-lg border text-sm",
      isUnder && "bg-red-500/5 border-red-500/20",
      isOver && "bg-blue-500/5 border-blue-500/20",
      isGood && "bg-green-500/5 border-green-500/20",
      !currentBudget && "bg-muted/50"
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-medium">AI Budget Suggestion</span>
      </div>
      <p className="text-muted-foreground mb-2">
        Recommended: {budgetEstimate.min.toLocaleString()} - {budgetEstimate.max.toLocaleString()} {budgetEstimate.currency}
        <br />
        <span className="text-xs">
          (~{budgetEstimate.perDay.min}-{budgetEstimate.perDay.max} {budgetEstimate.currency}/day)
        </span>
      </p>
      {isUnder && (
        <p className="text-red-600 text-xs flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Budget may be insufficient for comfortable travel
        </p>
      )}
      {isGood && (
        <p className="text-green-600 text-xs flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Your budget looks good for this trip!
        </p>
      )}
      {!currentBudget && onSuggestedBudgetClick && (
        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSuggestedBudgetClick(budgetEstimate.min)}
          >
            Use Min ({budgetEstimate.min.toLocaleString()})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSuggestedBudgetClick(Math.round((budgetEstimate.min + budgetEstimate.max) / 2))}
          >
            Use Avg
          </Button>
        </div>
      )}
    </div>
  );
}

// Duration Suggestion Component
interface DurationSuggestionProps {
  durationRecommendation: {
    minimum: number;
    recommended: number;
    ideal: number;
  } | null;
  currentDays: number;
  onSuggestedDurationClick?: (days: number) => void;
}

export function DurationSuggestion({
  durationRecommendation,
  currentDays,
  onSuggestedDurationClick
}: DurationSuggestionProps) {
  if (!durationRecommendation) return null;

  const isTooShort = currentDays < durationRecommendation.minimum;
  const isGood = currentDays >= durationRecommendation.minimum && currentDays <= durationRecommendation.ideal;

  return (
    <div className={cn(
      "p-3 rounded-lg border text-sm",
      isTooShort && "bg-amber-500/5 border-amber-500/20",
      isGood && "bg-green-500/5 border-green-500/20",
      !currentDays && "bg-muted/50"
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-medium">AI Duration Suggestion</span>
      </div>
      <p className="text-muted-foreground mb-1">
        Minimum: {durationRecommendation.minimum} days | 
        Recommended: {durationRecommendation.recommended} days | 
        Ideal: {durationRecommendation.ideal} days
      </p>
      {isTooShort && currentDays > 0 && (
        <p className="text-amber-600 text-xs flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Consider extending your trip for a better experience
        </p>
      )}
      {isGood && (
        <p className="text-green-600 text-xs flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Great trip duration!
        </p>
      )}
      {!currentDays && onSuggestedDurationClick && (
        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSuggestedDurationClick(durationRecommendation.minimum)}
          >
            Min ({durationRecommendation.minimum}d)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSuggestedDurationClick(durationRecommendation.recommended)}
          >
            Recommended ({durationRecommendation.recommended}d)
          </Button>
        </div>
      )}
    </div>
  );
}
