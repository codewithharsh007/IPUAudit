"use client";

import { useState, useEffect } from "react";
import FileUpload from "./FileUpload";

export default function FacultyDevelopmentForm({
  data,
  onSave,
  onPrevious,
  isFirstStep,
  isLastStep,
  saving,
}) {
  const [formData, setFormData] = useState({
    teacherAwards: [],
    studyLeaveGrants: 0,
    conferenceAttendanceGrants: 0,
    individualComputingFacilities: true,
    documents: [],
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (data?.facultyDevelopment) {
      setFormData(data.facultyDevelopment);
    }
  }, [data]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Validate teacher awards
    formData.teacherAwards.forEach((award, index) => {
      if (!award.awardName?.trim()) {
        newErrors[`award_${index}_name`] = "Award name is required";
      }
      if (!award.teacherName?.trim()) {
        newErrors[`award_${index}_teacher`] = "Teacher name is required";
      }
      if (award.year < 2000 || award.year > new Date().getFullYear()) {
        newErrors[`award_${index}_year`] = "Invalid year";
      }
    });

    // Validate grants
    if (formData.studyLeaveGrants < 0) {
      newErrors.studyLeaveGrants = "Cannot be negative";
    }
    if (formData.conferenceAttendanceGrants < 0) {
      newErrors.conferenceAttendanceGrants = "Cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setTouched({ ...touched, [field]: true });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleAddAward = () => {
    setFormData({
      ...formData,
      teacherAwards: [
        ...formData.teacherAwards,
        { awardName: "", teacherName: "", year: new Date().getFullYear() },
      ],
    });
  };

  const handleRemoveAward = (index) => {
    setFormData({
      ...formData,
      teacherAwards: formData.teacherAwards.filter((_, i) => i !== index),
    });

    // Clear related errors
    const newErrors = { ...errors };
    delete newErrors[`award_${index}_name`];
    delete newErrors[`award_${index}_teacher`];
    delete newErrors[`award_${index}_year`];
    setErrors(newErrors);
  };

  const handleAwardChange = (index, field, value) => {
    const updated = [...formData.teacherAwards];
    updated[index][field] = value;
    setFormData({ ...formData, teacherAwards: updated });

    // Clear specific error
    const errorKey = `award_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors({ ...errors, [errorKey]: undefined });
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

  const handleSubmit = (action) => {
    // Validate before saving on "Save & Continue"
    if (action === "saveAndContinue") {
      if (!validateForm()) {
        alert("Please fix the errors before continuing");
        return;
      }
    }

    onSave(formData, action);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Max Marks: 40</strong> - Provide details of institutional
          support for faculty development
        </p>
      </div>

      {/* Teacher Awards */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-md font-semibold text-gray-900">
              Teacher Awards
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              National/State/University level awards received by faculty
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddAward}
            className="rounded-lg bg-indigo-600 px-3 py-1 text-sm text-white transition-colors hover:bg-indigo-700"
          >
            + Add Award
          </button>
        </div>

        {formData.teacherAwards.length > 0 ? (
          <div className="space-y-4">
            {formData.teacherAwards.map((award, index) => (
              <div
                key={index}
                className="relative rounded-lg border border-gray-200 bg-white p-4"
              >
                <button
                  type="button"
                  onClick={() => handleRemoveAward(index)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                  aria-label="Remove award"
                >
                  ✕
                </button>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Award Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={award.awardName}
                      onChange={(e) =>
                        handleAwardChange(index, "awardName", e.target.value)
                      }
                      className={`w-full text-gray-900 rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                        errors[`award_${index}_name`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Best Teacher Award"
                    />
                    {errors[`award_${index}_name`] && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors[`award_${index}_name`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Teacher Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={award.teacherName}
                      onChange={(e) =>
                        handleAwardChange(index, "teacherName", e.target.value)
                      }
                      className={`w-full text-gray-900 rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                        errors[`award_${index}_teacher`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Dr. John Doe"
                    />
                    {errors[`award_${index}_teacher`] && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors[`award_${index}_teacher`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Year <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={award.year}
                      onChange={(e) =>
                        handleAwardChange(
                          index,
                          "year",
                          parseInt(e.target.value) || "",
                        )
                      }
                      className={`w-full text-gray-900 rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                        errors[`award_${index}_year`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      min="2000"
                      max={new Date().getFullYear()}
                    />
                    {errors[`award_${index}_year`] && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors[`award_${index}_year`]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="mb-2 text-sm text-gray-500">No awards added yet</p>
            <p className="text-xs text-gray-400">
              {`Click "Add Award" to add faculty awards and recognitions`}
            </p>
          </div>
        )}
      </div>

      {/* Support Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Study Leave Grants (Number of Teachers)
          </label>
          <input
            type="number"
            value={formData.studyLeaveGrants}
            onChange={(e) =>
              handleChange("studyLeaveGrants", parseInt(e.target.value) || 0)
            }
            onBlur={() => setTouched({ ...touched, studyLeaveGrants: true })}
            className={`w-full text-gray-900 rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
              errors.studyLeaveGrants ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="5"
            min="0"
          />
          {errors.studyLeaveGrants && (
            <p className="mt-1 text-xs text-red-600">
              {errors.studyLeaveGrants}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Teachers granted study leave with full pay for higher studies
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Conference Attendance Grants (Number of Teachers)
          </label>
          <input
            type="number"
            value={formData.conferenceAttendanceGrants}
            onChange={(e) =>
              handleChange(
                "conferenceAttendanceGrants",
                parseInt(e.target.value) || 0,
              )
            }
            onBlur={() =>
              setTouched({ ...touched, conferenceAttendanceGrants: true })
            }
            className={`w-full text-gray-900 rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
              errors.conferenceAttendanceGrants
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="25"
            min="0"
          />
          {errors.conferenceAttendanceGrants && (
            <p className="mt-1 text-xs text-red-600">
              {errors.conferenceAttendanceGrants}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Teachers granted funds for attending conferences/seminars/FDPs
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Individual Computing Facilities with Internet
          </label>
          <select
            value={formData.individualComputingFacilities}
            onChange={(e) =>
              handleChange(
                "individualComputingFacilities",
                e.target.value === "true",
              )
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent text-gray-900 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="true">
              Yes - All teachers have individual computing facilities
            </option>
            <option value="false">No - Not all teachers have facilities</option>
          </select>
        </div>
      </div>

      {/* Document Upload */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Upload Supporting Documents
        </label>
        <p className="mb-3 text-sm text-gray-600">
          Upload documents for awards, study leave grants, conference attendance
          grants, etc.
        </p>
        <FileUpload section="faculty-development" onUpload={handleFileUpload} />

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
          disabled={isFirstStep || saving}
          className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← Previous
        </button>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => handleSubmit("save")}
            disabled={saving}
            className="rounded-lg bg-gray-600 px-6 py-2 text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Progress"}
          </button>

          <button
            type="button"
            onClick={() => handleSubmit("saveAndContinue")}
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save & Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
