export interface PayPackageScenario {
  grossMarginPercent: number;
  weekly: {
    grossPay: number;
    taxablePay: number;
    stipendPay: number;
  };
  hourly: {
    blendedRate: number;
    taxableRate: number;
    stipendRate: number;
    overtimeRate: number;
  };
  total: {
    contractRevenue: number;
    contractGrossPay: number;
    grossPay: number;
    taxablePay: number;
    stipendPay: number;
  };
  internalBreakdown: {
    totalContractRevenue: number;
    totalContractGrossPay: number;
    totalMargin: number;
    weeklyMargin: number;
  };
  stipendBreakdown: {
    dailyLodging: number;
    dailyMeals: number;
    weeklyStipend: number;
    isStandardRate: boolean;
    isLocalContract: boolean;
  };
} 