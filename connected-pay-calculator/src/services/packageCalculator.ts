import { fetchGSARate } from './gsaService';

interface ContractDetails {
  billRate: number;
  hoursPerWeek: number;
  durationWeeks: number;
  hasBenefits: boolean;
  city: string;
  state: string;
  zipCode?: string;
  month: string;
  year: string;
}

interface PayPackageScenario {
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
}

interface PayPackageResult {
  scenarios: PayPackageScenario[];
  stateMinimumWage: number; // We'll need to maintain a map of state minimum wages
}

class PayPackageCalculator {
  private readonly MARGIN_SCENARIOS = [0.33, 0.30, 0.25];
  private readonly OVERTIME_MULTIPLIER = 1.5;
  
  // This would need to be maintained/updated regularly
  private readonly STATE_MINIMUM_WAGES: Record<string, number> = {
    // Example minimum wages - we'd need the complete list
    'CA': 15.50,
    'NY': 14.20,
    // ... other states
  };

  private async getGSARate(details: ContractDetails): Promise<number> {
    try {
      const gsaRates = await fetchGSARate(
        details.city,
        details.state,
        details.zipCode,
        details.month,
        details.year
      );
      
      // Return the total daily rate (lodging + meals)
      return gsaRates.lodging + gsaRates.meals;
    } catch (error) {
      console.error('Error getting GSA rate:', error);
      return 96; // Return standard rate if there's an error
    }
  }

  async calculatePackages(details: ContractDetails): Promise<PayPackageResult> {
    const stateMinWage = this.STATE_MINIMUM_WAGES[details.state.toUpperCase()] || 7.25;
    
    // Get GSA rate
    const dailyGSARate = await this.getGSARate(details);
    const weeklyStipend = dailyGSARate * 7; // Weekly stipend based on daily GSA rate

    const scenarios = this.MARGIN_SCENARIOS.map(margin => {
      // Weekly calculations
      const weeklyGrossPay = details.billRate * (1 - margin) * details.hoursPerWeek;
      
      // Initial stipend calculation
      let weeklyTaxablePay = weeklyGrossPay - weeklyStipend;
      let actualWeeklyStipend = weeklyStipend;

      // Check if taxable rate meets minimum wage
      const taxableHourlyRate = weeklyTaxablePay / details.hoursPerWeek;
      if (taxableHourlyRate < stateMinWage) {
        // Recalculate to ensure minimum wage compliance
        weeklyTaxablePay = stateMinWage * details.hoursPerWeek;
        actualWeeklyStipend = weeklyGrossPay - weeklyTaxablePay;
      }

      return this.createScenario(
        margin,
        details,
        weeklyTaxablePay,
        actualWeeklyStipend
      );
    });

    return {
      scenarios,
      stateMinimumWage: stateMinWage
    };
  }

  private createScenario(
    margin: number,
    details: ContractDetails,
    weeklyTaxablePay: number,
    weeklyStipendPay: number
  ): PayPackageScenario {
    const weeklyGrossPay = weeklyTaxablePay + weeklyStipendPay;
    const blendedHourlyRate = weeklyGrossPay / details.hoursPerWeek;
    const taxableHourlyRate = weeklyTaxablePay / details.hoursPerWeek;
    const stipendHourlyRate = weeklyStipendPay / details.hoursPerWeek;

    return {
      grossMarginPercent: margin * 100,
      weekly: {
        grossPay: weeklyGrossPay,
        taxablePay: weeklyTaxablePay,
        stipendPay: weeklyStipendPay
      },
      hourly: {
        blendedRate: blendedHourlyRate,
        taxableRate: taxableHourlyRate,
        stipendRate: stipendHourlyRate,
        overtimeRate: blendedHourlyRate * this.OVERTIME_MULTIPLIER
      },
      total: {
        contractRevenue: details.billRate * details.hoursPerWeek * details.durationWeeks,
        contractGrossPay: weeklyGrossPay * details.durationWeeks,
        grossPay: weeklyGrossPay * details.durationWeeks,
        taxablePay: weeklyTaxablePay * details.durationWeeks,
        stipendPay: weeklyStipendPay * details.durationWeeks
      }
    };
  }

  private calculateStipend(details: ContractDetails): number {
    // We need to implement GSA rate lookup based on location
    // This would involve either an API call or a data table lookup
    // For now, returning a placeholder
    return 0; // This needs to be implemented
  }
}

export const packageCalculator = new PayPackageCalculator(); 