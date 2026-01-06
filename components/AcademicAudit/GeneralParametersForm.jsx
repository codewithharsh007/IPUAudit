"use client";

import { useState, useEffect } from "react";
import FileUpload from "./FileUpload";

export default function GeneralParametersForm({
  data,
  onSave,
  onPrevious,
  isFirstStep,
  isLastStep,
  saving,
}) {
  const [formData, setFormData] = useState({
    individualSeating: false,
    websiteURL: "",
    girlsCommonRoom: false,
    toiletCleanliness: "Good",
    canteenAndWater: false,
    documents: [],
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Fix the useEffect dependency warning
  useEffect(() => {
    if (data?.generalParameters) {
      setFormData(data.generalParameters);
    }
  }, [data?.generalParameters]); // More specific dependency

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    let error = null;

    if (field === "websiteURL") {
      if (!value || value.trim() === "") {
        error = "Website URL is required";
      } else if (!/^https?:\/\/.+\..+/.test(value)) {
        error = "Please enter a valid URL (e.g., https://www.example.com)";
      }
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error;
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field: Website URL
    if (!formData.websiteURL || formData.websiteURL.trim() === "") {
      newErrors.websiteURL = "Website URL is required";
    } else if (!/^https?:\/\/.+\..+/.test(formData.websiteURL)) {
      newErrors.websiteURL = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmit = async (action) => {
    // Validate only if continuing to next step
    if (action === "saveAndContinue" && !validateForm()) {
      // Mark all fields as touched to show errors
      setTouched({
        websiteURL: true,
      });
      return;
    }

    const result = await onSave(formData, action);

    // Optional: Show success message
    if (result?.success) {
      // Form saved successfully
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Max Marks: 30</strong> - Provide general infrastructure
          details
        </p>
      </div>

      {/* General Parameters */}
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Individual Seating Arrangements for Faculty
              </p>
              <p className="text-xs text-gray-500">
                Each faculty member has individual seating with suitable
                furniture
              </p>
            </div>
            <select
              value={formData.individualSeating.toString()}
              onChange={(e) =>
                handleChange("individualSeating", e.target.value === "true")
              }
              className="rounded-lg text-gray-900 border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Institution Website URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={formData.websiteURL}
            onChange={(e) => handleChange("websiteURL", e.target.value)}
            onBlur={() => handleBlur("websiteURL")}
            className={`w-full text-gray-900 rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 ${
              touched.websiteURL && errors.websiteURL
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-indigo-500"
            }`}
            placeholder="https://www.example.edu.in"
          />
          {touched.websiteURL && errors.websiteURL && (
            <p className="mt-1 text-sm text-red-600">{errors.websiteURL}</p>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Common Rooms for Girls (Separate)
              </p>
              <p className="text-xs text-gray-500">
                Dedicated common room facility for female students
              </p>
            </div>
            <select
              value={formData.girlsCommonRoom.toString()}
              onChange={(e) =>
                handleChange("girlsCommonRoom", e.target.value === "true")
              }
              className="rounded-lg text-gray-900 border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Cleanliness of Toilets <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.toiletCleanliness}
            onChange={(e) => handleChange("toiletCleanliness", e.target.value)}
            className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Average">Average</option>
            <option value="Poor">Poor</option>
          </select>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Students&apos; Canteen and Drinking Water Arrangements
              </p>
              <p className="text-xs text-gray-500">
                Availability of canteen and safe drinking water facilities
              </p>
            </div>
            <select
              value={formData.canteenAndWater.toString()}
              onChange={(e) =>
                handleChange("canteenAndWater", e.target.value === "true")
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
          Upload Supporting Documents (Geo-tagged Photos)
        </label>
        <p className="mb-3 text-sm text-gray-600">
          Upload geo-tagged photos of faculty rooms, common rooms, toilets,
          canteen, water facilities, etc.
        </p>
        <FileUpload section="general-parameters" onUpload={handleFileUpload} />

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
