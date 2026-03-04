import { Video, BarChart3, Brain, ArrowRight } from 'lucide-react';

export default function HowAIMatches() {
  const steps = [
    {
      icon: Video,
      title: 'Emotion Detection during videos',
      description: 'AI analyzes facial expressions and voice patterns to detect confusion, frustration, and engagement levels in real-time.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: BarChart3,
      title: 'Performance analysis',
      description: 'System correlates emotional states with quiz scores, completion rates, and learning progress to identify knowledge gaps.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Brain,
      title: 'Tutor recommendation engine',
      description: 'AI matches students with tutors who specialize in areas where confusion was detected, using similarity scoring algorithms.',
      color: 'bg-teal-100 text-teal-600'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">How AI Matches You with Tutors</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={index}
              className="relative p-6 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition"
            >
              {/* Step Number */}
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                {index + 1}
              </div>

              {/* Icon */}
              <div className={`w-12 h-12 ${step.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>

              {/* Arrow (except last) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                  <ArrowRight className="w-6 h-6 text-gray-600" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Footer */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-900">
          <strong>💡 Note:</strong> This matching system uses real-time emotion detection data from your learning sessions 
          to provide personalized tutor recommendations. No personal data is shared with tutors without your consent.
        </p>
      </div>
    </div>
  );
}

