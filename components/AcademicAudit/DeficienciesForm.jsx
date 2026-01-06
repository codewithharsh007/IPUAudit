"use client";

import { useState, useEffect, useCallback } from "react";
import FileUpload from "./FileUpload";

export default function DeficienciesForm({
  data,
  onSave,
  onPrevious,
  isFirstStep,
  isLastStep,
  saving,
}) {
  const [formData, setFormData] = useState({
    deficienciesIdentified: 0,
    deficienciesRemoved: 0,
    deficiencyList: [],
    documents: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (data?.deficiencies) {
      setFormData(data.deficiencies);
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleAddDeficiency = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      deficiencyList: [
        ...prev.deficiencyList,
        { deficiency: "", status: "Pending", actionTaken: "" },
      ],
    }));
  }, []);

  const handleRemoveDeficiency = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      deficiencyList: prev.deficiencyList.filter((_, i) => i !== index),
    }));
  }, []);

  const handleDeficiencyChange = useCallback((index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.deficiencyList];
      updated[index][field] = value;
      return { ...prev, deficiencyList: updated };
    });
  }, []);

  const handleFileUpload = useCallback((url) => {
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, url],
    }));
  }, []);

  const handleRemoveFile = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  }, []);

  const validateForm = () => {
    const newErrors = {};

    // Check if deficiencies identified but no list provided
    if (
      formData.deficienciesIdentified > 0 &&
      formData.deficiencyList.length === 0
    ) {
      newErrors.deficiencyList =
        "Please add deficiency details or set identified count to 0";
    }

    // Check if deficiency count matches list length
    if (
      formData.deficienciesIdentified > 0 &&
      formData.deficiencyList.length !== Number(formData.deficienciesIdentified)
    ) {
      newErrors.deficiencyCount = `You entered ${formData.deficienciesIdentified} deficiencies but only added ${formData.deficiencyList.length} in the list`;
    }

    // Validate each deficiency in the list
    formData.deficiencyList.forEach((def, index) => {
      if (!def.deficiency.trim()) {
        newErrors[`deficiency_${index}`] = "Description is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (action) => {
    // Only validate on saveAndContinue
    if (action === "saveAndContinue" && !validateForm()) {
      // Show first error
      const firstError = Object.values(errors)[0];
      alert(firstError || "Please fix the errors before continuing");
      return;
    }

    onSave(formData, action);
  };

  const completedDeficiencies = formData.deficiencyList.filter(
    (d) => d.status === "Completed",
  ).length;

  return (
    <div className="space-y-6">
      <div className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Max Marks: 50</strong> - Provide details of deficiencies from
          previous audit and their removal/completion
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Deficiencies Identified in Last Report
          </label>
          <input
            type="number"
            value={formData.deficienciesIdentified}
            onChange={(e) =>
              handleChange("deficienciesIdentified", e.target.value)
            }
            className={`w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
              errors.deficiencyCount
                ? "border-red-300 bg-red-50"
                : "border-gray-300"
            }`}
            placeholder="0"
            min="0"
          />
          {errors.deficiencyCount && (
            <p className="mt-1 text-xs text-red-600">
              {errors.deficiencyCount}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Deficiencies Removed/Completed
          </label>
          <input
            type="number"
            value={completedDeficiencies}
            className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2"
            disabled
          />
          <p className="mt-1 text-xs text-gray-500">
            Auto-calculated from list below
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-indigo-50 p-4">
          <label className="mb-2 block text-sm font-medium text-indigo-900">
            Completion Rate
          </label>
          <div className="text-2xl font-bold text-indigo-600">
            {formData.deficienciesIdentified > 0
              ? (
                  (completedDeficiencies / formData.deficienciesIdentified) *
                  100
                ).toFixed(1)
              : 0}
            %
          </div>
        </div>
      </div>

      {/* Deficiency List */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-md font-semibold text-gray-900">
              Deficiency Details
            </h3>
            {errors.deficiencyList && (
              <p className="mt-1 text-xs text-red-600">
                {errors.deficiencyList}
              </p>
            )}
          </div>
          <button
            onClick={handleAddDeficiency}
            type="button"
            className="rounded-lg bg-indigo-600 px-3 py-1 text-sm text-white transition-colors hover:bg-indigo-700"
          >
            + Add Deficiency
          </button>
        </div>

        {formData.deficiencyList.length > 0 ? (
          <div className="space-y-4">
            {formData.deficiencyList.map((deficiency, index) => (
              <div
                key={index}
                className="relative rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <button
                  onClick={() => handleRemoveDeficiency(index)}
                  type="button"
                  className="absolute top-2 right-2 text-red-600 transition-colors hover:text-red-800"
                  aria-label="Remove deficiency"
                >
                  ✕
                </button>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Deficiency Description{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={deficiency.deficiency}
                      onChange={(e) =>
                        handleDeficiencyChange(
                          index,
                          "deficiency",
                          e.target.value,
                        )
                      }
                      className={`w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                        errors[`deficiency_${index}`]
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g., Insufficient laboratory equipment, lack of proper library books, etc."
                      rows="2"
                      required
                    />
                    {errors[`deficiency_${index}`] && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors[`deficiency_${index}`]}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        value={deficiency.status}
                        onChange={(e) =>
                          handleDeficiencyChange(
                            index,
                            "status",
                            e.target.value,
                          )
                        }
                        className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Action Taken
                      </label>
                      <input
                        type="text"
                        value={deficiency.actionTaken}
                        onChange={(e) =>
                          handleDeficiencyChange(
                            index,
                            "actionTaken",
                            e.target.value,
                          )
                        }
                        className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., Purchased equipment, renovated labs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="mb-2 text-sm text-gray-500">
              No deficiencies added yet
            </p>
            <p className="text-xs text-gray-400">
              If this is your first audit or no deficiencies were identified,
              you can skip this section
            </p>
          </div>
        )}
      </div>

      {/* Document Upload */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Upload Supporting Documents
        </label>
        <p className="mb-3 text-sm text-gray-600">
          Upload previous audit report, action taken reports, purchase bills,
          photos of completed work, etc.
        </p>
        <FileUpload section="deficiencies" onUpload={handleFileUpload} />

        {formData.documents.length > 0 && (
          <div className="mt-3 space-y-2">
            {formData.documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
              >
                <a
                  href={doc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Document {index + 1}
                </a>
                <button
                  onClick={() => handleRemoveFile(index)}
                  type="button"
                  className="text-sm text-red-600 transition-colors hover:text-red-800"
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
          type="button"
          disabled={isFirstStep}
          className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← Previous
        </button>

        <div className="flex space-x-3">
          <button
            onClick={() => handleSubmit("save")}
            type="button"
            disabled={saving}
            className="rounded-lg bg-gray-600 px-6 py-2 text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Progress"}
          </button>

          <button
            onClick={() => handleSubmit("saveAndContinue")}
            type="button"
            disabled={saving}
            className="rounded-lg bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : isLastStep
                ? "Complete Submission ✓"
                : "Save & Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
