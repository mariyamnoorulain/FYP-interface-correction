import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';

interface TutorSearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSubject: string;
  onSubjectChange: (value: string) => void;
  minRating: string;
  onMinRatingChange: (value: string) => void;
  maxPrice: string;
  onMaxPriceChange: (value: string) => void;
  showAIMatch: boolean;
  onAIMatchToggle: (value: boolean) => void;
}

export default function TutorSearchFilters({
  searchTerm,
  onSearchChange,
  selectedSubject,
  onSubjectChange,
  minRating,
  onMinRatingChange,
  maxPrice,
  onMaxPriceChange,
  showAIMatch,
  onAIMatchToggle
}: TutorSearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const subjects = ['Math', 'English', 'Science', 'Programming', 'Data Science', 'Business', 'Languages'];
  const hasActiveFilters = selectedSubject || minRating || maxPrice;

  const clearFilters = () => {
    onSubjectChange('');
    onMinRatingChange('');
    onMaxPriceChange('');
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by subject, topic, or tutor name"
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
        />
      </div>

      {/* Filter Toggle & AI Match */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-teal-600 text-white rounded-full text-xs">
              {[selectedSubject, minRating, maxPrice].filter(Boolean).length}
            </span>
          )}
        </button>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showAIMatch}
            onChange={(e) => onAIMatchToggle(e.target.checked)}
            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
          />
          <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <span className="text-purple-600">🧠</span>
            Show AI Match Score
          </span>
        </label>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Filter Options</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => onSubjectChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
              <input
                type="number"
                value={minRating}
                onChange={(e) => onMinRatingChange(e.target.value)}
                placeholder="0.0"
                min="0"
                max="5"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Price ($/hr)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => onMaxPriceChange(e.target.value)}
                placeholder="100"
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

