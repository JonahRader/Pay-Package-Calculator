import React, { useState } from 'react';
import { packageCalculator } from '../services/packageCalculator';
import PackageResults from './PackageResults';
import { PayPackageScenario } from '../types';

interface ContractDetails {
  // Contract Details
  billRate: string;
  hoursPerWeek: string;
  durationWeeks: string;
  city: string;
  state: string; // 2-letter
  zipCode: string; // optional
  month: string;
  year: string;
  isLocalContract: string; // Added new field
}

interface CalculationResult {
  scenarios: PayPackageScenario[];
  stateMinimumWage: number;
}

interface ValidationErrors {
  hoursPerWeek?: string;
  // Add other validation error keys as needed
}

export default function ContractDetailsForm() {
  const [formData, setFormData] = useState<ContractDetails>({
    billRate: '',
    hoursPerWeek: '',
    durationWeeks: '',
    city: '',
    state: '',
    zipCode: '',
    month: '',
    year: '',
    isLocalContract: '' // Changed from 'No' to empty string
  });

  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: ContractDetails) => ({
      ...prev,
      [name as keyof ContractDetails]: value
    }));
    // Clear previous results when form changes
    setCalculationResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsCalculating(true);
    
    console.log('Form data being submitted:', formData);
    
    try {
      const calculationData = {
        billRate: parseFloat(formData.billRate),
        hoursPerWeek: parseInt(formData.hoursPerWeek),
        durationWeeks: parseInt(formData.durationWeeks),
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        month: formData.month,
        year: formData.year,
        isLocalContract: formData.isLocalContract === 'Yes' // Convert to boolean
      };
      
      console.log('Calculation data:', calculationData);
      
      const result = await packageCalculator.calculatePackages(calculationData);
      console.log('Calculator result:', result);
      
      setCalculationResult(result);
    } catch (err) {
      console.error('Error in calculation:', err);
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

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Hours per Week validation
    if (!formData.hoursPerWeek) {
      errors.hoursPerWeek = 'Hours per week is required';
    } else {
      const hours = parseInt(formData.hoursPerWeek);
      if (hours <= 0) {
        errors.hoursPerWeek = 'Hours must be greater than 0';
      } else if (hours > 60) {
        errors.hoursPerWeek = 'Hours cannot exceed 60 per week';
      }
    }

    // ... other validations ...

    // Add validation for isLocalContract
    if (!formData.isLocalContract) {
      errors.isLocalContract = 'Please select whether this is a local contract';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
                className={`w-full px-3 py-2 border rounded-md ${
                  validationErrors.hoursPerWeek ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {validationErrors.hoursPerWeek && (
                <p className="text-sm text-red-600">{validationErrors.hoursPerWeek}</p>
              )}
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

              <div className="space-y-2">
                <label htmlFor="isLocalContract" className="block text-sm font-medium text-gray-700">
                  Is this a Local Contract Opportunity?
                </label>
                <select
                  id="isLocalContract"
                  name="isLocalContract"
                  value={formData.isLocalContract}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    validationErrors.isLocalContract ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {validationErrors.isLocalContract && (
                  <p className="text-sm text-red-600">{validationErrors.isLocalContract}</p>
                )}
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
          details={{
            city: formData.city,
            state: formData.state,
            month: formData.month,
            year: formData.year
          }}
        />
      )}
    </div>
  );
} 