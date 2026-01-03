/**
 * Trip Possibility Calculator
 * Calculates how realistic and feasible a planned trip is (0-100%)
 */

export interface TripDay {
  date: string;
  activities: Activity[];
  cityId?: string;
  cityName?: string;
  totalCost: number;
  totalDuration: number; // in hours
}

export interface Activity {
  id: string;
  name: string;
  category: 'sightseeing' | 'food' | 'shopping' | 'adventure' | 'culture' | 'relaxation' | 'transport' | 'other';
  duration: number; // in hours
  cost: number;
  priority: 'high' | 'medium' | 'low';
  isOptional?: boolean;
}

export interface TripData {
  totalBudget: number;
  totalDays: number;
  cities: string[];
  days: TripDay[];
  currency?: string;
}

export interface PossibilityBreakdown {
  budgetScore: number;
  budgetPenalty: number;
  budgetDetails: string[];
  
  activityScore: number;
  activityPenalty: number;
  activityDetails: string[];
  
  timeScore: number;
  timePenalty: number;
  timeDetails: string[];
  
  travelFlowScore: number;
  travelFlowPenalty: number;
  travelFlowDetails: string[];
  
  durationScore: number;
  durationPenalty: number;
  durationDetails: string[];
}

export interface TripPossibilityResult {
  percentage: number;
  status: 'excellent' | 'good' | 'moderate' | 'risky';
  statusLabel: string;
  statusColor: string;
  breakdown: PossibilityBreakdown;
  issues: TripIssue[];
  suggestions: string[];
}

export interface TripIssue {
  type: 'budget' | 'overload' | 'time' | 'travel' | 'duration';
  severity: 'critical' | 'warning' | 'info';
  dayIndex?: number;
  message: string;
  impact: number; // penalty points
}

// Maximum points per category
const MAX_SCORES = {
  budget: 30,
  activity: 25,
  time: 20,
  travelFlow: 15,
  duration: 10,
};

/**
 * Calculate Budget Feasibility Score (30 points max)
 */
function calculateBudgetScore(tripData: TripData): { score: number; penalty: number; details: string[]; issues: TripIssue[] } {
  const details: string[] = [];
  const issues: TripIssue[] = [];
  let penalty = 0;

  const totalSpent = tripData.days.reduce((sum, day) => sum + day.totalCost, 0);
  const budgetDiff = totalSpent - tripData.totalBudget;
  const budgetPercentOver = (budgetDiff / tripData.totalBudget) * 100;

  if (budgetDiff <= 0) {
    details.push('✓ Trip is within budget');
  } else if (budgetPercentOver <= 10) {
    penalty = 5;
    details.push(`⚠ Slightly over budget by ${budgetPercentOver.toFixed(1)}%`);
    issues.push({
      type: 'budget',
      severity: 'warning',
      message: `Trip is ${budgetPercentOver.toFixed(1)}% over budget (₹${budgetDiff.toLocaleString()} extra)`,
      impact: 5,
    });
  } else if (budgetPercentOver <= 25) {
    penalty = 15;
    details.push(`⚠ Over budget by ${budgetPercentOver.toFixed(1)}%`);
    issues.push({
      type: 'budget',
      severity: 'warning',
      message: `Trip is ${budgetPercentOver.toFixed(1)}% over budget (₹${budgetDiff.toLocaleString()} extra)`,
      impact: 15,
    });
  } else {
    penalty = 30;
    details.push(`✗ Significantly over budget by ${budgetPercentOver.toFixed(1)}%`);
    issues.push({
      type: 'budget',
      severity: 'critical',
      message: `Trip is ${budgetPercentOver.toFixed(1)}% over budget (₹${budgetDiff.toLocaleString()} extra)`,
      impact: 30,
    });
  }

  // Check for unbalanced daily spending
  const avgDailySpend = totalSpent / tripData.totalDays;
  const highSpendDays = tripData.days.filter(day => day.totalCost > avgDailySpend * 1.5);
  if (highSpendDays.length > 0) {
    details.push(`⚠ ${highSpendDays.length} day(s) have unusually high spending`);
  }

  return {
    score: MAX_SCORES.budget - penalty,
    penalty,
    details,
    issues,
  };
}

/**
 * Calculate Daily Activity Load Score (25 points max)
 */
function calculateActivityScore(tripData: TripData): { score: number; penalty: number; details: string[]; issues: TripIssue[] } {
  const details: string[] = [];
  const issues: TripIssue[] = [];
  let penalty = 0;

  let overloadedDays = 0;
  let heavyOverloadDays = 0;

  tripData.days.forEach((day, index) => {
    const activityCount = day.activities.length;
    
    if (activityCount > 6) {
      heavyOverloadDays++;
      issues.push({
        type: 'overload',
        severity: 'critical',
        dayIndex: index,
        message: `Day ${index + 1} is heavily overloaded with ${activityCount} activities`,
        impact: 10,
      });
    } else if (activityCount > 4) {
      overloadedDays++;
      issues.push({
        type: 'overload',
        severity: 'warning',
        dayIndex: index,
        message: `Day ${index + 1} has ${activityCount} activities (recommended: 4 or less)`,
        impact: 5,
      });
    }
  });

  if (overloadedDays === 0 && heavyOverloadDays === 0) {
    details.push('✓ All days have balanced activity count');
  } else {
    if (heavyOverloadDays > 0) {
      penalty += heavyOverloadDays * 10;
      details.push(`✗ ${heavyOverloadDays} day(s) are heavily overloaded (>6 activities)`);
    }
    if (overloadedDays > 0) {
      penalty += overloadedDays * 5;
      details.push(`⚠ ${overloadedDays} day(s) are slightly overloaded (5-6 activities)`);
    }
    if (overloadedDays + heavyOverloadDays > 2) {
      penalty += 5; // Extra penalty for multiple overloaded days
      details.push(`⚠ Multiple overloaded days detected`);
    }
  }

  penalty = Math.min(penalty, MAX_SCORES.activity);

  return {
    score: MAX_SCORES.activity - penalty,
    penalty,
    details,
    issues,
  };
}

/**
 * Calculate Time Realism Score (20 points max)
 */
function calculateTimeScore(tripData: TripData): { score: number; penalty: number; details: string[]; issues: TripIssue[] } {
  const details: string[] = [];
  const issues: TripIssue[] = [];
  let penalty = 0;

  const MAX_DAILY_HOURS = 10;
  let longDays = 0;
  let hasRestDay = false;

  tripData.days.forEach((day, index) => {
    // Check if any day is a rest day (< 3 hours of activities)
    if (day.totalDuration < 3) {
      hasRestDay = true;
    }

    // Check for overly long days
    if (day.totalDuration > MAX_DAILY_HOURS) {
      longDays++;
      issues.push({
        type: 'time',
        severity: 'warning',
        dayIndex: index,
        message: `Day ${index + 1} has ${day.totalDuration}+ hours of activities`,
        impact: 5,
      });
    }
  });

  if (longDays > 0) {
    penalty += longDays * 5;
    details.push(`⚠ ${longDays} day(s) exceed ${MAX_DAILY_HOURS} hours of activities`);
  } else {
    details.push('✓ Daily schedules have reasonable duration');
  }

  // Check for rest days in longer trips
  if (tripData.totalDays > 4 && !hasRestDay) {
    penalty += 10;
    details.push('⚠ No rest/light day in a trip longer than 4 days');
    issues.push({
      type: 'time',
      severity: 'warning',
      message: 'Consider adding a rest day for trips longer than 4 days',
      impact: 10,
    });
  } else if (tripData.totalDays > 4 && hasRestDay) {
    details.push('✓ Trip includes rest/light days');
  }

  penalty = Math.min(penalty, MAX_SCORES.time);

  return {
    score: MAX_SCORES.time - penalty,
    penalty,
    details,
    issues,
  };
}

/**
 * Calculate Travel Flow Consistency Score (15 points max)
 */
function calculateTravelFlowScore(tripData: TripData): { score: number; penalty: number; details: string[]; issues: TripIssue[] } {
  const details: string[] = [];
  const issues: TripIssue[] = [];
  let penalty = 0;

  // Check for city switching without buffer
  let citySwitches = 0;
  let citySwitchesWithoutBuffer = 0;

  for (let i = 1; i < tripData.days.length; i++) {
    const prevCity = tripData.days[i - 1].cityId;
    const currCity = tripData.days[i].cityId;
    
    if (prevCity && currCity && prevCity !== currCity) {
      citySwitches++;
      
      // Check if previous day had light schedule (buffer)
      const prevDayActivities = tripData.days[i - 1].activities.length;
      if (prevDayActivities > 3) {
        citySwitchesWithoutBuffer++;
        issues.push({
          type: 'travel',
          severity: 'warning',
          dayIndex: i,
          message: `City change on Day ${i + 1} without buffer time on Day ${i}`,
          impact: 5,
        });
      }
    }
  }

  if (citySwitchesWithoutBuffer > 0) {
    penalty += citySwitchesWithoutBuffer * 5;
    details.push(`⚠ ${citySwitchesWithoutBuffer} city change(s) without buffer day`);
  } else if (citySwitches > 0) {
    details.push('✓ City changes have appropriate buffer time');
  } else {
    details.push('✓ Single destination - no travel flow issues');
  }

  // Check for too many cities
  if (tripData.cities.length > tripData.totalDays / 2) {
    penalty += 5;
    details.push('⚠ Too many cities for trip duration');
    issues.push({
      type: 'travel',
      severity: 'warning',
      message: `${tripData.cities.length} cities in ${tripData.totalDays} days may be rushed`,
      impact: 5,
    });
  }

  penalty = Math.min(penalty, MAX_SCORES.travelFlow);

  return {
    score: MAX_SCORES.travelFlow - penalty,
    penalty,
    details,
    issues,
  };
}

/**
 * Calculate Trip Duration Balance Score (10 points max)
 */
function calculateDurationScore(tripData: TripData): { score: number; penalty: number; details: string[]; issues: TripIssue[] } {
  const details: string[] = [];
  const issues: TripIssue[] = [];
  let penalty = 0;

  const daysPerCity = tripData.totalDays / tripData.cities.length;

  if (daysPerCity < 2) {
    penalty = 10;
    details.push(`✗ Only ${daysPerCity.toFixed(1)} days per city (recommended: 2+)`);
    issues.push({
      type: 'duration',
      severity: 'critical',
      message: `Less than 2 days per city makes the trip rushed`,
      impact: 10,
    });
  } else if (daysPerCity < 2.5) {
    penalty = 5;
    details.push(`⚠ ${daysPerCity.toFixed(1)} days per city - slightly tight`);
    issues.push({
      type: 'duration',
      severity: 'warning',
      message: `Consider extending trip or reducing cities`,
      impact: 5,
    });
  } else {
    details.push(`✓ ${daysPerCity.toFixed(1)} days per city - well balanced`);
  }

  return {
    score: MAX_SCORES.duration - penalty,
    penalty,
    details,
    issues,
  };
}

/**
 * Main function to calculate Trip Possibility Percentage
 */
export function calculateTripPossibility(tripData: TripData): TripPossibilityResult {
  // Handle edge cases
  if (!tripData.days || tripData.days.length === 0) {
    return {
      percentage: 100,
      status: 'excellent',
      statusLabel: 'Ready to plan',
      statusColor: 'success',
      breakdown: {
        budgetScore: MAX_SCORES.budget,
        budgetPenalty: 0,
        budgetDetails: ['No budget data yet'],
        activityScore: MAX_SCORES.activity,
        activityPenalty: 0,
        activityDetails: ['No activities planned yet'],
        timeScore: MAX_SCORES.time,
        timePenalty: 0,
        timeDetails: ['No schedule set'],
        travelFlowScore: MAX_SCORES.travelFlow,
        travelFlowPenalty: 0,
        travelFlowDetails: ['No cities selected'],
        durationScore: MAX_SCORES.duration,
        durationPenalty: 0,
        durationDetails: ['No duration set'],
      },
      issues: [],
      suggestions: ['Start adding activities to your trip!'],
    };
  }

  // Calculate all scores
  const budgetResult = calculateBudgetScore(tripData);
  const activityResult = calculateActivityScore(tripData);
  const timeResult = calculateTimeScore(tripData);
  const travelFlowResult = calculateTravelFlowScore(tripData);
  const durationResult = calculateDurationScore(tripData);

  // Combine all issues
  const allIssues = [
    ...budgetResult.issues,
    ...activityResult.issues,
    ...timeResult.issues,
    ...travelFlowResult.issues,
    ...durationResult.issues,
  ];

  // Calculate total percentage
  const totalScore = 
    budgetResult.score +
    activityResult.score +
    timeResult.score +
    travelFlowResult.score +
    durationResult.score;

  const percentage = Math.max(0, Math.min(100, totalScore));

  // Determine status
  let status: TripPossibilityResult['status'];
  let statusLabel: string;
  let statusColor: string;

  if (percentage >= 85) {
    status = 'excellent';
    statusLabel = 'Highly Feasible';
    statusColor = 'success';
  } else if (percentage >= 70) {
    status = 'good';
    statusLabel = 'Good Plan';
    statusColor = 'primary';
  } else if (percentage >= 55) {
    status = 'moderate';
    statusLabel = 'Needs Adjustments';
    statusColor = 'warning';
  } else {
    status = 'risky';
    statusLabel = 'Risky Plan';
    statusColor = 'destructive';
  }

  // Generate suggestions based on issues
  const suggestions = generateSuggestions(allIssues, tripData);

  return {
    percentage,
    status,
    statusLabel,
    statusColor,
    breakdown: {
      budgetScore: budgetResult.score,
      budgetPenalty: budgetResult.penalty,
      budgetDetails: budgetResult.details,
      activityScore: activityResult.score,
      activityPenalty: activityResult.penalty,
      activityDetails: activityResult.details,
      timeScore: timeResult.score,
      timePenalty: timeResult.penalty,
      timeDetails: timeResult.details,
      travelFlowScore: travelFlowResult.score,
      travelFlowPenalty: travelFlowResult.penalty,
      travelFlowDetails: travelFlowResult.details,
      durationScore: durationResult.score,
      durationPenalty: durationResult.penalty,
      durationDetails: durationResult.details,
    },
    issues: allIssues,
    suggestions,
  };
}

/**
 * Generate actionable suggestions based on issues
 */
function generateSuggestions(issues: TripIssue[], tripData: TripData): string[] {
  const suggestions: string[] = [];
  const issueTypes = new Set(issues.map(i => i.type));

  if (issueTypes.has('budget')) {
    const totalSpent = tripData.days.reduce((sum, day) => sum + day.totalCost, 0);
    const diff = totalSpent - tripData.totalBudget;
    suggestions.push(`Reduce daily spending by ₹${Math.ceil(diff / tripData.totalDays).toLocaleString()} on average`);
  }

  if (issueTypes.has('overload')) {
    const overloadedDays = issues.filter(i => i.type === 'overload' && i.dayIndex !== undefined);
    if (overloadedDays.length > 0) {
      const dayNum = (overloadedDays[0].dayIndex || 0) + 1;
      suggestions.push(`Move 1-2 activities from Day ${dayNum} to a lighter day`);
    }
  }

  if (issueTypes.has('time')) {
    suggestions.push('Add a rest evening or free half-day');
  }

  if (issueTypes.has('travel')) {
    suggestions.push('Add buffer time before city changes');
  }

  if (issueTypes.has('duration')) {
    suggestions.push('Consider visiting fewer cities or extending trip duration');
  }

  return suggestions;
}

/**
 * Create sample/mock trip data for demo purposes
 */
export function createSampleTripData(options: {
  days: number;
  cities: number;
  budget: number;
  overloaded?: boolean;
  overBudget?: boolean;
}): TripData {
  const { days, cities, budget, overloaded = false, overBudget = false } = options;
  
  const cityNames = ['Paris', 'Rome', 'Barcelona', 'Amsterdam', 'Prague', 'Vienna'];
  const selectedCities = cityNames.slice(0, cities);
  
  const tripDays: TripDay[] = [];
  const budgetPerDay = overBudget ? (budget / days) * 1.3 : budget / days;
  
  for (let i = 0; i < days; i++) {
    const cityIndex = Math.floor(i / (days / cities));
    const activityCount = overloaded && i < 3 ? 7 : Math.floor(Math.random() * 3) + 2;
    
    const activities: Activity[] = [];
    for (let j = 0; j < activityCount; j++) {
      activities.push({
        id: `act-${i}-${j}`,
        name: `Activity ${j + 1}`,
        category: 'sightseeing',
        duration: 2,
        cost: budgetPerDay / activityCount,
        priority: j < 2 ? 'high' : j < 4 ? 'medium' : 'low',
        isOptional: j >= 4,
      });
    }
    
    tripDays.push({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      activities,
      cityId: `city-${cityIndex}`,
      cityName: selectedCities[cityIndex] || selectedCities[0],
      totalCost: activities.reduce((sum, a) => sum + a.cost, 0),
      totalDuration: activities.reduce((sum, a) => sum + a.duration, 0),
    });
  }
  
  return {
    totalBudget: budget,
    totalDays: days,
    cities: selectedCities,
    days: tripDays,
    currency: 'INR',
  };
}
