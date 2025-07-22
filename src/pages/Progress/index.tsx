import React, { useState, useEffect } from 'react';
import progressService, { WeightEntry, ComplianceEntry, ProgressSummary } from '../../services/progress.service';
import { format, parseISO, subDays, isValid } from 'date-fns';

const Progress: React.FC = () => {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [complianceEntries, setComplianceEntries] = useState<ComplianceEntry[]>([]);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'three-months'>('month');
  const [newWeight, setNewWeight] = useState<string>('');
  const [weightNote, setWeightNote] = useState<string>('');

  useEffect(() => {
    fetchProgressData(timeframe);
  }, [timeframe]);

  const fetchProgressData = async (period: 'week' | 'month' | 'three-months') => {
    try {
      setLoading(true);
      const today = new Date();
      let startDate: Date;

      switch (period) {
        case 'week':
          startDate = subDays(today, 7);
          break;
        case 'month':
          startDate = subDays(today, 30);
          break;
        case 'three-months':
          startDate = subDays(today, 90);
          break;
        default:
          startDate = subDays(today, 30);
      }

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = today.toISOString().split('T')[0];

      const [weightData, complianceData, summaryData] = await Promise.all([
        progressService.getWeightHistory(startDateStr, endDateStr),
        progressService.getComplianceHistory(startDateStr, endDateStr),
        progressService.getProgressSummary(startDateStr, endDateStr)
      ]);

      setWeightEntries(weightData);
      setComplianceEntries(complianceData);
      setSummary(summaryData);
    } catch (err) {
      setError('Failed to load progress data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newWeight || isNaN(parseFloat(newWeight))) {
      setError('Please enter a valid weight.');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      await progressService.addWeightEntry(parseFloat(newWeight), today, weightNote || undefined);
      
      setSuccess('Weight entry added successfully.');
      setNewWeight('');
      setWeightNote('');
      
      // Refetch data to update the graphs
      await fetchProgressData(timeframe);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError('Failed to add weight entry. Please try again.');
    }
  };

  const renderWeightChart = () => {
    if (weightEntries.length === 0) {
      return (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No weight data available for the selected timeframe.</p>
        </div>
      );
    }

    // Sort entries by date
    const sortedEntries = [...weightEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Get min and max for chart scaling
    const weights = sortedEntries.map(entry => entry.weight);
    const minWeight = Math.min(...weights) * 0.95;
    const maxWeight = Math.max(...weights) * 1.05;
    const chartHeight = 200;
    const chartWidth = 600;

    return (
      <div className="overflow-x-auto">
        <div style={{ minWidth: `${sortedEntries.length * 60}px`, maxWidth: '100%' }}>
          <svg 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            style={{ width: '100%', height: '250px' }}
            className="overflow-visible"
          >
            {/* Y-axis line */}
            <line x1="40" y1="10" x2="40" y2={chartHeight-20} stroke="#e5e7eb" strokeWidth="1" />
            
            {/* X-axis line */}
            <line x1="40" y1={chartHeight-20} x2={chartWidth-20} y2={chartHeight-20} stroke="#e5e7eb" strokeWidth="1" />
            
            {/* Weight line */}
            <polyline
              points={sortedEntries.map((entry, i) => {
                const x = 60 + i * (chartWidth - 80) / (sortedEntries.length - 1 || 1);
                const y = chartHeight - 20 - ((entry.weight - minWeight) / (maxWeight - minWeight) * (chartHeight - 40));
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#6366F1"
              strokeWidth="2"
            />
            
            {/* Data points */}
            {sortedEntries.map((entry, i) => {
              const x = 60 + i * (chartWidth - 80) / (sortedEntries.length - 1 || 1);
              const y = chartHeight - 20 - ((entry.weight - minWeight) / (maxWeight - minWeight) * (chartHeight - 40));
              
              return (
                <g key={entry.id}>
                  <circle 
                    cx={x} 
                    cy={y} 
                    r="4" 
                    fill="#6366F1" 
                  />
                  <text 
                    x={x} 
                    y={y - 10} 
                    textAnchor="middle" 
                    fontSize="10" 
                    fill="#4B5563"
                  >
                    {entry.weight}kg
                  </text>
                  <text 
                    x={x} 
                    y={chartHeight} 
                    textAnchor="middle" 
                    fontSize="10" 
                    fill="#4B5563"
                  >
                    {format(parseISO(entry.date), 'MMM d')}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  const renderComplianceChart = () => {
    if (complianceEntries.length === 0) {
      return (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No compliance data available for the selected timeframe.</p>
        </div>
      );
    }

    // Sort entries by date
    const sortedEntries = [...complianceEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return (
      <div className="space-y-3">
        {sortedEntries.map((entry) => (
          <div key={entry.id} className="bg-white p-3 rounded-lg border">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium">
                {isValid(parseISO(entry.date)) ? format(parseISO(entry.date), 'MMMM d, yyyy') : entry.date}
              </div>
              <div className="text-sm text-gray-500">
                {entry.mealsCompleted} of {entry.totalMeals} meals completed
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${(entry.complianceRate * 100)}%` }}
              ></div>
            </div>
            <div className="text-right mt-1 text-xs text-gray-500">
              {Math.round(entry.complianceRate * 100)}% compliance
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading progress data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 rounded-md">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <div className="flex flex-wrap justify-between items-center mb-6">
          <div className="flex space-x-2 mb-4 sm:mb-0">
            <button
              onClick={() => setTimeframe('week')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                timeframe === 'week'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                timeframe === 'month'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeframe('three-months')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                timeframe === 'three-months'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              3 Months
            </button>
          </div>

          <div>
            <form onSubmit={handleAddWeight} className="flex flex-wrap gap-2 items-end">
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Weight (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  step="0.1"
                  min="20"
                  className="w-full sm:w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="70.5"
                  required
                />
              </div>
              <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  id="note"
                  value={weightNote}
                  onChange={(e) => setWeightNote(e.target.value)}
                  className="w-full sm:w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Optional note"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add Entry
              </button>
            </form>
          </div>
        </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Weight Change</p>
              <p className="text-2xl font-bold text-indigo-600">
                {summary.weightChange > 0 ? '+' : ''}{summary.weightChange.toFixed(1)} kg
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Current Weight</p>
              <p className="text-2xl font-bold text-indigo-600">
                {summary.currentWeight.toFixed(1)} kg
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Avg. Compliance</p>
              <p className="text-2xl font-bold text-indigo-600">
                {Math.round(summary.averageComplianceRate * 100)}%
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Weight Tracking</h2>
            {renderWeightChart()}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Meal Plan Compliance</h2>
            {renderComplianceChart()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress; 