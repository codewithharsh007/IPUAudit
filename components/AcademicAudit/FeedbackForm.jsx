"use client";

import { useState, useEffect } from "react";
import FileUpload from "./FileUpload";

export default function FeedbackForm({
  data,
  onSave,
  onPrevious,
  isFirstStep,
  isLastStep,
  saving,
}) {
  const [formData, setFormData] = useState({
    facultyFeedback: {
      collected: false,
      analysed: false,
      actionTaken: false,
    },
    employerFeedback: {
      collected: false,
      analysed: false,
      actionTaken: false,
    },
    studentFeedback: {
      collected: false,
      analysed: false,
      actionTaken: false,
    },
    alumniFeedback: {
      collected: false,
      analysed: false,
      actionTaken: false,
    },
    documents: [],
  });

  useEffect(() => {
    if (data?.feedback) {
      setFormData({
        ...formData,
        ...data.feedback,
        documents: data.feedback.documents || [], // ✅ Safety check
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]); // ✅ Correct dependency

  const handleFeedbackChange = (category, field, value) => {
    setFormData((prev) => ({
      // ✅ Using functional update
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleFileUpload = (url) => {
    setFormData((prev) => ({
      // ✅ Using functional update
      ...prev,
      documents: [...(prev.documents || []), url],
    }));
  };

  const handleRemoveFile = (index) => {
    setFormData((prev) => ({
      // ✅ Using functional update
      ...prev,
      documents: (prev.documents || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (action) => {
    onSave(formData, action);
  };

  const FeedbackSection = ({ title, category, description }) => (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
      <h3 className="text-md mb-2 font-semibold text-gray-900">{title}</h3>
      <p className="mb-4 text-xs text-gray-600">{description}</p>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
          <span className="text-sm text-gray-700">Feedback Collected</span>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={formData[category]?.collected === true}
                onChange={() =>
                  handleFeedbackChange(category, "collected", true)
                }
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={formData[category]?.collected === false}
                onChange={() =>
                  handleFeedbackChange(category, "collected", false)
                }
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">No</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
          <span className="text-sm text-gray-700">Feedback Analysed</span>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={formData[category]?.analysed === true}
                onChange={() =>
                  handleFeedbackChange(category, "analysed", true)
                }
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                disabled={!formData[category]?.collected}
              />
              <span className="ml-2 text-sm text-gray-700">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={formData[category]?.analysed === false}
                onChange={() =>
                  handleFeedbackChange(category, "analysed", false)
                }
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                disabled={!formData[category]?.collected}
              />
              <span className="ml-2 text-sm text-gray-700">No</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
          <span className="text-sm text-gray-700">Action Taken</span>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={formData[category]?.actionTaken === true}
                onChange={() =>
                  handleFeedbackChange(category, "actionTaken", true)
                }
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                disabled={!formData[category]?.analysed}
              />
              <span className="ml-2 text-sm text-gray-700">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={formData[category]?.actionTaken === false}
                onChange={() =>
                  handleFeedbackChange(category, "actionTaken", false)
                }
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                disabled={!formData[category]?.analysed}
              />
              <span className="ml-2 text-sm text-gray-700">No</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Max Marks: 50</strong> - Provide feedback collection and
          action details
        </p>
      </div>

      <FeedbackSection
        title="Feedback from Faculty"
        category="facultyFeedback"
        description="Parameters: salary as per norms, leaves, research facility, recognition, respect, promotions, and overall academic environment"
      />

      <FeedbackSection
        title="Feedback from Employers"
        category="employerFeedback"
        description="Parameters: quality of graduates, skills, work readiness, and overall satisfaction with student placements"
      />

      <FeedbackSection
        title="Feedback from Students"
        category="studentFeedback"
        description="Parameters: teaching environment, regularity of classes, availability of teachers, extra-curricular activities, administrative support, career guidance, counselling, training and placements"
      />

      <FeedbackSection
        title="Feedback from Alumni"
        category="alumniFeedback"
        description="Parameters: quality of education received, career preparedness, networking opportunities, and continued engagement"
      />

      {/* Document Upload */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Upload Supporting Documents
        </label>
        <p className="mb-3 text-sm text-gray-600">
          Upload feedback forms, analysis reports, action taken reports, survey
          results, etc.
        </p>
        <FileUpload section="feedback" onUpload={handleFileUpload} />

        {formData.documents?.length > 0 && (
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
