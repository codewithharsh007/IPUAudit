"use client";

import { useState, useEffect } from "react";
import FileUpload from "./FileUpload";

const BooleanField = ({
  label,
  field,
  description,
  formData,
  handleChange,
}) => (
  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
    <label className="mb-2 block text-sm font-medium text-gray-900">
      {label}
    </label>
    {description && <p className="mb-3 text-xs text-gray-600">{description}</p>}
    <div className="flex space-x-4">
      <label className="flex items-center">
        <input
          type="radio"
          checked={formData[field] === true}
          onChange={() => handleChange(field, true)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
        />
        <span className="ml-2 text-sm text-gray-700">Yes</span>
      </label>
      <label className="flex items-center">
        <input
          type="radio"
          checked={formData[field] === false}
          onChange={() => handleChange(field, false)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
        />
        <span className="ml-2 text-sm text-gray-700">No</span>
      </label>
    </div>
  </div>
);

export default function GrievanceRedressalForm({
  data,
  onSave,
  onPrevious,
  isFirstStep,
  isLastStep,
  saving,
}) {
  const [formData, setFormData] = useState({
    sgrcAvailable: false,
    studentRepresentative: false,
    documentationMaintained: false,
    psychiatristAvailable: false,
    publishedOnWebsite: false,
    studentsSatisfied: false,
    reportsSentToUniversity: false,
    documents: [],
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (data?.grievanceRedressal) {
      setFormData(data.grievanceRedressal);
    }
  }, [data?.grievanceRedressal]); // Fixed: proper dependency

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (url) => {
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, url],
    }));
  };

  const handleRemoveFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (action) => {
    // Optional: Add validation
    if (action === "saveAndContinue") {
      // Check if at least SGRC availability is answered
      if (
        formData.sgrcAvailable === null ||
        formData.sgrcAvailable === undefined
      ) {
        alert("Please answer if SGRC is available before continuing");
        return;
      }
    }

    onSave(formData, action);
  };

  const isFormValid = () => {
    // At minimum, SGRC availability should be answered
    return (
      formData.sgrcAvailable !== null && formData.sgrcAvailable !== undefined
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Max Marks: 100</strong> - Provide details of Students
          Grievance Redressal Mechanism
        </p>
      </div>

      <BooleanField
        label="Availability of Students' Grievance Redressal Committee (SGRC)"
        field="sgrcAvailable"
        description="SGRC should comply with UGC's Regulations 2012"
        formData={formData}
        handleChange={handleChange}
      />

      <BooleanField
        label="Does the Grievance Redressal Committee have elected student representatives?"
        field="studentRepresentative"
        formData={formData}
        handleChange={handleChange}
      />

      <BooleanField
        label="Is meticulous and verifiable documentation of SGRC proceedings maintained?"
        field="documentationMaintained"
        description="Upload relevant minutes of meetings"
        formData={formData}
        handleChange={handleChange}
      />

      <BooleanField
        label="Availability of Psychiatrist, Psychologist and professional student counsellors"
        field="psychiatristAvailable"
        description="Upload list with schedule and notification"
        formData={formData}
        handleChange={handleChange}
      />

      <BooleanField
        label="Has the institute published/notified prominently the details of SGRC on website?"
        field="publishedOnWebsite"
        formData={formData}
        handleChange={handleChange}
      />

      <BooleanField
        label="Are students satisfied with the effectiveness of the SGRC?"
        field="studentsSatisfied"
        description="Upload survey report if available"
        formData={formData}
        handleChange={handleChange}
      />

      <BooleanField
        label="Are reports of SGRC proceedings sent to the University every semester?"
        field="reportsSentToUniversity"
        formData={formData}
        handleChange={handleChange}
      />

      {/* Document Upload */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Upload Supporting Documents
        </label>
        <p className="mb-3 text-sm text-gray-600">
          Upload SGRC notifications, minutes, counsellor list, survey reports,
          etc.
        </p>
        <FileUpload
          section="grievance-redressal"
          onUpload={handleFileUpload}
          onUploadStart={() => setUploading(true)}
          onUploadEnd={() => setUploading(false)}
        />

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
          disabled={isFirstStep || saving}
          className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
        >
          ← Previous
        </button>

        <div className="flex space-x-3">
          <button
            onClick={() => handleSubmit("save")}
            disabled={saving || uploading}
            className="rounded-lg bg-gray-600 px-6 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
            type="button"
          >
            {saving ? "Saving..." : "Save Progress"}
          </button>

          <button
            onClick={() => handleSubmit("saveAndContinue")}
            disabled={saving || uploading || !isFormValid()}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
            type="button"
          >
            {saving ? "Saving..." : "Save & Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
