'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CollegeDashboard() {
  const router = useRouter();
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollegeData();
  }, []);

  const fetchCollegeData = async () => {
    try {
      const response = await fetch('/api/college/profile');
      if (response.ok) {
        const data = await response.json();
        setCollege(data);
      }
    } catch (error) {
      console.error('Error fetching college data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar role="college" onLogout={handleLogout} />

      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">College Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome, {college?.collegeName}</p>
          </div>

          {/* College Info Card */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">College Information</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">College Name</p>
                  <p className="mt-1 text-sm text-gray-900">{college?.collegeName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">College Code</p>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{college?.collegeCode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1 text-sm text-gray-900">{college?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Director</p>
                  <p className="mt-1 text-sm text-gray-900">{college?.directorName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact</p>
                  <p className="mt-1 text-sm text-gray-900">{college?.directorMobile}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Establishment Year</p>
                  <p className="mt-1 text-sm text-gray-900">{college?.establishmentYear}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="mt-1 text-sm text-gray-900">{college?.address}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Programs Offered</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {college?.programs.map((program) => (
                      <span
                        key={program}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                      >
                        {program}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Website</p>
                  <a
                    href={college?.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    {college?.website}
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span
                    className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      college?.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : college?.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {college?.status?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

        
        </div>
      </div>

      <Footer />
    </div>
  );
}
