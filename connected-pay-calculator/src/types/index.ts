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
    benefitsCost: number;
    payrollTaxes: number;
    workersComp: number;
    totalMargin: number;
    weeklyMargin: number;
  };
} 