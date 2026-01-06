"use client";

import { useState, useEffect } from "react";
import FileUpload from "./FileUpload";

export default function AccreditationForm({
  data,
  onSave,
  onPrevious,
  isFirstStep,
  isLastStep,
  saving,
}) {
  const [formData, setFormData] = useState({
    applicability: "",
    nbaStatus: "",
    naacStatus: "",
    naacGrade: "",
    documents: [],
  });

  const [errors, setErrors] = useState({});

  // Load existing data
  useEffect(() => {
    if (data?.accreditation) {
      setFormData(data.accreditation);
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
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

  const validateForm = () => {
    const newErrors = {};

    // Validate applicability
    if (!formData.applicability) {
      newErrors.applicability = "Please select accreditation applicability";
    }

    // Validate NBA fields
    if (
      (formData.applicability === "NBA Only" ||
        formData.applicability === "Both NBA and NAAC") &&
      !formData.nbaStatus.trim()
    ) {
      newErrors.nbaStatus = "NBA status is required";
    }

    // Validate NAAC fields
    if (
      formData.applicability === "NAAC Only" ||
      formData.applicability === "Both NBA and NAAC"
    ) {
      if (!formData.naacStatus.trim()) {
        newErrors.naacStatus = "NAAC status is required";
      }
      if (!formData.naacGrade) {
        newErrors.naacGrade = "NAAC grade is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (action) => {
    // Only validate on saveAndContinue, allow saving drafts without validation
    if (action === "saveAndContinue" && !validateForm()) {
      return;
    }

    onSave(formData, action);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Max Marks: 50</strong> - Provide accreditation details for
          your institution
        </p>
      </div>

      {/* Applicability */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Applicability of Accreditation <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.applicability}
          onChange={(e) => handleChange("applicability", e.target.value)}
          className={`w-full text-gray-900 rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
            errors.applicability ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select Applicability</option>
          <option value="NBA Only">NBA Only</option>
          <option value="NAAC Only">NAAC Only</option>
          <option value="Both NBA and NAAC">Both NBA and NAAC</option>
          <option value="N.A.">Not Applicable</option>
        </select>
        {errors.applicability && (
          <p className="mt-1 text-sm text-red-600">{errors.applicability}</p>
        )}
      </div>

      {/* NBA Status */}
      {(formData.applicability === "NBA Only" ||
        formData.applicability === "Both NBA and NAAC") && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            NBA Status <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.nbaStatus}
            onChange={(e) => handleChange("nbaStatus", e.target.value)}
            className={`text-gray-900 w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
              errors.nbaStatus ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g., Accredited, Not Accredited"
          />
          {errors.nbaStatus && (
            <p className="mt-1 text-sm text-red-600">{errors.nbaStatus}</p>
          )}
        </div>
      )}

      {/* NAAC Status */}
      {(formData.applicability === "NAAC Only" ||
        formData.applicability === "Both NBA and NAAC") && (
        <>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              NAAC Status <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.naacStatus}
              onChange={(e) => handleChange("naacStatus", e.target.value)}
              className={`w-full text-gray-900 rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                errors.naacStatus ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., A Grade Accredited"
            />
            {errors.naacStatus && (
              <p className="mt-1 text-sm text-red-600">{errors.naacStatus}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              NAAC Grade <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.naacGrade}
              onChange={(e) => handleChange("naacGrade", e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 focus:border-transparent text-gray-900 focus:ring-2 focus:ring-indigo-500 ${
                errors.naacGrade ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Grade</option>
              <option value="A++">A++</option>
              <option value="A+">A+</option>
              <option value="A">A</option>
              <option value="B++">B++</option>
              <option value="B+">B+</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
            {errors.naacGrade && (
              <p className="mt-1 text-sm text-red-600">{errors.naacGrade}</p>
            )}
          </div>
        </>
      )}

      {/* Document Upload */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Upload Accreditation Documents
        </label>
        <p className="mb-2 text-xs text-gray-500">
          Upload NBA/NAAC certificates, validation letters, etc.
        </p>
        <FileUpload section="accreditation" onUpload={handleFileUpload} />

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
                  📄 Document {index + 1} →
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
