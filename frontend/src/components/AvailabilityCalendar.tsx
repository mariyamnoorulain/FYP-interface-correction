import { useState, useEffect } from 'react';
import { Calendar, Save } from 'lucide-react';

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

const timeSlots = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00',
  '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00', '23:00'
];

export default function AvailabilityCalendar() {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dates, setDates] = useState<Date[]>([]);

  useEffect(() => {
    loadAvailability();

    // Generate next 7 days starting from today
    const next7Days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      next7Days.push(date);
    }
    setDates(next7Days);
  }, []);

  const loadAvailability = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/tutors/availability/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailability(data);
      }
    } catch (error) {
      console.error('Error loading availability:', error);
    }
  };

  const toggleTimeSlot = (day: number, startTime: string, endTime: string) => {
    setAvailability(prev => {
      const existing = prev.find(
        a => a.dayOfWeek === day && a.startTime === startTime && a.endTime === endTime
      );

      if (existing) {
        return prev.filter(
          a => !(a.dayOfWeek === day && a.startTime === startTime && a.endTime === endTime)
        );
      } else {
        return [...prev, { dayOfWeek: day, startTime, endTime, isAvailable: true }];
      }
    });
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tutors/availability/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ availability })
      });

      if (response.ok) {
        alert('Availability saved successfully!');
      } else {
        alert('Failed to save availability');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const isSlotSelected = (day: number, startTime: string, endTime: string) => {
    return availability.some(
      a => a.dayOfWeek === day && a.startTime === startTime && a.endTime === endTime
    );
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDayOfWeek = (date: Date) => date.getDay();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-teal-600" />
          Availability Calendar
        </h2>
        <button
          onClick={saveAvailability}
          disabled={saving}
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Availability'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-8 gap-2 min-w-[800px]">
          {/* Header */}
          <div className="font-bold text-gray-700 flex items-end pb-2">Time</div>
          {dates.map((date, idx) => (
            <div key={idx} className="text-center pb-2">
              <div className="font-bold text-gray-800">{getDayName(date)}</div>
              <div className="text-xs text-gray-500">{getDayDate(date)}</div>
            </div>
          ))}

          {/* Time slots */}
          {timeSlots.map((time, idx) => {
            if (idx === timeSlots.length - 1) return null;
            const nextTime = timeSlots[idx + 1];

            return (
              <div key={time} className="contents">
                <div className="text-sm text-gray-600 py-2">{time}</div>
                {dates.map((date, dateIdx) => {
                  const dayOfWeek = getDayOfWeek(date);
                  const isSelected = isSlotSelected(dayOfWeek, time, nextTime);
                  return (
                    <button
                      key={dateIdx}
                      onClick={() => toggleTimeSlot(dayOfWeek, time, nextTime)}
                      className={`p-2 rounded border-2 transition ${isSelected
                          ? 'bg-teal-100 border-teal-500'
                          : 'bg-gray-50 border-gray-200 hover:border-teal-300'
                        }`}
                    >
                      {isSelected ? '✓' : ''}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Tip:</strong> Click on time slots to mark them as available. Green slots indicate your availability.
        </p>
      </div>
    </div>
  );
}
