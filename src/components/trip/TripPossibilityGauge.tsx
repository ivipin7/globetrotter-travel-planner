import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  IndianRupee,
  Calendar,
  MapPin,
  Clock,
  Zap
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { TripPossibilityResult, PossibilityBreakdown } from '@/lib/trip-possibility';
import { cn } from '@/lib/utils';

interface TripPossibilityGaugeProps {
  result: TripPossibilityResult;
  showDetails?: boolean;
  showBreakdown?: boolean;
  onOptimize?: () => void;
  className?: string;
}

const statusColors = {
  excellent: {
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/30',
    gradient: 'from-success/20 to-success/5',
  },
  good: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary/30',
    gradient: 'from-primary/20 to-primary/5',
  },
  moderate: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/30',
    gradient: 'from-warning/20 to-warning/5',
  },
  risky: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    border: 'border-destructive/30',
    gradient: 'from-destructive/20 to-destructive/5',
  },
};

const categoryIcons = {
  budget: IndianRupee,
  activity: Zap,
  time: Clock,
  travelFlow: MapPin,
  duration: Calendar,
};

export function TripPossibilityGauge({
  result,
  showDetails = true,
  showBreakdown = false,
  onOptimize,
  className,
}: TripPossibilityGaugeProps) {
  const [isBreakdownOpen, setIsBreakdownOpen] = React.useState(showBreakdown);
  const colors = statusColors[result.status];

  // Calculate the stroke dashoffset for the circular progress
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (result.percentage / 100) * circumference;

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex flex-col items-center">
        {/* Circular Progress Gauge */}
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/20"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={cn(
                'transition-all duration-1000 ease-out',
                result.status === 'excellent' && 'stroke-success',
                result.status === 'good' && 'stroke-primary',
                result.status === 'moderate' && 'stroke-warning',
                result.status === 'risky' && 'stroke-destructive'
              )}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('text-3xl font-bold', colors.text)}>
              {result.percentage}%
            </span>
            <span className="text-xs text-muted-foreground">Feasibility</span>
          </div>
        </div>

        {/* Status Badge */}
        <Badge 
          variant="outline" 
          className={cn('mb-3 px-4 py-1', colors.bg, colors.text, colors.border)}
        >
          {result.status === 'excellent' && <CheckCircle className="h-3 w-3 mr-1" />}
          {result.status === 'good' && <TrendingUp className="h-3 w-3 mr-1" />}
          {result.status === 'moderate' && <AlertTriangle className="h-3 w-3 mr-1" />}
          {result.status === 'risky' && <TrendingDown className="h-3 w-3 mr-1" />}
          {result.statusLabel}
        </Badge>

        {/* Quick Stats */}
        {showDetails && result.issues.length > 0 && (
          <div className="w-full mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Issues Found</span>
              <span className={cn('font-medium', colors.text)}>
                {result.issues.length}
              </span>
            </div>
            
            {/* Top Issues Preview */}
            <div className="space-y-1">
              {result.issues.slice(0, 2).map((issue, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex items-center gap-2 text-xs p-2 rounded-md',
                    issue.severity === 'critical' && 'bg-destructive/10 text-destructive',
                    issue.severity === 'warning' && 'bg-warning/10 text-warning',
                    issue.severity === 'info' && 'bg-muted text-muted-foreground'
                  )}
                >
                  {issue.severity === 'critical' && <AlertTriangle className="h-3 w-3 flex-shrink-0" />}
                  {issue.severity === 'warning' && <Info className="h-3 w-3 flex-shrink-0" />}
                  <span className="line-clamp-1">{issue.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optimize Button */}
        {onOptimize && result.percentage < 85 && (
          <Button 
            onClick={onOptimize}
            className="w-full mt-4"
            variant={result.percentage < 60 ? 'destructive' : 'default'}
          >
            <Zap className="h-4 w-4 mr-2" />
            Optimize Trip
          </Button>
        )}

        {/* Breakdown Collapsible */}
        <Collapsible 
          open={isBreakdownOpen} 
          onOpenChange={setIsBreakdownOpen}
          className="w-full mt-4"
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="text-sm">View Breakdown</span>
              <span className="text-xs text-muted-foreground">
                {isBreakdownOpen ? '▲' : '▼'}
              </span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-3">
            <ScoreBreakdownItem
              label="Budget"
              score={result.breakdown.budgetScore}
              maxScore={30}
              details={result.breakdown.budgetDetails}
              Icon={IndianRupee}
            />
            <ScoreBreakdownItem
              label="Activity Load"
              score={result.breakdown.activityScore}
              maxScore={25}
              details={result.breakdown.activityDetails}
              Icon={Zap}
            />
            <ScoreBreakdownItem
              label="Time Realism"
              score={result.breakdown.timeScore}
              maxScore={20}
              details={result.breakdown.timeDetails}
              Icon={Clock}
            />
            <ScoreBreakdownItem
              label="Travel Flow"
              score={result.breakdown.travelFlowScore}
              maxScore={15}
              details={result.breakdown.travelFlowDetails}
              Icon={MapPin}
            />
            <ScoreBreakdownItem
              label="Duration"
              score={result.breakdown.durationScore}
              maxScore={10}
              details={result.breakdown.durationDetails}
              Icon={Calendar}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
}

interface ScoreBreakdownItemProps {
  label: string;
  score: number;
  maxScore: number;
  details: string[];
  Icon: React.ComponentType<{ className?: string }>;
}

function ScoreBreakdownItem({ label, score, maxScore, details, Icon }: ScoreBreakdownItemProps) {
  const percentage = (score / maxScore) * 100;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Icon className="h-3 w-3 text-muted-foreground" />
                <span>{label}</span>
              </div>
              <span className={cn(
                'font-medium',
                percentage >= 80 && 'text-success',
                percentage >= 50 && percentage < 80 && 'text-warning',
                percentage < 50 && 'text-destructive'
              )}>
                {score}/{maxScore}
              </span>
            </div>
            <Progress 
              value={percentage} 
              className="h-1.5"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <div className="space-y-1">
            {details.map((detail, idx) => (
              <p key={idx} className="text-xs">{detail}</p>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Compact version for cards/lists
export function TripPossibilityBadge({ 
  percentage, 
  status,
  className 
}: { 
  percentage: number; 
  status: TripPossibilityResult['status'];
  className?: string;
}) {
  const colors = statusColors[status];
  
  return (
    <Badge 
      variant="outline" 
      className={cn('gap-1', colors.bg, colors.text, colors.border, className)}
    >
      {percentage}%
      {status === 'excellent' && <CheckCircle className="h-3 w-3" />}
      {status === 'moderate' && <AlertTriangle className="h-3 w-3" />}
      {status === 'risky' && <TrendingDown className="h-3 w-3" />}
    </Badge>
  );
}

// Mini inline version
export function TripPossibilityInline({ result }: { result: TripPossibilityResult }) {
  const colors = statusColors[result.status];
  
  return (
    <div className={cn('inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm', colors.bg)}>
      <div className={cn('w-2 h-2 rounded-full', 
        result.status === 'excellent' && 'bg-success',
        result.status === 'good' && 'bg-primary',
        result.status === 'moderate' && 'bg-warning',
        result.status === 'risky' && 'bg-destructive'
      )} />
      <span className={colors.text}>
        {result.percentage}% {result.statusLabel}
      </span>
    </div>
  );
}
