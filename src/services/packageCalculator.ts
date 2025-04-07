import { fetchGSARate } from './gsaService';
import { PayPackageScenario } from '../types';

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

interface PayPackageResult {
  scenarios: PayPackageScenario[];
  stateMinimumWage: number;
}

class PayPackageCalculator {
  private readonly MARGIN_SCENARIOS = [0.40, 0.35, 0.30, 0.25];
  private readonly OVERTIME_MULTIPLIER = 1.5;
  
  private readonly STATE_MINIMUM_WAGES: Record<string, number> = {
    'AL': 7.25, 'AK': 11.91, 'AZ': 13.85, 'AR': 11.00,
    'CA': 16.00, 'CO': 14.42, 'CT': 16.35, 'DE': 15.00,
    'DC': 17.50, 'FL': 13.00, 'GA': 7.25, 'HI': 14.00,
    'ID': 7.25, 'IL': 15.00, 'IN': 7.25, 'IA': 7.25,
    'KS': 7.25, 'KY': 7.25, 'LA': 7.25, 'ME': 14.65,
    'MD': 15.00, 'MA': 15.00, 'MI': 10.56, 'MN': 11.13,
    'MS': 7.25, 'MO': 13.75, 'MT': 10.55, 'NE': 13.50,
    'NV': 12.00, 'NH': 7.25, 'NJ': 15.49, 'NM': 12.00,
    'NY': 15.50, 'NC': 7.25, 'ND': 7.25, 'OH': 10.70,
    'OK': 7.25, 'OR': 14.70, 'PA': 7.25, 'RI': 15.00,
    'SC': 7.25, 'SD': 11.50, 'TN': 7.25, 'TX': 7.25,
    'UT': 7.25, 'VT': 14.01, 'VA': 12.41, 'WA': 16.28,
    'WV': 8.75, 'WI': 7.25, 'WY': 7.25
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
    const weeklyStipend = dailyGSARate * 7;

    const scenarios = this.MARGIN_SCENARIOS.map(margin => {
      // These stay constant regardless of hours
      const blendedRate = details.billRate * (1 - margin);
      const overtimeRate = blendedRate * this.OVERTIME_MULTIPLIER;
      
      // Calculate base weekly amounts (using 40 hours as base)
      const baseWeeklyGross = blendedRate * 40;
      
      // First ensure minimum wage compliance for regular hours
      const minWeeklyTaxable = stateMinWage * 40;
      
      // Calculate initial weekly values
      let baseWeeklyTaxable = baseWeeklyGross - weeklyStipend;
      let actualWeeklyStipend = weeklyStipend;
      
      // Adjust if below minimum wage
      if (baseWeeklyTaxable < minWeeklyTaxable) {
        baseWeeklyTaxable = minWeeklyTaxable;
        actualWeeklyStipend = baseWeeklyGross - baseWeeklyTaxable;
      }
      
      // Calculate hourly rates
      const taxableRate = baseWeeklyTaxable / 40;
      const stipendRate = actualWeeklyStipend / 40;
      
      // Handle actual hours worked
      const regularHours = Math.min(40, details.hoursPerWeek);
      const overtimeHours = Math.max(0, details.hoursPerWeek - 40);
      
      // Calculate weekly pay
      const regularTaxablePay = taxableRate * regularHours;
      const overtimePay = overtimeRate * overtimeHours;
      const weeklyTaxablePay = regularTaxablePay + overtimePay;
      
      // Prorate stipend if part time
      const finalWeeklyStipend = (details.hoursPerWeek >= 30) ? actualWeeklyStipend 
                                                              : (actualWeeklyStipend * details.hoursPerWeek / 40);
      
      const weeklyGrossPay = weeklyTaxablePay + finalWeeklyStipend;

      return {
        grossMarginPercent: margin * 100,
        weekly: {
          grossPay: weeklyGrossPay,
          taxablePay: weeklyTaxablePay,
          stipendPay: finalWeeklyStipend
        },
        hourly: {
          blendedRate: blendedRate,
          taxableRate: taxableRate,
          stipendRate: stipendRate,
          overtimeRate: overtimeRate
        },
        total: {
          contractRevenue: details.billRate * details.hoursPerWeek * details.durationWeeks,
          contractGrossPay: weeklyGrossPay * details.durationWeeks,
          grossPay: weeklyGrossPay * details.durationWeeks,
          taxablePay: weeklyTaxablePay * details.durationWeeks,
          stipendPay: finalWeeklyStipend * details.durationWeeks
        },
        internalBreakdown: {
          totalContractRevenue: details.billRate * details.hoursPerWeek * details.durationWeeks,
          totalContractGrossPay: weeklyGrossPay * details.durationWeeks,
          totalMargin: (details.billRate * details.hoursPerWeek * details.durationWeeks) - (weeklyGrossPay * details.durationWeeks),
          weeklyMargin: (details.billRate * details.hoursPerWeek) - weeklyGrossPay
        }
      };
    });

    return {
      scenarios,
      stateMinimumWage: stateMinWage
    };
  }
}

export const packageCalculator = new PayPackageCalculator(); 