"use client";

import { useState, useEffect } from "react";
import FileUpload from "./FileUpload";

export default function StudentDevelopmentForm({
  data,
  onSave,
  onPrevious,
  isFirstStep,
  isLastStep,
  saving,
}) {
  const [formData, setFormData] = useState({
    mockInterviews: 0,
    rolePlays: 0,
    groupDiscussions: 0,
    workshops: 0,
    competitions: 0,
    personalityDevLab: false,
    trainedFaculty: false,
    nssNccAvailable: false,
    indoorSportsFacilities: false,
    outdoorSportsFacilities: false,
    documents: [],
  });

  useEffect(() => {
    if (data?.studentDevelopment) {
      setFormData(data.studentDevelopment);
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNumberChange = (field, value) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setFormData({ ...formData, [field]: numValue });
  };

  const handleFileUpload = (url) => {
    setFormData({
      ...formData,
      documents: [...formData.documents, url],
    });
  };

  const handleRemoveFile = (index) => {
    setFormData({
      ...formData,
      documents: formData.documents.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (action) => {
    onSave(formData, action);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Max Marks: 35</strong> - Provide details of student
          personality development activities
        </p>
      </div>

      {/* Personality Development Activities */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="text-md mb-4 font-semibold text-gray-900">
          Personality Development Activities Conducted
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Mock Interviews
            </label>
            <input
              type="number"
              value={formData.mockInterviews}
              onChange={(e) =>
                handleNumberChange("mockInterviews", e.target.value)
              }
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="4"
              min="0"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Role Plays
            </label>
            <input
              type="number"
              value={formData.rolePlays}
              onChange={(e) => handleNumberChange("rolePlays", e.target.value)}
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="10"
              min="0"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Group Discussions
            </label>
            <input
              type="number"
              value={formData.groupDiscussions}
              onChange={(e) =>
                handleNumberChange("groupDiscussions", e.target.value)
              }
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="12"
              min="0"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Workshops
            </label>
            <input
              type="number"
              value={formData.workshops}
              onChange={(e) => handleNumberChange("workshops", e.target.value)}
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="9"
              min="0"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Competitions (Quizzes, Debates, etc.)
            </label>
            <input
              type="number"
              value={formData.competitions}
              onChange={(e) =>
                handleNumberChange("competitions", e.target.value)
              }
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="35"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Infrastructure and Facilities */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="text-md mb-4 font-semibold text-gray-900">
          Infrastructure and Facilities
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Personality Development Lab
              </p>
              <p className="text-xs text-gray-500">
                Dedicated lab for personality development activities
              </p>
            </div>
            <select
              value={String(formData.personalityDevLab)}
              onChange={(e) =>
                handleChange("personalityDevLab", e.target.value === "true")
              }
              className="rounded-lg text-gray-900 border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Trained Faculty for Practical Sessions
              </p>
              <p className="text-xs text-gray-500">
                Faculty trained to conduct personality development sessions
              </p>
            </div>
            <select
              value={String(formData.trainedFaculty)}
              onChange={(e) =>
                handleChange("trainedFaculty", e.target.value === "true")
              }
              className="rounded-lg text-gray-900 border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
            <div>
              <p className="text-sm font-medium text-gray-900">
                NSS/NCC/Technical and Cultural Clubs
              </p>
              <p className="text-xs text-gray-500">
                Existence of NSS, NCC, or student clubs/societies
              </p>
            </div>
            <select
              value={String(formData.nssNccAvailable)}
              onChange={(e) =>
                handleChange("nssNccAvailable", e.target.value === "true")
              }
              className="rounded-lg text-gray-900 border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sports Facilities */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="text-md mb-4 font-semibold text-gray-900">
          Sports Facilities
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Indoor Sports Facilities
              </p>
              <p className="text-xs text-gray-500">
                Table Tennis, Chess, Carrom, Badminton, etc.
              </p>
            </div>
            <select
              value={String(formData.indoorSportsFacilities)}
              onChange={(e) =>
                handleChange(
                  "indoorSportsFacilities",
                  e.target.value === "true",
                )
              }
              className="rounded-lg text-gray-900 border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Outdoor Sports Facilities
              </p>
              <p className="text-xs text-gray-500">
                Cricket, Football, Basketball, Athletics, etc.
              </p>
            </div>
            <select
              value={String(formData.outdoorSportsFacilities)}
              onChange={(e) =>
                handleChange(
                  "outdoorSportsFacilities",
                  e.target.value === "true",
                )
              }
              className="rounded-lg text-gray-900 border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Document Upload */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Upload Supporting Documents
        </label>
        <p className="mb-3 text-sm text-gray-600">
          Upload event photos, NSS/NCC certificates, sports facility images,
          activity reports, etc.
        </p>
        <FileUpload section="student-development" onUpload={handleFileUpload} />

        {formData.documents.length > 0 && (
          <div className="mt-3 space-y-2">
            {formData.documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <a
                  href={doc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Document {index + 1} →
                </a>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between border-t pt-6">
        <button
          onClick={onPrevious}
          disabled={isFirstStep}
          className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← Previous
        </button>

        <div className="flex space-x-3">
          <button
            onClick={() => handleSubmit("save")}
            disabled={saving}
            className="rounded-lg bg-gray-600 px-6 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Progress"}
          </button>

          <button
            onClick={() => handleSubmit("saveAndContinue")}
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save & Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
