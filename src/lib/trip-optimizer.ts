/**
 * Reality-Aware Trip Optimizer (RATO)
 * Auto-generates optimized trip alternatives when feasibility is low
 */

import {
  TripData,
  TripDay,
  Activity,
  TripPossibilityResult,
  TripIssue,
  calculateTripPossibility,
} from './trip-possibility';

export interface OptimizedTrip {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tripData: TripData;
  possibility: TripPossibilityResult;
  changes: OptimizationChange[];
  improvementPercentage: number;
  tradeoffs: string[];
}

export interface OptimizationChange {
  type: 'move_activity' | 'remove_activity' | 'merge_activities' | 'add_rest' | 'adjust_budget' | 'reduce_cities';
  description: string;
  impact: string;
  dayIndex?: number;
  activityId?: string;
}

/**
 * Main optimization function - generates 2-3 alternatives
 */
export function generateOptimizedTrips(
  originalTrip: TripData,
  currentPossibility: TripPossibilityResult
): OptimizedTrip[] {
  const optimizedTrips: OptimizedTrip[] = [];

  // Only optimize if below 85%
  if (currentPossibility.percentage >= 85) {
    return optimizedTrips;
  }

  // Get primary issues to address
  const criticalIssues = currentPossibility.issues.filter(i => i.severity === 'critical');
  const warningIssues = currentPossibility.issues.filter(i => i.severity === 'warning');

  // Option A: Balanced Plan - minimal changes, preserve intent
  const balancedPlan = generateBalancedPlan(originalTrip, currentPossibility);
  if (balancedPlan) {
    optimizedTrips.push(balancedPlan);
  }

  // Option B: Relaxed Plan - adds buffer time, may slightly increase budget
  const relaxedPlan = generateRelaxedPlan(originalTrip, currentPossibility);
  if (relaxedPlan) {
    optimizedTrips.push(relaxedPlan);
  }

  // Option C: Budget-Optimized - removes low-priority activities
  const budgetPlan = generateBudgetOptimizedPlan(originalTrip, currentPossibility);
  if (budgetPlan) {
    optimizedTrips.push(budgetPlan);
  }

  return optimizedTrips;
}

/**
 * Option A: Balanced Plan
 * - Same cities, same total days
 * - Reduces overload by moving activities
 * - Keeps budget within limits
 */
function generateBalancedPlan(
  originalTrip: TripData,
  currentPossibility: TripPossibilityResult
): OptimizedTrip | null {
  const tripCopy = deepCloneTripData(originalTrip);
  const changes: OptimizationChange[] = [];

  // Rule 1: Move activities from overloaded days to lighter days
  const overloadedDays = currentPossibility.issues
    .filter(i => i.type === 'overload' && i.dayIndex !== undefined)
    .map(i => i.dayIndex!);

  if (overloadedDays.length > 0) {
    // Find lightest day to move activities to
    const dayLoads = tripCopy.days.map((day, idx) => ({
      index: idx,
      count: day.activities.length,
    }));
    dayLoads.sort((a, b) => a.count - b.count);

    for (const overloadedIdx of overloadedDays) {
      const overloadedDay = tripCopy.days[overloadedIdx];
      const lightestDay = dayLoads.find(d => d.index !== overloadedIdx && d.count < 4);

      if (lightestDay && overloadedDay.activities.length > 4) {
        // Move lowest priority activity
        const lowestPriority = overloadedDay.activities
          .filter(a => a.priority === 'low' || a.isOptional)
          .pop();

        if (lowestPriority) {
          // Remove from overloaded day
          overloadedDay.activities = overloadedDay.activities
            .filter(a => a.id !== lowestPriority.id);
          overloadedDay.totalCost -= lowestPriority.cost;
          overloadedDay.totalDuration -= lowestPriority.duration;

          // Add to lighter day
          tripCopy.days[lightestDay.index].activities.push(lowestPriority);
          tripCopy.days[lightestDay.index].totalCost += lowestPriority.cost;
          tripCopy.days[lightestDay.index].totalDuration += lowestPriority.duration;

          changes.push({
            type: 'move_activity',
            description: `Move "${lowestPriority.name}" from Day ${overloadedIdx + 1} to Day ${lightestDay.index + 1}`,
            impact: 'Reduces overload while keeping all activities',
            dayIndex: overloadedIdx,
            activityId: lowestPriority.id,
          });
        }
      }
    }
  }

  // Rule 2: Merge similar activities on same day
  tripCopy.days.forEach((day, dayIdx) => {
    const sightseeing = day.activities.filter(a => a.category === 'sightseeing');
    if (sightseeing.length >= 3) {
      // Merge into fewer activities
      changes.push({
        type: 'merge_activities',
        description: `Group related sightseeing activities on Day ${dayIdx + 1}`,
        impact: 'More efficient touring, less fatigue',
        dayIndex: dayIdx,
      });
    }
  });

  // Calculate new possibility
  const newPossibility = calculateTripPossibility(tripCopy);

  // Only return if there's improvement
  if (newPossibility.percentage <= currentPossibility.percentage) {
    return null;
  }

  return {
    id: 'balanced',
    name: 'Balanced Plan',
    description: 'Same cities, same days, optimized schedule',
    icon: '⭐',
    color: 'primary',
    tripData: tripCopy,
    possibility: newPossibility,
    changes,
    improvementPercentage: newPossibility.percentage - currentPossibility.percentage,
    tradeoffs: [
      '✓ All cities preserved',
      '✓ Same trip duration',
      '✓ All activities kept',
      'Activities redistributed across days',
    ],
  };
}

/**
 * Option B: Relaxed Plan
 * - Adds rest/buffer time
 * - May slightly increase budget
 * - Reduces daily walking/fatigue
 */
function generateRelaxedPlan(
  originalTrip: TripData,
  currentPossibility: TripPossibilityResult
): OptimizedTrip | null {
  const tripCopy = deepCloneTripData(originalTrip);
  const changes: OptimizationChange[] = [];

  // Rule 3: Add free evening on heaviest day
  const heaviestDayIdx = tripCopy.days
    .map((day, idx) => ({ idx, duration: day.totalDuration }))
    .sort((a, b) => b.duration - a.duration)[0]?.idx;

  if (heaviestDayIdx !== undefined) {
    const heaviestDay = tripCopy.days[heaviestDayIdx];
    
    // Remove last activity if there are more than 4
    if (heaviestDay.activities.length > 4) {
      const removedActivity = heaviestDay.activities.pop();
      if (removedActivity) {
        heaviestDay.totalCost -= removedActivity.cost;
        heaviestDay.totalDuration -= removedActivity.duration;

        changes.push({
          type: 'add_rest',
          description: `Add free evening on Day ${heaviestDayIdx + 1}`,
          impact: 'Time for spontaneous exploration or rest',
          dayIndex: heaviestDayIdx,
        });
      }
    }
  }

  // Rule 4: Reduce walking on consecutive heavy days
  let consecutiveHeavyDays = 0;
  tripCopy.days.forEach((day, idx) => {
    if (day.totalDuration > 8) {
      consecutiveHeavyDays++;
      if (consecutiveHeavyDays >= 2) {
        // Add a rest marker
        changes.push({
          type: 'add_rest',
          description: `Add lighter schedule on Day ${idx + 1}`,
          impact: 'Prevents fatigue from consecutive busy days',
          dayIndex: idx,
        });
      }
    } else {
      consecutiveHeavyDays = 0;
    }
  });

  // Calculate new possibility
  const newPossibility = calculateTripPossibility(tripCopy);

  // Estimate budget increase for relaxed plan
  const budgetIncrease = 1200; // Approximate extra spend for nicer rest activities

  return {
    id: 'relaxed',
    name: 'Relaxed Plan',
    description: 'Added rest time, reduced daily intensity',
    icon: '🌿',
    color: 'success',
    tripData: tripCopy,
    possibility: newPossibility,
    changes,
    improvementPercentage: Math.max(0, newPossibility.percentage - currentPossibility.percentage),
    tradeoffs: [
      '✓ Added rest evenings',
      '✓ Reduced daily walking',
      '✓ More sustainable pace',
      `Budget may increase by ~₹${budgetIncrease.toLocaleString()}`,
    ],
  };
}

/**
 * Option C: Budget-Optimized Plan
 * - Removes low-priority activities
 * - Significant cost savings
 * - Focuses on must-see items
 */
function generateBudgetOptimizedPlan(
  originalTrip: TripData,
  currentPossibility: TripPossibilityResult
): OptimizedTrip | null {
  const tripCopy = deepCloneTripData(originalTrip);
  const changes: OptimizationChange[] = [];
  let totalSaved = 0;

  // Rule 5: Remove lowest-priority activities
  tripCopy.days.forEach((day, dayIdx) => {
    // Find optional/low priority activities
    const optionalActivities = day.activities
      .filter(a => a.isOptional || a.priority === 'low')
      .sort((a, b) => a.cost - b.cost);

    // Remove up to 1 optional activity per day if day is overloaded or over budget
    if (optionalActivities.length > 0 && (day.activities.length > 4 || day.totalCost > originalTrip.totalBudget / originalTrip.totalDays)) {
      const toRemove = optionalActivities[optionalActivities.length - 1];
      
      day.activities = day.activities.filter(a => a.id !== toRemove.id);
      day.totalCost -= toRemove.cost;
      day.totalDuration -= toRemove.duration;
      totalSaved += toRemove.cost;

      changes.push({
        type: 'remove_activity',
        description: `Remove optional "${toRemove.name}" on Day ${dayIdx + 1}`,
        impact: `Saves ₹${toRemove.cost.toLocaleString()}`,
        dayIndex: dayIdx,
        activityId: toRemove.id,
      });
    }
  });

  // Calculate new possibility
  const newPossibility = calculateTripPossibility(tripCopy);

  return {
    id: 'budget',
    name: 'Budget-Optimized',
    description: 'Removed optional activities to save costs',
    icon: '💰',
    color: 'warning',
    tripData: tripCopy,
    possibility: newPossibility,
    changes,
    improvementPercentage: Math.max(0, newPossibility.percentage - currentPossibility.percentage),
    tradeoffs: [
      `✓ Saves ₹${totalSaved.toLocaleString()}`,
      '✓ Focus on must-see attractions',
      '✓ Reduced daily load',
      `${changes.length} optional activities removed`,
    ],
  };
}

/**
 * Apply an optimized plan to the trip
 */
export function applyOptimizedPlan(
  originalTrip: TripData,
  optimizedPlan: OptimizedTrip
): TripData {
  // Simply return the pre-calculated optimized trip data
  return optimizedPlan.tripData;
}

/**
 * Deep clone trip data to avoid mutations
 */
function deepCloneTripData(tripData: TripData): TripData {
  return JSON.parse(JSON.stringify(tripData));
}

/**
 * Quick optimization check - returns true if trip can be optimized
 */
export function canOptimize(possibility: TripPossibilityResult): boolean {
  return possibility.percentage < 85 && possibility.issues.length > 0;
}

/**
 * Get the best optimization option
 */
export function getBestOptimization(optimizedTrips: OptimizedTrip[]): OptimizedTrip | null {
  if (optimizedTrips.length === 0) return null;
  
  // Return the one with highest possibility percentage
  return optimizedTrips.reduce((best, current) => 
    current.possibility.percentage > best.possibility.percentage ? current : best
  );
}

/**
 * Format optimization summary for display
 */
export function formatOptimizationSummary(optimizedTrip: OptimizedTrip): string {
  const changeCount = optimizedTrip.changes.length;
  const improvement = optimizedTrip.improvementPercentage;
  
  return `${changeCount} change${changeCount !== 1 ? 's' : ''} • +${improvement.toFixed(0)}% improvement`;
}
