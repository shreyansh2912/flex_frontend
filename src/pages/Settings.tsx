import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { Save, Upload, User, Loader2 } from 'lucide-react';

import type { IUserProfile } from '../types';

const Settings: React.FC = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<IUserProfile>({
    name: '',
    email: '',
    profileImage: '',
    qrColor: '#000000',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile({
          name: response.data.data.name || '',
          email: response.data.data.email || '',
          profileImage: response.data.data.profileImage || '',
          qrColor: response.data.data.qrColor || '#000000',
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        setMessage({ type: 'error', text: 'Failed to load profile' });
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/upload`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      setProfile(prev => ({ ...prev, profileImage: response.data.data.url }));
    } catch (err) {
      console.error('Error uploading image:', err);
      setMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await axios.put(`${BASE_URL}/api/users/profile`, {
        name: profile.name,
        profileImage: profile.profileImage,
        qrColor: profile.qrColor
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (err) {
      console.error('Error saving settings:', err);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Account Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Settings Form */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">Profile Information</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Image</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-600">
                  {profile.profileImage ? (
                    <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-gray-400" />
                  )}
                </div>
                <label className="cursor-pointer bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center gap-2">
                  <Upload size={16} />
                  {uploadingImage ? 'Uploading...' : 'Change Photo'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                placeholder="Enter your name"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* QR Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">QR Code Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={profile.qrColor}
                  onChange={(e) => setProfile({ ...profile, qrColor: e.target.value })}
                  className="h-10 w-20 p-1 rounded border border-gray-300 dark:border-slate-600 cursor-pointer bg-white dark:bg-slate-900"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">{profile.qrColor}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This color will be applied to all your generated QR codes.</p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Save Changes
              </button>
            </div>

            {message && (
              <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message.text}
              </div>
            )}
          </form>
        </div>

        {/* Preview Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">Live Preview</h2>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
            <QRCodeSVG
              value="https://flex-platform.com/sample"
              size={200}
              fgColor={profile.qrColor}
              level="H"
              includeMargin={true}
              imageSettings={profile.profileImage ? {
                src: profile.profileImage,
                x: undefined,
                y: undefined,
                height: 40,
                width: 40,
                excavate: true,
              } : undefined}
            />
          </div>

          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            {profile.name || 'Your Name'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Scan to join session
          </p>
          
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300 text-left w-full">
            <p className="font-semibold mb-1">Did you know?</p>
            <p>Adding your logo to the QR code makes it more recognizable and professional. The color you choose here will be used across all your Polls, Word Clouds, and Q&A sessions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
