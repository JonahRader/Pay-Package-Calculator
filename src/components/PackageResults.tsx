import React from 'react';
import { PayPackageScenario } from '../types';

interface PackageResultsProps {
  scenarios: PayPackageScenario[];
  stateMinimumWage: number;
  isLoading?: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export default function PackageResults({ scenarios, stateMinimumWage, isLoading = false }: PackageResultsProps) {
  if (isLoading) {
    return (
      <div className="mt-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Calculating pay package options...</p>
      </div>
    );
  }

  if (!scenarios.length) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Pay Package Options</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full">
        {scenarios.map((scenario, index) => (
          <div 
            key={scenario.grossMarginPercent}
            className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 
              ${index === 1 ? 'border-blue-500 ring-2 ring-blue-500' : 'border-transparent'}`}
          >
            {/* Header */}
            <div className={`px-6 py-4 ${index === 1 ? 'bg-blue-500' : 'bg-gray-50'}`}>
              <h3 className={`text-xl font-semibold ${index === 1 ? 'text-white' : 'text-gray-800'}`}>
                Option {index + 1}
              </h3>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Weekly Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Weekly Breakdown
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gross Pay</span>
                    <span className="font-medium">{formatCurrency(scenario.weekly.grossPay)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxable Pay</span>
                    <span className="font-medium">{formatCurrency(scenario.weekly.taxablePay)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax-Free Stipend</span>
                    <span className="font-medium">{formatCurrency(scenario.weekly.stipendPay)}</span>
                  </div>
                </div>
              </div>

              {/* Hourly Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Hourly Rates
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Blended Rate</span>
                    <span className="font-medium">{formatCurrency(scenario.hourly.blendedRate)}/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxable Rate</span>
                    <span className="font-medium">{formatCurrency(scenario.hourly.taxableRate)}/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stipend Rate</span>
                    <span className="font-medium">{formatCurrency(scenario.hourly.stipendRate)}/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Overtime Rate</span>
                    <span className="font-medium">{formatCurrency(scenario.hourly.overtimeRate)}/hr</span>
                  </div>
                </div>
              </div>

              {/* Contract Total Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Contract Totals
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gross Pay</span>
                    <span className="font-medium">{formatCurrency(scenario.total.grossPay)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxable Pay</span>
                    <span className="font-medium">{formatCurrency(scenario.total.taxablePay)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax-Free Stipend</span>
                    <span className="font-medium">{formatCurrency(scenario.total.stipendPay)}</span>
                  </div>
                </div>
              </div>

              {/* Internal Breakdown Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Internal Breakdown
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Contract Revenue</span>
                    <span className="font-medium">{formatCurrency(scenario.internalBreakdown.totalContractRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Contract Gross Pay</span>
                    <span className="font-medium">{formatCurrency(scenario.internalBreakdown.totalContractGrossPay)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Margin</span>
                    <span className="font-medium">{formatCurrency(scenario.internalBreakdown.totalMargin)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weekly Margin</span>
                    <span className="font-medium">{formatCurrency(scenario.internalBreakdown.weeklyMargin)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 