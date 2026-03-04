import { useState, useEffect } from 'react';
import { User, Save, Upload, Globe, Award, Mail, Phone, MapPin, GraduationCap } from 'lucide-react';

interface StudentProfile {
  bio: string;
  photo: string;
  phone: string;
  location: string;
  education: Array<{ institution: string; degree: string; year: number }>;
  interests: string[];
  languages: string[];
  achievements: Array<{ title: string; description: string; year: number }>;
  socialLinks: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
}

export default function StudentProfileManagement() {
  const [profile, setProfile] = useState<StudentProfile>({
    bio: '',
    photo: '',
    phone: '',
    location: '',
    education: [],
    interests: [],
    languages: [],
    achievements: [],
    socialLinks: {}
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newEducation, setNewEducation] = useState({ institution: '', degree: '', year: new Date().getFullYear() });
  const [newInterest, setNewInterest] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newAchievement, setNewAchievement] = useState({ title: '', description: '', year: new Date().getFullYear() });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      // If no token, maybe redirect or just stop
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/students/profile/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure arrays are initialized if empty from backend
        setProfile({
          ...data,
          education: data.education || [],
          interests: data.interests || [],
          languages: data.languages || [],
          achievements: data.achievements || [],
          socialLinks: data.socialLinks || {}
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile({ ...profile, photo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/students/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);

        // Dispatch custom event to notify other components like Header
        window.dispatchEvent(new CustomEvent('profileUpdated', {
          detail: { photo: updatedProfile.photo }
        }));

        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addEducation = () => {
    if (newEducation.institution && newEducation.degree) {
      setProfile({
        ...profile,
        education: [...profile.education, { ...newEducation }]
      });
      setNewEducation({ institution: '', degree: '', year: new Date().getFullYear() });
    }
  };

  const removeEducation = (index: number) => {
    setProfile({
      ...profile,
      education: profile.education.filter((_, i) => i !== index)
    });
  };

  const addInterest = () => {
    if (newInterest && !profile.interests.includes(newInterest)) {
      setProfile({
        ...profile,
        interests: [...profile.interests, newInterest]
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setProfile({
      ...profile,
      interests: profile.interests.filter(i => i !== interest)
    });
  };

  const addLanguage = () => {
    if (newLanguage && !profile.languages.includes(newLanguage)) {
      setProfile({
        ...profile,
        languages: [...profile.languages, newLanguage]
      });
      setNewLanguage('');
    }
  };

  const removeLanguage = (lang: string) => {
    setProfile({
      ...profile,
      languages: profile.languages.filter(l => l !== lang)
    });
  };

  const addAchievement = () => {
    if (newAchievement.title && newAchievement.description) {
      setProfile({
        ...profile,
        achievements: [...profile.achievements, { ...newAchievement }]
      });
      setNewAchievement({ title: '', description: '', year: new Date().getFullYear() });
    }
  };

  const removeAchievement = (index: number) => {
    setProfile({
      ...profile,
      achievements: profile.achievements.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {/* Profile Photo */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
          <div className="flex items-center gap-6">
            {profile.photo ? (
              <img src={profile.photo} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-teal-200" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center border-4 border-teal-200">
                <User className="w-12 h-12 text-teal-600" />
              </div>
            )}
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />
              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 w-max">
                <Upload className="w-4 h-4" />
                Upload Photo
              </span>
            </label>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+1234567890"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="City, Country"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Tell us about yourself, your goals, and what you're looking for..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Education */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Education
          </label>
          <div className="space-y-3 mb-3">
            {profile.education.map((edu, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">{edu.degree}</p>
                  <p className="text-sm text-gray-600">{edu.institution} • {edu.year}</p>
                </div>
                <button
                  onClick={() => removeEducation(idx)}
                  className="text-red-600 hover:text-red-700 px-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={newEducation.institution}
              onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
              placeholder="Institution"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="text"
              value={newEducation.degree}
              onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
              placeholder="Degree"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={newEducation.year}
                onChange={(e) => setNewEducation({ ...newEducation, year: parseInt(e.target.value) || new Date().getFullYear() })}
                placeholder="Year"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
              <button
                onClick={addEducation}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Interests */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {profile.interests.map((interest, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm flex items-center gap-2"
              >
                {interest}
                <button
                  onClick={() => removeInterest(interest)}
                  className="text-teal-700 hover:text-teal-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addInterest()}
              placeholder="Add interest"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={addInterest}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Languages */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Languages
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {profile.languages.map((lang, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
              >
                {lang}
                <button
                  onClick={() => removeLanguage(lang)}
                  className="text-blue-700 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
              placeholder="Add language"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={addLanguage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Achievements
          </label>
          <div className="space-y-3 mb-3">
            {profile.achievements.map((ach, idx) => (
              <div key={idx} className="flex items-start justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-semibold">{ach.title} ({ach.year})</p>
                  <p className="text-sm text-gray-600">{ach.description}</p>
                </div>
                <button
                  onClick={() => removeAchievement(idx)}
                  className="text-red-600 hover:text-red-700 px-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <input
              type="text"
              value={newAchievement.title}
              onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
              placeholder="Achievement Title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
            <textarea
              value={newAchievement.description}
              onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
              placeholder="Description"
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={newAchievement.year}
                onChange={(e) => setNewAchievement({ ...newAchievement, year: parseInt(e.target.value) || new Date().getFullYear() })}
                placeholder="Year"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
              <button
                onClick={addAchievement}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Add Achievement
              </button>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Social Links</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">LinkedIn</label>
              <input
                type="url"
                value={profile.socialLinks.linkedin || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  socialLinks: { ...profile.socialLinks, linkedin: e.target.value }
                })}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">GitHub</label>
              <input
                type="url"
                value={profile.socialLinks.github || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  socialLinks: { ...profile.socialLinks, github: e.target.value }
                })}
                placeholder="https://github.com/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Portfolio</label>
              <input
                type="url"
                value={profile.socialLinks.portfolio || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  socialLinks: { ...profile.socialLinks, portfolio: e.target.value }
                })}
                placeholder="https://yourportfolio.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

