import React, { useState } from 'react';
import { packageCalculator } from '../services/packageCalculator';
import PackageResults from './PackageResults';

interface ContractDetails {
  // Contract Details
  billRate: string;
  hoursPerWeek: string;
  durationWeeks: string;
  hasBenefits: string;  // Using string for dropdown: 'yes' or 'no'
  
  // Location Details
  city: string;
  state: string; // 2-letter
  zipCode: string; // optional
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

interface CalculationResult {
  scenarios: PayPackageScenario[];
  stateMinimumWage: number;
}

export default function ContractDetailsForm() {
  const [formData, setFormData] = useState<ContractDetails>({
    billRate: '',
    hoursPerWeek: '',
    durationWeeks: '',
    hasBenefits: '',  // Empty string as initial value for select
    city: '',
    state: '',
    zipCode: '',
    month: '',
    year: ''
  });

  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear previous results when form changes
    setCalculationResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setError(null);
    
    try {
      const calculationData = {
        billRate: parseFloat(formData.billRate),
        hoursPerWeek: parseInt(formData.hoursPerWeek),
        durationWeeks: parseInt(formData.durationWeeks),
        hasBenefits: formData.hasBenefits === 'yes',
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        month: formData.month,
        year: formData.year
      };

      const result = await packageCalculator.calculatePackages(calculationData);
      setCalculationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while calculating packages');
    } finally {
      setIsCalculating(false);
    }
  };

  // Update months to use three-letter abbreviations
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Generate array of years (current year + 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: 6 }, 
    (_, i) => (currentYear + i).toString()
  );

  // Hours per Week validation
  if (!formData.hoursPerWeek) {
    error = 'Hours per week is required';
  } else {
    const hours = parseInt(formData.hoursPerWeek);
    if (hours <= 0) {
      error = 'Hours must be greater than 0';
    } else if (hours > 60) {
      error = 'Hours cannot exceed 60 per week';
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Contract Details Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Contract Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bill Rate Input */}
            <div className="space-y-2">
              <label htmlFor="billRate" className="block text-sm font-medium text-gray-700">
                Contract Bill Rate
              </label>
              <input
                type="number"
                id="billRate"
                name="billRate"
                value={formData.billRate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Hours Per Week Input */}
            <div className="space-y-2">
              <label htmlFor="hoursPerWeek" className="block text-sm font-medium text-gray-700">
                Hours Per Week
              </label>
              <input
                type="number"
                id="hoursPerWeek"
                name="hoursPerWeek"
                value={formData.hoursPerWeek}
                onChange={handleChange}
                min="1"
                max="60"
                className={`w-full px-3 py-2 border rounded-md ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>

            {/* Duration Weeks Input */}
            <div className="space-y-2">
              <label htmlFor="durationWeeks" className="block text-sm font-medium text-gray-700">
                Contract Duration (Weeks)
              </label>
              <input
                type="number"
                id="durationWeeks"
                name="durationWeeks"
                value={formData.durationWeeks}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Benefits Dropdown */}
            <div className="space-y-2">
              <label htmlFor="hasBenefits" className="block text-sm font-medium text-gray-700">
                Accepting Benefits?
              </label>
              <select
                id="hasBenefits"
                name="hasBenefits"
                value={formData.hasBenefits}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Option</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location Details Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Contract Location Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State (2-Letter)
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state.toUpperCase()}
                  onChange={handleChange}
                  maxLength={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md uppercase"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                  Zip Code (Optional)
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            {/* Second Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="month" className="block text-sm font-medium text-gray-700">
                  Month
                </label>
                <select
                  id="month"
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Month</option>
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                  Year
                </label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Add error message display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isCalculating}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-4 rounded-xl 
            font-medium tracking-wide shadow-lg hover:from-blue-700 hover:to-blue-600 
            transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCalculating ? 'Calculating...' : 'Build Pay Package Options'}
          </button>
        </div>
      </form>

      {/* Results Section */}
      {(calculationResult || isCalculating) && (
        <PackageResults 
          scenarios={calculationResult?.scenarios || []}
          stateMinimumWage={calculationResult?.stateMinimumWage || 0}
          isLoading={isCalculating}
        />
      )}
    </div>
  );
} 