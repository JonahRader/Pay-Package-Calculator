import { PayPackageScenario } from '../types';
import * as Tooltip from '@radix-ui/react-tooltip';
import { InfoCircle } from 'lucide-react';
import { useState } from 'react';

interface PackageResultsProps {
  scenarios: PayPackageScenario[];
  stateMinimumWage: number;
  isLoading: boolean;
  details: {
    city: string;
    state: string;
    month: string;
    year: string;
  };
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export default function PackageResults({ scenarios, stateMinimumWage, isLoading = false, details }: PackageResultsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
    <div className="mt-8 space-y-8">
      {/* Stipend Calculation Section with updated messaging */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-blue-900">Stipend Calculation Breakdown</h3>
          <div className="text-sm text-blue-700">
            <span className="font-medium">{details.city}, {details.state}</span>
            <span className="mx-2">•</span>
            <span>{details.month} {details.year}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">🏠</span>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Daily Lodging</h4>
            </div>
            <p className="text-2xl font-semibold text-blue-600">{formatCurrency(scenarios[0].stipendBreakdown.dailyLodging)}</p>
            {scenarios[0].stipendBreakdown.isStandardRate && (
              <p className="text-xs text-gray-500 mt-2">Using standard rate for this location</p>
            )}
          </div>
          <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">🍽️</span>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Daily M&IE</h4>
            </div>
            <p className="text-2xl font-semibold text-blue-600">{formatCurrency(scenarios[0].stipendBreakdown.dailyMeals)}</p>
            {scenarios[0].stipendBreakdown.isStandardRate && (
              <p className="text-xs text-gray-500 mt-2">Using standard rate for this location</p>
            )}
          </div>
          <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">💰</span>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Weekly Stipend</h4>
            </div>
            <p className="text-2xl font-semibold text-blue-600">{formatCurrency(scenarios[0].stipendBreakdown.weeklyStipend)}</p>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-600">
                <span className="font-medium">Full-Time (30+ hours/week):</span> Eligible for full weekly amount
              </p>
              <p className="text-xs text-gray-500">
                Part-time stipends are prorated based on scheduled hours
              </p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800">Pay Package Options</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {scenarios.map((scenario, index) => (
          <div 
            key={index}
            className={`relative p-4 rounded-lg shadow-md transition-all duration-200 ${
              hoveredIndex === index 
                ? 'bg-blue-50 scale-[1.01]' 
                : index === 1 // This highlights option 2 by default
                  ? 'bg-blue-50'
                  : 'bg-white'
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Add margin percentage tooltip that shows on hover */}
            {hoveredIndex === index && (
              <div className="absolute top-0 right-0 mt-2 mr-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                {scenario.grossMarginPercent}% Margin
              </div>
            )}
            
            <h3 className="text-lg font-semibold text-center mb-4">Option {index + 1}</h3>

            {/* Weekly Section */}
            <div className="pb-4 border-b border-gray-100">
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 border-b-2 border-blue-500 pb-1 text-center">
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
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-gray-600">Tax-Free Stipend</span>
                  </div>
                  <span className="font-medium">{formatCurrency(scenario.weekly.stipendPay)}</span>
                </div>
              </div>
            </div>

            {/* Hourly Section */}
            <div className="pb-4 border-b border-gray-100">
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 border-b-2 border-blue-500 pb-1 text-center">
                Hourly Rates
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Blended Rate</span>
                  <span>{formatCurrency(scenario.hourly.blendedRate)}/hr</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Taxable Rate</span>
                  <span>{formatCurrency(scenario.hourly.taxableRate)}/hr</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Stipend Rate</span>
                  <span>{formatCurrency(scenario.hourly.stipendRate)}/hr</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Overtime Rate</span>
                  <span>{formatCurrency(scenario.hourly.overtimeRate)}/hr</span>
                </div>
              </div>
            </div>

            {/* Contract Total Section */}
            <div className="pb-4 border-b border-gray-100">
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 border-b-2 border-blue-500 pb-1 text-center">
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

            {/* Internal Breakdown Section with fixed alignment */}
            <div className="pb-4">
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 border-b-2 border-blue-500 pb-1 text-center">
                Internal Breakdown
              </h4>
              <div className="space-y-2">
                <div className="grid grid-cols-2 items-center">
                  <span className="text-gray-600">Contract Revenue</span>
                  <span className="font-medium text-right">{formatCurrency(scenario.internalBreakdown.totalContractRevenue)}</span>
                </div>
                <div className="grid grid-cols-2 items-center">
                  <span className="text-gray-600">Total Pay</span>
                  <span className="font-medium text-right">{formatCurrency(scenario.internalBreakdown.totalContractGrossPay)}</span>
                </div>
                <div className="grid grid-cols-2 items-center">
                  <span className="text-gray-600">Total Margin</span>
                  <span className="font-medium text-right">{formatCurrency(scenario.internalBreakdown.totalMargin)}</span>
                </div>
                <div className="grid grid-cols-2 items-center">
                  <span className="text-gray-600">Weekly Margin</span>
                  <span className="font-medium text-right">{formatCurrency(scenario.internalBreakdown.weeklyMargin)}</span>
                </div>
              </div>
            </div>

            {/* Minimum Wage Notice if applicable */}
            {scenario.hourly.taxableRate <= stateMinimumWage && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Note: Taxable rate meets state minimum wage (${stateMinimumWage}/hr)
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 