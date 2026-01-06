"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SummaryReviewForm({
  data,
  onPrevious,
  onSubmit,
  saving,
  auditId, // Add this prop to handle the actual audit ID
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const sections = [
    { key: "academicPrograms", title: "Academic Programs", maxMarks: 0, required: true },
    { key: "accreditation", title: "Accreditation Status", maxMarks: 50, required: true },
    { key: "teachersAvailability", title: "Teachers Availability", maxMarks: 115, required: true },
    { key: "qualityOfTeachers", title: "Quality of Teachers", maxMarks: 100, required: true },
    { key: "facultyDevelopment", title: "Faculty Development", maxMarks: 40, required: false },
    { key: "grievanceRedressal", title: "Grievance Redressal", maxMarks: 100, required: true },
    { key: "universityExaminations", title: "University Examinations", maxMarks: 30, required: false },
    { key: "library", title: "Library", maxMarks: 100, required: true },
    { key: "laboratories", title: "Laboratories", maxMarks: 100, required: true },
    { key: "coCurricularActivities", title: "Co-Curricular Activities", maxMarks: 100, required: false },
    { key: "publications", title: "Publications", maxMarks: 40, required: false },
    { key: "studentDevelopment", title: "Student Development", maxMarks: 35, required: false },
    { key: "placement", title: "Placement", maxMarks: 60, required: true },
    { key: "generalParameters", title: "General Parameters", maxMarks: 30, required: true },
    { key: "feedback", title: "Feedback", maxMarks: 50, required: false },
    { key: "deficiencies", title: "Deficiencies", maxMarks: 50, required: false },
  ];

  const getCompletionStatus = (sectionKey) => {
    const sectionData = data?.[sectionKey];
    if (!sectionData) return "Not Started";

    // Check if section has meaningful data
    const hasData = Object.values(sectionData).some((value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "object" && value !== null)
        return Object.keys(value).length > 0;
      if (typeof value === "string") return value.trim() !== "";
      if (typeof value === "number") return value > 0;
      if (typeof value === "boolean") return true; // Booleans are valid data
      return value !== null && value !== undefined;
    });

    return hasData ? "Completed" : "Not Started";
  };

  const validateSubmission = () => {
    const errors = [];

    // Check if PDF is uploaded (alternative to form)
    const hasPDF = data?.directPDFUpload?.uploaded;

    if (hasPDF) {
      return { isValid: true, errors: [] }; // PDF upload bypasses form validation
    }

    // Check required sections
    const requiredSections = sections.filter((s) => s.required);
    const incompleteSections = requiredSections.filter(
      (s) => getCompletionStatus(s.key) !== "Completed"
    );

    if (incompleteSections.length > 0) {
      errors.push({
        type: "required",
        message: `${incompleteSections.length} required section(s) incomplete`,
        sections: incompleteSections.map((s) => s.title),
      });
    }

    // Check if institute info is filled
    if (!data?.instituteInfo?.institutionName) {
      errors.push({
        type: "institute",
        message: "Institute information is incomplete",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const completedSections = sections.filter(
    (s) => getCompletionStatus(s.key) === "Completed"
  ).length;
  const completionPercentage = (
    (completedSections / sections.length) *
    100
  ).toFixed(0);

  const requiredSections = sections.filter((s) => s.required);
  const completedRequiredSections = requiredSections.filter(
    (s) => getCompletionStatus(s.key) === "Completed"
  ).length;

  const handleFinalSubmit = async () => {
    // Validate before submission
    const validation = validateSubmission();

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Confirmation dialog
    const confirmMessage = 
      completedSections < sections.length
        ? `You have completed ${completedSections} out of ${sections.length} sections. Are you sure you want to submit?`
        : "Are you sure you want to submit this academic audit? You cannot edit it after submission.";

    const confirm = window.confirm(confirmMessage);
    if (!confirm) return;

    setIsSubmitting(true);
    setValidationErrors([]);

    try {
      await onSubmit();
    } catch (error) {
      alert("Submission failed. Please try again.");
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      // Save current state and navigate
      router.push("/college/academic-audit/drafts");
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="rounded-lg border-l-4 border-red-400 bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Please complete the following before submission:
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-inside list-disc space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>
                      {error.message}
                      {error.sections && (
                        <ul className="ml-4 mt-1 list-inside list-circle">
                          {error.sections.map((section, idx) => (
                            <li key={idx}>{section}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
        <h2 className="mb-2 text-2xl font-bold">
          Review Your Academic Audit Submission
        </h2>
        <p className="text-indigo-100">
          Please review all sections before final submission
        </p>
      </div>

      {/* Completion Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-1 text-3xl font-bold text-indigo-600">
            {completedSections}/{sections.length}
          </div>
          <div className="text-sm text-gray-600">Sections Completed</div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-1 text-3xl font-bold text-green-600">
            {completedRequiredSections}/{requiredSections.length}
          </div>
          <div className="text-sm text-gray-600">Required Sections</div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-1 text-3xl font-bold text-purple-600">
            {completionPercentage}%
          </div>
          <div className="text-sm text-gray-600">Overall Progress</div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-1 text-3xl font-bold text-orange-600">1000</div>
          <div className="text-sm text-gray-600">Total Maximum Marks</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Completion Status
          </span>
          <span className="text-sm font-medium text-gray-700">
            {completionPercentage}%
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-gray-200">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* PDF Upload Status */}
      {data?.directPDFUpload?.uploaded && (
        <div className="rounded-lg border-l-4 border-green-400 bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                PDF Uploaded Successfully
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  File: {data.directPDFUpload.fileName} (Uploaded:{" "}
                  {new Date(
                    data.directPDFUpload.uploadedAt
                  ).toLocaleDateString()}
                  )
                </p>
                <p className="mt-1">
                  You can submit directly or continue filling the form sections.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section-wise Status */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Section-wise Status
        </h3>

        <div className="space-y-3">
          {sections.map((section, index) => {
            const status = getCompletionStatus(section.key);
            const isCompleted = status === "Completed";

            return (
              <div
                key={section.key}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                      isCompleted
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isCompleted ? "✓" : index + 1}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {section.title}
                      </h4>
                      {section.required && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                          Required
                        </span>
                      )}
                    </div>
                    {section.maxMarks > 0 && (
                      <p className="text-xs text-gray-500">
                        Max Marks: {section.maxMarks}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      isCompleted
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Important Notes */}
      <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Before Final Submission
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-inside list-disc space-y-1">
                <li>Ensure all required sections are completed</li>
                <li>Verify all data entered is accurate</li>
                <li>Check that all required documents are uploaded</li>
                <li>Once submitted, you cannot edit the form</li>
                <li>You will receive a confirmation email after submission</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col justify-between gap-4 border-t pt-6 sm:flex-row">
        <button
          onClick={onPrevious}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← Previous Section
        </button>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            💾 Save as Draft
          </button>

          <button
            onClick={handleFinalSubmit}
            disabled={isSubmitting || saving}
            className="rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-8 py-2 font-semibold text-white hover:from-green-700 hover:to-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting || saving ? (
              <span className="flex items-center">
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Academic Audit ✓"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
