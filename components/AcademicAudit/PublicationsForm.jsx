"use client";

import { useState, useEffect } from "react";
import FileUpload from "./FileUpload";

export default function PublicationsForm({
  data,
  onSave,
  onPrevious,
  isFirstStep,
  isLastStep,
  saving,
}) {
  const [formData, setFormData] = useState({
    journalPublished: false,
    journalISSN: "",
    journalFrequency: "",
    magazinesPublished: [],
    documents: [],
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (data?.publications) {
      setFormData(data.publications);
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
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    let error = null;

    if (formData.journalPublished) {
      if (field === "journalISSN" && !value?.trim()) {
        error = "ISSN number is required";
      } else if (field === "journalISSN" && !/^\d{4}-\d{4}$/.test(value)) {
        error = "Invalid ISSN format (e.g., 2320-6470)";
      } else if (field === "journalFrequency" && !value) {
        error = "Frequency is required";
      }
    }

    setErrors({ ...errors, [field]: error });
    return !error;
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.journalPublished) {
      if (!formData.journalISSN?.trim()) {
        newErrors.journalISSN = "ISSN number is required";
      } else if (!/^\d{4}-\d{4}$/.test(formData.journalISSN)) {
        newErrors.journalISSN = "Invalid ISSN format (e.g., 2320-6470)";
      }

      if (!formData.journalFrequency) {
        newErrors.journalFrequency = "Frequency is required";
      }
    }

    // Validate magazines
    formData.magazinesPublished.forEach((magazine, index) => {
      if (!magazine.name?.trim()) {
        newErrors[`magazine_${index}_name`] = "Magazine name is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddMagazine = () => {
    setFormData({
      ...formData,
      magazinesPublished: [
        ...formData.magazinesPublished,
        { name: "", frequency: "Yearly", type: "Print" },
      ],
    });
  };

  const handleRemoveMagazine = (index) => {
    setFormData({
      ...formData,
      magazinesPublished: formData.magazinesPublished.filter(
        (_, i) => i !== index
      ),
    });
    // Remove related errors
    const newErrors = { ...errors };
    delete newErrors[`magazine_${index}_name`];
    setErrors(newErrors);
  };

  const handleMagazineChange = (index, field, value) => {
    const updated = [...formData.magazinesPublished];
    updated[index][field] = value;
    setFormData({ ...formData, magazinesPublished: updated });

    // Clear error
    if (field === "name" && errors[`magazine_${index}_name`]) {
      const newErrors = { ...errors };
      delete newErrors[`magazine_${index}_name`];
      setErrors(newErrors);
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

  const handleSubmit = async (action) => {
    // Only validate if saving and continuing or final submit
    if (action === "saveAndContinue") {
      if (!validateForm()) {
        // Scroll to first error
        const firstError = document.querySelector('[data-error="true"]');
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }
    }

    try {
      await onSave(formData, action);
    } catch (error) {
      console.error("Error saving publications data:", error);
      alert("Failed to save. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Max Marks: 40</strong> - Provide details of institutional
          publications
        </p>
      </div>

      {/* Journal Publication */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="text-md mb-4 font-semibold text-gray-900">
          Journal Publication
        </h3>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Does the institution publish a journal?
            </label>
            <select
              value={formData.journalPublished}
              onChange={(e) =>
                handleChange("journalPublished", e.target.value === "true")
              }
              className="w-full rounded-lg text-gray-900 border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              aria-label="Journal publication status"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>

          {formData.journalPublished && (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="journalISSN"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    ISSN Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="journalISSN"
                    type="text"
                    value={formData.journalISSN}
                    onChange={(e) =>
                      handleChange("journalISSN", e.target.value)
                    }
                    onBlur={() => handleBlur("journalISSN")}
                    className={`w-full text-gray-900 rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 ${
                      errors.journalISSN
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-indigo-500"
                    }`}
                    placeholder="2320-6470"
                    data-error={!!errors.journalISSN}
                    aria-invalid={!!errors.journalISSN}
                    aria-describedby={
                      errors.journalISSN ? "journalISSN-error" : undefined
                    }
                  />
                  {errors.journalISSN && (
                    <p
                      id="journalISSN-error"
                      className="mt-1 text-sm text-red-600"
                      role="alert"
                    >
                      {errors.journalISSN}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="journalFrequency"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Frequency <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="journalFrequency"
                    value={formData.journalFrequency}
                    onChange={(e) =>
                      handleChange("journalFrequency", e.target.value)
                    }
                    onBlur={() => handleBlur("journalFrequency")}
                    className={`w-full text-gray-900 rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 ${
                      errors.journalFrequency
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-indigo-500"
                    }`}
                    data-error={!!errors.journalFrequency}
                    aria-invalid={!!errors.journalFrequency}
                    aria-describedby={
                      errors.journalFrequency
                        ? "journalFrequency-error"
                        : undefined
                    }
                  >
                    <option value="">Select Frequency</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Half-Yearly">Half-Yearly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                  {errors.journalFrequency && (
                    <p
                      id="journalFrequency-error"
                      className="mt-1 text-sm text-red-600"
                      role="alert"
                    >
                      {errors.journalFrequency}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Magazines and Newsletters */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-md font-semibold text-gray-900">
            Magazines and Newsletters
          </h3>
          <button
            onClick={handleAddMagazine}
            className="rounded-lg bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            type="button"
          >
            + Add Magazine/Newsletter
          </button>
        </div>

        {formData.magazinesPublished.length > 0 ? (
          <div className="space-y-4">
            {formData.magazinesPublished.map((magazine, index) => (
              <div
                key={index}
                className="relative rounded-lg border border-gray-200 bg-white p-4"
              >
                <button
                  onClick={() => handleRemoveMagazine(index)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  type="button"
                  aria-label={`Remove magazine ${index + 1}`}
                >
                  ✕
                </button>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div>
                    <label
                      htmlFor={`magazine-name-${index}`}
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <input
                      id={`magazine-name-${index}`}
                      type="text"
                      value={magazine.name}
                      onChange={(e) =>
                        handleMagazineChange(index, "name", e.target.value)
                      }
                      className={`w-full rounded-lg text-gray-900 border px-3 py-2 focus:border-transparent focus:ring-2 ${
                        errors[`magazine_${index}_name`]
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-indigo-500"
                      }`}
                      placeholder="e.g., Trinity Times"
                      data-error={!!errors[`magazine_${index}_name`]}
                    />
                    {errors[`magazine_${index}_name`] && (
                      <p className="mt-1 text-sm text-red-600" role="alert">
                        {errors[`magazine_${index}_name`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor={`magazine-frequency-${index}`}
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Frequency
                    </label>
                    <select
                      id={`magazine-frequency-${index}`}
                      value={magazine.frequency}
                      onChange={(e) =>
                        handleMagazineChange(index, "frequency", e.target.value)
                      }
                      className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Half-Yearly">Half-Yearly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor={`magazine-type-${index}`}
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Type
                    </label>
                    <select
                      id={`magazine-type-${index}`}
                      value={magazine.type}
                      onChange={(e) =>
                        handleMagazineChange(index, "type", e.target.value)
                      }
                      className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Print">Print</option>
                      <option value="Online">Online</option>
                      <option value="Both">Both (Print & Online)</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-gray-500">
            No magazines added yet
          </p>
        )}
      </div>

      {/* Document Upload */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Upload Supporting Documents
        </label>
        <p className="mb-3 text-sm text-gray-600">
          Upload journal copies, magazine copies, ISSN certificates, etc.
        </p>
        <FileUpload section="publications" onUpload={handleFileUpload} />

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
                  className="text-sm text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  type="button"
                  aria-label={`Remove document ${index + 1}`}
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
          className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          type="button"
        >
          ← Previous
        </button>

        <div className="flex space-x-3">
          <button
            onClick={() => handleSubmit("save")}
            disabled={saving}
            className="rounded-lg bg-gray-600 px-6 py-2 text-white hover:bg-gray-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            type="button"
          >
            {saving ? "Saving..." : "Save Progress"}
          </button>

          <button
            onClick={() => handleSubmit("saveAndContinue")}
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            type="button"
          >
            {saving ? "Saving..." : "Save & Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
