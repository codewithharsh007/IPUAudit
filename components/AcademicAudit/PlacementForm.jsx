"use client";

import { useState, useEffect } from "react";
import FileUpload from "./FileUpload";

export default function PlacementForm({
  data,
  onSave,
  onPrevious,
  isFirstStep,
  isLastStep,
  saving,
}) {
  const [formData, setFormData] = useState({
    totalPassedOut: 0,
    eligibleAndRegistered: 0,
    goingForHigherEducation: 0,
    studentsPlaced: 0,
    startups: 0,
    totalPlacedAndHigherEd: 0,
    placementPercentage: 0,
    companiesVisited: 0,
    averageSalary: "",
    tpoOfficeExists: false,
    entrepreneurshipActivities: 0,
    documents: [],
  });

  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (data?.placement) {
      setFormData(data.placement);
    }
  }, [data]);

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };

    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }

    // Auto-calculate totals
    const higherEd = parseInt(updated.goingForHigherEducation || 0);
    const placed = parseInt(updated.studentsPlaced || 0);
    updated.totalPlacedAndHigherEd = higherEd + placed;

    // Auto-calculate placement percentage
    const eligible = parseInt(updated.eligibleAndRegistered || 0);
    updated.placementPercentage =
      eligible > 0
        ? ((updated.totalPlacedAndHigherEd / eligible) * 100).toFixed(2)
        : 0;

    setFormData(updated);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.totalPassedOut || formData.totalPassedOut <= 0) {
      newErrors.totalPassedOut = "Total students passed out is required";
    }

    if (
      !formData.eligibleAndRegistered ||
      formData.eligibleAndRegistered <= 0
    ) {
      newErrors.eligibleAndRegistered =
        "Number of eligible students is required";
    }

    if (!formData.studentsPlaced && formData.studentsPlaced !== 0) {
      newErrors.studentsPlaced = "Number of students placed is required";
    }

    // Logical validations
    if (
      parseInt(formData.eligibleAndRegistered) >
      parseInt(formData.totalPassedOut)
    ) {
      newErrors.eligibleAndRegistered =
        "Cannot exceed total passed out students";
    }

    if (
      parseInt(formData.studentsPlaced) >
      parseInt(formData.eligibleAndRegistered)
    ) {
      newErrors.studentsPlaced = "Cannot exceed eligible students";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (url) => {
    setUploading(true);
    try {
      setFormData({
        ...formData,
        documents: [...formData.documents, url],
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index) => {
    setFormData({
      ...formData,
      documents: formData.documents.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (action) => {
    if (!validateForm()) {
      return;
    }
    onSave(formData, action);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Max Marks: 60</strong> - Provide placement and higher
          education details
        </p>
      </div>

      {/* Placement Statistics */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="text-md mb-4 font-semibold text-gray-900">
          Placement Statistics
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Total Students Passed Out (Assessment Year){" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.totalPassedOut}
              onChange={(e) =>
                handleChange(
                  "totalPassedOut",
                  Math.max(0, parseInt(e.target.value) || 0),
                )
              }
              className={`w-full rounded-lg border ${errors.totalPassedOut ? "border-red-500" : "border-gray-300"} px-3 py-2 focus:border-transparent text-gray-900 focus:ring-2 focus:ring-indigo-500`}
              placeholder="538"
              min="0"
              step="1"
              required
            />
            {errors.totalPassedOut && (
              <p className="mt-1 text-xs text-red-600">
                {errors.totalPassedOut}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Eligible and Registered for Placement{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.eligibleAndRegistered}
              onChange={(e) =>
                handleChange(
                  "eligibleAndRegistered",
                  Math.max(0, parseInt(e.target.value) || 0),
                )
              }
              className={`w-full rounded-lg border ${errors.eligibleAndRegistered ? "border-red-500" : "border-gray-300"} text-gray-900 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500`}
              placeholder="220"
              min="0"
              step="1"
              required
            />
            {errors.eligibleAndRegistered && (
              <p className="mt-1 text-xs text-red-600">
                {errors.eligibleAndRegistered}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Students Going for Higher Education
            </label>
            <input
              type="number"
              value={formData.goingForHigherEducation}
              onChange={(e) =>
                handleChange(
                  "goingForHigherEducation",
                  Math.max(0, parseInt(e.target.value) || 0),
                )
              }
              className="w-full rounded-lg text-gray-900 border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="176"
              min="0"
              step="1"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Students Placed <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.studentsPlaced}
              onChange={(e) =>
                handleChange(
                  "studentsPlaced",
                  Math.max(0, parseInt(e.target.value) || 0),
                )
              }
              className={`w-full rounded-lg text-gray-900 border ${errors.studentsPlaced ? "border-red-500" : "border-gray-300"} px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500`}
              placeholder="218"
              min="0"
              step="1"
              required
            />
            {errors.studentsPlaced && (
              <p className="mt-1 text-xs text-red-600">
                {errors.studentsPlaced}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Students Moving for Startup/Family Business
            </label>
            <input
              type="number"
              value={formData.startups}
              onChange={(e) =>
                handleChange(
                  "startups",
                  Math.max(0, parseInt(e.target.value) || 0),
                )
              }
              className="w-full rounded-lg text-gray-900 border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="142"
              min="0"
              step="1"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Total (Placed + Higher Education)
            </label>
            <input
              type="number"
              value={formData.totalPlacedAndHigherEd}
              className="w-full text-gray-900 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2"
              disabled
              readOnly
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Placement + Higher Education Percentage
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={formData.placementPercentage}
                className="w-32 text-gray-900 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2"
                disabled
                readOnly
              />
              <span className="ml-2 text-lg font-medium text-gray-700">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Company and Salary Details */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Number of Companies Visited Campus
          </label>
          <input
            type="number"
            value={formData.companiesVisited}
            onChange={(e) =>
              handleChange(
                "companiesVisited",
                Math.max(0, parseInt(e.target.value) || 0),
              )
            }
            className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            placeholder="97"
            min="0"
            step="1"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Average Salary Offered (LPA)
          </label>
          <input
            type="text"
            value={formData.averageSalary}
            onChange={(e) => handleChange("averageSalary", e.target.value)}
            className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            placeholder="4.5 LPA"
          />
        </div>
      </div>

      {/* TPO and Entrepreneurship */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="text-md mb-4 font-semibold text-gray-900">
          Training & Placement Office and Entrepreneurship
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Existence of TPO with TP Officer
              </p>
              <p className="text-xs text-gray-500">
                Dedicated Training & Placement Office
              </p>
            </div>
            <select
              value={formData.tpoOfficeExists}
              onChange={(e) =>
                handleChange("tpoOfficeExists", e.target.value === "true")
              }
              className="rounded-lg text-gray-900 border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Number of Entrepreneurship Activities/Startups Conducted
            </label>
            <input
              type="number"
              value={formData.entrepreneurshipActivities}
              onChange={(e) =>
                handleChange(
                  "entrepreneurshipActivities",
                  Math.max(0, parseInt(e.target.value) || 0),
                )
              }
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="10"
              min="0"
              step="1"
            />
          </div>
        </div>
      </div>

      {/* Document Upload */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Upload Supporting Documents
        </label>
        <p className="mb-3 text-sm text-gray-600">
          Upload student-wise placement list, offer letters, company visit
          reports, etc.
        </p>
        <FileUpload
          section="placement"
          onUpload={handleFileUpload}
          disabled={uploading}
        />

        {uploading && (
          <p className="mt-2 text-sm text-indigo-600">Uploading file...</p>
        )}

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
                  type="button"
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
          type="button"
          className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← Previous
        </button>

        <div className="flex space-x-3">
          <button
            onClick={() => handleSubmit("save")}
            disabled={saving}
            type="button"
            className="rounded-lg bg-gray-600 px-6 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Progress"}
          </button>

          <button
            onClick={() => handleSubmit("saveAndContinue")}
            disabled={saving}
            type="button"
            className="rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save & Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
