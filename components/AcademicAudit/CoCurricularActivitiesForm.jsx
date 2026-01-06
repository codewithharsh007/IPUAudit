"use client";

import { useState, useEffect } from "react";
import FileUpload from "./FileUpload";

export default function CoCurricularActivitiesForm({
  data,
  onSave,
  onPrevious,
  isFirstStep,
  isLastStep,
  saving,
}) {
  const [formData, setFormData] = useState({
    conferencesOrganized: [],
    seminarsOrganized: 0,
    fdpMdpOrganized: 0,
    workshopsOrganized: 0,
    valueAddedPrograms: 0,
    webinarsOrganized: 0,
    documents: [],
  });

  const [errors, setErrors] = useState({});

  // Load data from parent - This is fine, no eslint warning needed
  useEffect(() => {
    if (data?.coCurricularActivities) {
      setFormData(data.coCurricularActivities);
    }
  }, [data]);

  const handleChange = (field, value) => {
    // Parse numeric values properly
    const parsedValue =
      typeof value === "string" && !isNaN(value)
        ? parseInt(value, 10) || 0
        : value;

    setFormData({ ...formData, [field]: parsedValue });

    // Clear error when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleAddConference = () => {
    setFormData({
      ...formData,
      conferencesOrganized: [
        ...formData.conferencesOrganized,
        { type: "International", name: "", date: "", isIndexed: false },
      ],
    });
  };

  const handleRemoveConference = (index) => {
    setFormData({
      ...formData,
      conferencesOrganized: formData.conferencesOrganized.filter(
        (_, i) => i !== index,
      ),
    });
  };

  const handleConferenceChange = (index, field, value) => {
    const updated = [...formData.conferencesOrganized];
    updated[index][field] = value;
    setFormData({ ...formData, conferencesOrganized: updated });
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

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Check if at least some data is filled
    const hasData =
      formData.conferencesOrganized.length > 0 ||
      formData.seminarsOrganized > 0 ||
      formData.fdpMdpOrganized > 0 ||
      formData.workshopsOrganized > 0 ||
      formData.valueAddedPrograms > 0 ||
      formData.webinarsOrganized > 0;

    if (!hasData) {
      newErrors.general = "Please add at least one co-curricular activity";
    }

    // Validate conferences
    formData.conferencesOrganized.forEach((conf, index) => {
      if (!conf.name.trim()) {
        newErrors[`conference_${index}_name`] = "Conference name is required";
      }
      if (!conf.date) {
        newErrors[`conference_${index}_date`] = "Date is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (action) => {
    // Validate only when saving and continuing
    if (action === "saveAndContinue" && !validateForm()) {
      return;
    }

    onSave(formData, action);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Max Marks: 100</strong> - Provide details of co-curricular
          activities conducted
        </p>
      </div>

      {/* General Error */}
      {errors.general && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{errors.general}</p>
        </div>
      )}

      {/* Conferences */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-md font-semibold text-gray-900">
            Conferences Organized
          </h3>
          <button
            type="button"
            onClick={handleAddConference}
            className="rounded-lg bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700"
          >
            + Add Conference
          </button>
        </div>

        {formData.conferencesOrganized.length > 0 ? (
          <div className="space-y-4">
            {formData.conferencesOrganized.map((conference, index) => (
              <div
                key={index}
                className="relative rounded-lg border border-gray-200 bg-white p-4"
              >
                <button
                  type="button"
                  onClick={() => handleRemoveConference(index)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                  aria-label="Remove conference"
                >
                  ✕
                </button>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Type
                    </label>
                    <select
                      value={conference.type}
                      onChange={(e) =>
                        handleConferenceChange(index, "type", e.target.value)
                      }
                      className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="International">International</option>
                      <option value="National">National</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      value={conference.date}
                      onChange={(e) =>
                        handleConferenceChange(index, "date", e.target.value)
                      }
                      className={`w-full text-gray-900 rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                        errors[`conference_${index}_date`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors[`conference_${index}_date`] && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors[`conference_${index}_date`]}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Conference Name
                    </label>
                    <input
                      type="text"
                      value={conference.name}
                      onChange={(e) =>
                        handleConferenceChange(index, "name", e.target.value)
                      }
                      className={`w-full text-gray-900 rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                        errors[`conference_${index}_name`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g., Nurturing Growth through Indigenous Development"
                    />
                    {errors[`conference_${index}_name`] && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors[`conference_${index}_name`]}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={conference.isIndexed}
                        onChange={(e) =>
                          handleConferenceChange(
                            index,
                            "isIndexed",
                            e.target.checked,
                          )
                        }
                        className="h-4 w-4 rounded text-indigo-700 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Proceedings indexed with WoS/SCOPUS or has ISBN
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-gray-500">
            No conferences added yet
          </p>
        )}
      </div>

      {/* Other Activities */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Seminars Organized (One Day)
          </label>
          <input
            type="number"
            value={formData.seminarsOrganized}
            onChange={(e) => handleChange("seminarsOrganized", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 text-gray-900 focus:ring-indigo-500"
            placeholder="8"
            min="0"
          />
          <p className="mt-1 text-xs text-gray-500">
            Note: 2 half-day seminars = 1 full-day seminar
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            FDP/MDP Organized
          </label>
          <input
            type="number"
            value={formData.fdpMdpOrganized}
            onChange={(e) => handleChange("fdpMdpOrganized", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 text-gray-900 focus:ring-indigo-500"
            placeholder="1"
            min="0"
          />
          <p className="mt-1 text-xs text-gray-500">
            At least one week/5 days duration
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Workshops Organized
          </label>
          <input
            type="number"
            value={formData.workshopsOrganized}
            onChange={(e) => handleChange("workshopsOrganized", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 text-gray-900 focus:ring-indigo-500"
            placeholder="6"
            min="0"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Short Term/Value Added Programs
          </label>
          <input
            type="number"
            value={formData.valueAddedPrograms}
            onChange={(e) => handleChange("valueAddedPrograms", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 text-gray-900 focus:ring-indigo-500"
            placeholder="12"
            min="0"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Webinars/Online Extension Lectures
          </label>
          <input
            type="number"
            value={formData.webinarsOrganized}
            onChange={(e) => handleChange("webinarsOrganized", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 text-gray-900 focus:ring-indigo-500"
            placeholder="2"
            min="0"
          />
        </div>
      </div>

      {/* Document Upload */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Upload Supporting Documents
        </label>
        <p className="mb-3 text-sm text-gray-600">
          Upload brochures, proceedings, resource person lists, certificates,
          etc.
        </p>
        <FileUpload section="co-curricular" onUpload={handleFileUpload} />

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
                  type="button"
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
          type="button"
          onClick={onPrevious}
          disabled={isFirstStep}
          className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← Previous
        </button>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => handleSubmit("save")}
            disabled={saving}
            className="rounded-lg bg-gray-600 px-6 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Progress"}
          </button>

          <button
            type="button"
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
