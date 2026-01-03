import { IndianRupee, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface BudgetCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon?: React.ReactNode;
}

interface BudgetVisualizationProps {
  totalBudget: number;
  spent: number;
  categories: BudgetCategory[];
  showAlert?: boolean;
}

export function BudgetVisualization({
  totalBudget,
  spent,
  categories,
  showAlert = false,
}: BudgetVisualizationProps) {
  const remaining = totalBudget - spent;
  const percentageUsed = (spent / totalBudget) * 100;
  const isOverBudget = spent > totalBudget;

  return (
    <Card className="card-3d p-6 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-success/5 via-transparent to-primary/5 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <IndianRupee className="h-5 w-5 text-success" />
            </div>
            Budget Overview
          </h3>
          {isOverBudget && showAlert && (
            <Badge className="bg-destructive/10 text-destructive border-destructive/20">
              <AlertCircle className="h-3 w-3 mr-1" />
              Over Budget
            </Badge>
          )}
        </div>
      </div>

      {/* Main Budget Display */}
      <div className="relative z-10 grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors">
          <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
          <p className="text-2xl font-bold text-foreground">
            ₹{totalBudget.toLocaleString()}
          </p>
        </div>
        
        <div className="text-center p-4 rounded-xl bg-destructive/10 hover:bg-destructive/15 transition-colors">
          <p className="text-xs text-muted-foreground mb-1">Spent</p>
          <p className="text-2xl font-bold text-destructive flex items-center justify-center gap-1">
            ₹{spent.toLocaleString()}
            <TrendingUp className="h-4 w-4" />
          </p>
        </div>
        
        <div className={`text-center p-4 rounded-xl ${isOverBudget ? 'bg-destructive/10' : 'bg-success/10'} hover:opacity-80 transition-opacity`}>
          <p className="text-xs text-muted-foreground mb-1">Remaining</p>
          <p className={`text-2xl font-bold flex items-center justify-center gap-1 ${isOverBudget ? 'text-destructive' : 'text-success'}`}>
            ₹{Math.abs(remaining).toLocaleString()}
            {isOverBudget ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">Budget Usage</span>
          <span className={`text-sm font-semibold ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
            {percentageUsed.toFixed(1)}%
          </span>
        </div>
        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverBudget ? 'bg-destructive' : 'bg-gradient-to-r from-success to-primary'
            }`}
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          />
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="relative z-10">
        <h4 className="text-sm font-semibold mb-3 text-foreground">Category Breakdown</h4>
        <div className="space-y-3">
          {categories.map((category, index) => (
            <div
              key={category.name}
              className="group flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-300 hover:-translate-y-0.5"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-semibold shadow-md"
                  style={{ backgroundColor: category.color }}
                >
                  {category.icon || category.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{category.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${category.percentage}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {category.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  ₹{category.amount.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
    </Card>
  );
}
