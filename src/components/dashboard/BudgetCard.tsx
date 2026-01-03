import { TrendingUp, TrendingDown } from "lucide-react";

interface BudgetCardProps {
  totalBudget: number;
  spent: number;
  categories: {
    name: string;
    amount: number;
    color: string;
  }[];
}

export function BudgetCard({ totalBudget, spent, categories }: BudgetCardProps) {
  const remaining = totalBudget - spent;
  // Prevent division by zero and NaN
  const percentage = totalBudget > 0 ? Math.round((spent / totalBudget) * 100) : 0;
  const isOverBudget = remaining < 0;

  // Calculate the circumference and offset for the progress ring
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset =
    totalBudget > 0
      ? circumference - (Math.min(percentage, 100) / 100) * circumference
      : circumference; // Show empty ring when no budget

  return (
    <div className="card-3d p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg">Budget Overview</h3>
        <div
          className={`flex items-center gap-1 text-sm ${
            isOverBudget ? "text-destructive" : "text-success"
          }`}
        >
          {isOverBudget ? (
            <TrendingDown className="h-4 w-4" />
          ) : (
            <TrendingUp className="h-4 w-4" />
          )}
          <span>{isOverBudget ? "Over budget" : "On track"}</span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        {/* Progress Ring */}
        <div className="relative">
          <svg className="progress-ring w-40 h-40" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="12"
            />
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={
                isOverBudget
                  ? "hsl(var(--destructive))"
                  : "hsl(var(--primary))"
              }
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="progress-ring-circle"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold">
              {totalBudget > 0 ? `${percentage}%` : "-"}
            </span>
            <span className="text-xs text-muted-foreground">
              {totalBudget > 0 ? "Used" : "No budget"}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
            <p className="text-2xl font-semibold">
              ₹{totalBudget.toLocaleString()}
            </p>
          </div>
          <div className="flex gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Spent</p>
              <p className="text-lg font-medium text-foreground">
                ₹{spent.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Remaining</p>
              <p
                className={`text-lg font-medium ${
                  isOverBudget ? "text-destructive" : "text-success"
                }`}
              >
                ₹{Math.abs(remaining).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-sm font-medium mb-3">Spending by Category</p>
        <div className="space-y-3">
          {categories.map((category) => {
            const catPercentage =
              spent > 0
                ? Math.round((category.amount / spent) * 100)
                : 0;

            return (
              <div key={category.name} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm text-muted-foreground flex-1">
                  {category.name}
                </span>
                <span className="text-sm font-medium">
                  ₹{category.amount.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {catPercentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
