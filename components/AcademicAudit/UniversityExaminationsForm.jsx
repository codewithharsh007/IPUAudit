"use client";

import { useState, useEffect } from "react";
import FileUpload from "./FileUpload";

export default function UniversityExaminationsForm({
  data,
  onSave,
  onPrevious,
  isFirstStep,
  isLastStep,
  saving,
}) {
  const [formData, setFormData] = useState({
    facultyParticipationPercentage: "",
    documents: [],
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (data?.universityExaminations) {
      setFormData(data.universityExaminations);
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validateField(field);
  };

  const validateField = (field) => {
    const newErrors = { ...errors };

    if (field === "facultyParticipationPercentage") {
      const value = parseFloat(formData.facultyParticipationPercentage);

      if (
        !formData.facultyParticipationPercentage &&
        formData.facultyParticipationPercentage !== 0
      ) {
        newErrors.facultyParticipationPercentage =
          "Faculty participation percentage is required";
      } else if (isNaN(value)) {
        newErrors.facultyParticipationPercentage =
          "Please enter a valid number";
      } else if (value < 0 || value > 100) {
        newErrors.facultyParticipationPercentage =
          "Percentage must be between 0 and 100";
      } else {
        delete newErrors.facultyParticipationPercentage;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const isValid = validateField("facultyParticipationPercentage");

    if (!isValid) {
      setTouched({ facultyParticipationPercentage: true });
    }

    return isValid;
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
    if (action === "saveAndContinue") {
      if (!validateForm()) {
        return;
      }

      // Check if at least one document is uploaded
      if (formData.documents.length === 0) {
        const confirmProceed = window.confirm(
          "No supporting documents uploaded. Are you sure you want to continue?",
        );
        if (!confirmProceed) return;
      }
    }

    // Convert percentage to number before saving
    const dataToSave = {
      ...formData,
      facultyParticipationPercentage:
        parseFloat(formData.facultyParticipationPercentage) || 0,
    };

    onSave(dataToSave, action);
  };

  const getInputClassName = (field) => {
    const baseClass =
      "w-32 rounded-lg border px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2";

    if (touched[field] && errors[field]) {
      return `${baseClass} border-red-300 focus:ring-red-500`;
    }

    return `${baseClass} border-gray-300 focus:ring-indigo-500`;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Max Marks: 30</strong> - Provide details of faculty
          participation in university examinations
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <label className="mb-2 block text-sm font-medium text-gray-900">
          Percentage of Faculty Participation in University Examinations{" "}
          <span className="text-red-500">*</span>
        </label>
        <p className="mb-4 text-sm text-gray-600">
          Faculty participation as evaluators/paper setters/university
          representatives during the assessment year
        </p>
        <div className="flex items-center space-x-4">
          <div className="max-w-xs flex-1">
            <input
              type="number"
              value={formData.facultyParticipationPercentage}
              onChange={(e) =>
                handleChange("facultyParticipationPercentage", e.target.value)
              }
              onBlur={() => handleBlur("facultyParticipationPercentage")}
              className={`text-gray-900 ${getInputClassName("facultyParticipationPercentage")}`}
              placeholder="80"
              min="0"
              max="100"
              step="0.01"
              required
            />
            {touched.facultyParticipationPercentage &&
              errors.facultyParticipationPercentage && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.facultyParticipationPercentage}
                </p>
              )}
          </div>
          <span className="text-lg font-medium text-gray-700">%</span>
        </div>

        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
          <h4 className="mb-2 text-sm font-medium text-gray-900">
            Participation Details
          </h4>
          <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
            <li>Paper setters for university examinations</li>
            <li>Evaluators/Examiners for answer sheets</li>
            <li>University representatives in examination committees</li>
            <li>Invigilators for university examinations</li>
          </ul>
        </div>

        {/* Scoring Information */}
        <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
          <h4 className="mb-2 text-sm font-semibold text-indigo-900">
            📊 Scoring Guide
          </h4>
          <div className="space-y-1 text-xs text-indigo-800">
            <p>• 100% participation = 30 marks</p>
            <p>• 80-99% participation = 24-29 marks</p>
            <p>• 60-79% participation = 18-23 marks</p>
            <p>• Below 60% = Proportional marks</p>
          </div>
        </div>
      </div>

      {/* Document Upload */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Upload Supporting Documents
        </label>
        <p className="mb-3 text-sm text-gray-600">
          Upload list of faculty members who participated in university
          examinations with their roles (Excel sheet, PDF, or scanned copies of
          appointment letters)
        </p>
        <FileUpload
          section="university-examinations"
          onUpload={handleFileUpload}
        />

        {formData.documents.length > 0 && (
          <div className="mt-3 space-y-2">
            {formData.documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
              >
                <div className="flex items-center space-x-2">
                  <svg
                    className="h-5 w-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <a
                    href={doc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 underline hover:text-indigo-800"
                  >
                    Document {index + 1}
                  </a>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="text-sm font-medium text-red-600 hover:text-red-800"
                  type="button"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {formData.documents.length === 0 && (
          <div className="mt-2 flex items-center space-x-1 text-sm text-amber-600">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              No documents uploaded yet. Please upload supporting documents.
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between border-t pt-6">
        <button
          onClick={onPrevious}
          disabled={isFirstStep || saving}
          className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
        >
          ← Previous
        </button>

        <div className="flex space-x-3">
          <button
            onClick={() => handleSubmit("save")}
            disabled={saving}
            className="rounded-lg bg-gray-600 px-6 py-2 text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
          >
            {saving ? "Saving..." : "Save Progress"}
          </button>

          <button
            onClick={() => handleSubmit("saveAndContinue")}
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
          >
            {saving ? "Saving..." : "Save & Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
