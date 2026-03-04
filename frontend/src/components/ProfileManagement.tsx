import { useState, useEffect } from 'react';
import { User, Video, Save, Upload, Globe, Award, DollarSign } from 'lucide-react';

interface TutorProfile {
  bio: string;
  photo: string;
  introVideo: string;
  subjects: Array<{ name: string; price: number }>;
  hourlyRate: number;
  timezone: string;
  languages: string[];
  certifications: Array<{ name: string; issuer: string; year: number }>;
  visibility: 'public' | 'hidden';
  profileScore: number;
}

export default function ProfileManagement() {
  const [profile, setProfile] = useState<TutorProfile>({
    bio: '',
    photo: '',
    introVideo: '',
    subjects: [],
    hourlyRate: 20,
    timezone: 'UTC',
    languages: [],
    certifications: [],
    visibility: 'public',
    profileScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', price: 20 });
  const [newLanguage, setNewLanguage] = useState('');
  const [newCert, setNewCert] = useState({ name: '', issuer: '', year: new Date().getFullYear() });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tutors/profile/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'photo' | 'video') => {
    // In a real app, you'd upload to cloud storage (S3, Cloudinary, etc.)
    // For now, we'll use a data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'photo') {
        setProfile({ ...profile, photo: reader.result as string });
      } else {
        setProfile({ ...profile, introVideo: reader.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tutors/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
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

  const addSubject = () => {
    if (newSubject.name) {
      setProfile({
        ...profile,
        subjects: [...profile.subjects, { ...newSubject }]
      });
      setNewSubject({ name: '', price: 20 });
    }
  };

  const removeSubject = (index: number) => {
    setProfile({
      ...profile,
      subjects: profile.subjects.filter((_, i) => i !== index)
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

  const addCertification = () => {
    if (newCert.name && newCert.issuer) {
      setProfile({
        ...profile,
        certifications: [...profile.certifications, { ...newCert }]
      });
      setNewCert({ name: '', issuer: '', year: new Date().getFullYear() });
    }
  };

  const removeCertification = (index: number) => {
    setProfile({
      ...profile,
      certifications: profile.certifications.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Score */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Profile Score</h3>
          <span className="text-3xl font-bold text-teal-600">{profile.profileScore}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div
            className="bg-teal-600 h-3 rounded-full transition-all"
            style={{ width: `${profile.profileScore}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600">
          Complete your profile to increase visibility in search results
        </p>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <User className="w-6 h-6 text-teal-600" />
          Basic Information
        </h2>

        <div className="space-y-4">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Profile Photo</label>
            <div className="flex items-center gap-4">
              {profile.photo ? (
                <img src={profile.photo} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <label className="px-4 py-2 bg-teal-600 text-white rounded-lg cursor-pointer hover:bg-teal-700 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'photo')}
                />
              </label>
            </div>
          </div>

          {/* Intro Video */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Video className="w-5 h-5 text-teal-600" />
              Introduction Video
            </label>
            {profile.introVideo ? (
              <div className="mt-2">
                <video src={profile.introVideo} controls className="w-full max-w-md rounded-lg" />
              </div>
            ) : null}
            <label className="mt-2 inline-block px-4 py-2 bg-teal-600 text-white rounded-lg cursor-pointer hover:bg-teal-700 flex items-center gap-2 w-fit">
              <Upload className="w-4 h-4" />
              Upload Video
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video')}
              />
            </label>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="Tell students about yourself, your teaching style, and experience..."
            />
          </div>

          {/* Hourly Rate */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-teal-600" />
              Hourly Rate (USD)
            </label>
            <input
              type="number"
              value={profile.hourlyRate}
              onChange={(e) => setProfile({ ...profile, hourlyRate: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              min="1"
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium mb-2">Profile Visibility</label>
            <select
              value={profile.visibility}
              onChange={(e) => setProfile({ ...profile, visibility: e.target.value as 'public' | 'hidden' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="public">Public (Visible in search)</option>
              <option value="hidden">Hidden (Not visible in search)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subjects */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Subjects & Pricing</h2>
        <div className="space-y-4">
          {profile.subjects.map((subject, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-semibold">{subject.name}</p>
                <p className="text-sm text-gray-600">${subject.price}/hour</p>
              </div>
              <button
                onClick={() => removeSubject(idx)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubject.name}
              onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
              placeholder="Subject name"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="number"
              value={newSubject.price}
              onChange={(e) => setNewSubject({ ...newSubject, price: parseFloat(e.target.value) })}
              placeholder="Price"
              className="w-32 px-4 py-2 border border-gray-300 rounded-lg"
              min="1"
            />
            <button
              onClick={addSubject}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Languages */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Globe className="w-6 h-6 text-teal-600" />
          Languages
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {profile.languages.map((lang) => (
            <span
              key={lang}
              className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full flex items-center gap-2"
            >
              {lang}
              <button onClick={() => removeLanguage(lang)} className="text-teal-700 hover:text-teal-900">
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
            placeholder="Add language"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
          />
          <button
            onClick={addLanguage}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Add
          </button>
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Award className="w-6 h-6 text-teal-600" />
          Certifications
        </h2>
        <div className="space-y-3 mb-4">
          {profile.certifications.map((cert, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold">{cert.name}</p>
              <p className="text-sm text-gray-600">{cert.issuer} • {cert.year}</p>
              <button
                onClick={() => removeCertification(idx)}
                className="mt-2 text-red-600 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <input
            type="text"
            value={newCert.name}
            onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
            placeholder="Certification name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            value={newCert.issuer}
            onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
            placeholder="Issuing organization"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            value={newCert.year}
            onChange={(e) => setNewCert({ ...newCert, year: parseInt(e.target.value) })}
            placeholder="Year"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            min="1900"
            max={new Date().getFullYear()}
          />
          <button
            onClick={addCertification}
            className="w-full px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Add Certification
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveProfile}
          disabled={saving}
          className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2 font-semibold"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}



