"use client";

import { useState, useEffect } from "react";
import FileUpload from "./FileUpload";

export default function QualityOfTeachersForm({
  data,
  onSave,
  onPrevious,
  isFirstStep,
  isLastStep,
  saving,
}) {
  const [formData, setFormData] = useState({
    teachersWithPhD: 0,
    teachersPursuingPhD: 0,
    publicationsWoSSCOPUS: 0,
    publicationsUGCCARE1: 0,
    publicationsUGCCARE2: 0,
    publicationsOther: 0,
    conferencePublications: {
      indexed: 0,
      withISBN: 0,
      others: 0,
    },
    patentsPublished: 0,
    patentsGranted: 0,
    booksAuthored: 0,
    coursePlanAvailable: false,
    coursesOnLMS: 0,
    classroomsWithICT: 0,
    teachersUsingICT: 100,
    documents: [],
  });

  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (data?.qualityOfTeachers) {
      setFormData(data.qualityOfTeachers);
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleConferenceChange = (field, value) => {
    setFormData({
      ...formData,
      conferencePublications: {
        ...formData.conferencePublications,
        [field]: value,
      },
    });
  };

  const handleFileUpload = (url) => {
    setFormData({
      ...formData,
      documents: [...formData.documents, url],
    });
    setUploadingFile(false);
  };

  const handleRemoveFile = (index) => {
    setFormData({
      ...formData,
      documents: formData.documents.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (action) => {
    // Validation
    if (formData.teachersUsingICT < 0 || formData.teachersUsingICT > 100) {
      alert("Teachers Using ICT must be between 0 and 100%");
      return;
    }

    onSave(formData, action);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Max Marks: 100</strong> - Provide details of teacher
          qualifications and teaching quality
        </p>
      </div>

      {/* PhD Details */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="text-md mb-4 font-semibold text-gray-900">
          PhD Qualifications
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Teachers with PhD (Awarded){" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.teachersWithPhD}
              onChange={(e) => handleChange("teachersWithPhD", e.target.value)}
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="33"
              min="0"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Teachers Pursuing PhD
            </label>
            <input
              type="number"
              value={formData.teachersPursuingPhD}
              onChange={(e) =>
                handleChange("teachersPursuingPhD", e.target.value)
              }
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="12"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Publications */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="text-md mb-4 font-semibold text-gray-900">
          Publications in Journals
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              WoS/SCOPUS/PubMed (UGC CARE Category-II)
            </label>
            <input
              type="number"
              value={formData.publicationsWoSSCOPUS}
              onChange={(e) =>
                handleChange("publicationsWoSSCOPUS", e.target.value)
              }
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="6"
              min="0"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              UGC-CARE Category-I Journals
            </label>
            <input
              type="number"
              value={formData.publicationsUGCCARE1}
              onChange={(e) =>
                handleChange("publicationsUGCCARE1", e.target.value)
              }
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="6"
              min="0"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              UGC-CARE Category-II Journals
            </label>
            <input
              type="number"
              value={formData.publicationsUGCCARE2}
              onChange={(e) =>
                handleChange("publicationsUGCCARE2", e.target.value)
              }
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="0"
              min="0"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Other Referred Journals (with ISSN)
            </label>
            <input
              type="number"
              value={formData.publicationsOther}
              onChange={(e) =>
                handleChange("publicationsOther", e.target.value)
              }
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="71"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Conference Publications */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="text-md mb-4 font-semibold text-gray-900">
          Conference Publications
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Indexed by WoS/SCOPUS
            </label>
            <input
              type="number"
              value={formData.conferencePublications.indexed}
              onChange={(e) =>
                handleConferenceChange("indexed", e.target.value)
              }
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="14"
              min="0"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              With ISBN Number
            </label>
            <input
              type="number"
              value={formData.conferencePublications.withISBN}
              onChange={(e) =>
                handleConferenceChange("withISBN", e.target.value)
              }
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="59"
              min="0"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Others (FDP, Seminars, etc.)
            </label>
            <input
              type="number"
              value={formData.conferencePublications.others}
              onChange={(e) => handleConferenceChange("others", e.target.value)}
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="164"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Patents and Books */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Patents Published
          </label>
          <input
            type="number"
            value={formData.patentsPublished}
            onChange={(e) => handleChange("patentsPublished", e.target.value)}
            className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            placeholder="15"
            min="0"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Patents Granted
          </label>
          <input
            type="number"
            value={formData.patentsGranted}
            onChange={(e) => handleChange("patentsGranted", e.target.value)}
            className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            placeholder="7"
            min="0"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Books/Chapters Authored (with ISBN)
          </label>
          <input
            type="number"
            value={formData.booksAuthored}
            onChange={(e) => handleChange("booksAuthored", e.target.value)}
            className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            placeholder="37"
            min="0"
          />
        </div>
      </div>

      {/* Teaching Infrastructure */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="text-md mb-4 font-semibold text-gray-900">
          Teaching Infrastructure
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Course/Teaching Plan Available
            </label>
            <select
              value={formData.coursePlanAvailable}
              onChange={(e) =>
                handleChange("coursePlanAvailable", e.target.value === "true")
              }
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Courses on LMS
            </label>
            <input
              type="number"
              value={formData.coursesOnLMS}
              onChange={(e) => handleChange("coursesOnLMS", e.target.value)}
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="5"
              min="0"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Classrooms with ICT Facilities
            </label>
            <input
              type="number"
              value={formData.classroomsWithICT}
              onChange={(e) =>
                handleChange("classroomsWithICT", e.target.value)
              }
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="28"
              min="0"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Teachers Using ICT (%)
            </label>
            <input
              type="number"
              value={formData.teachersUsingICT}
              onChange={(e) => {
                const value = Math.min(
                  100,
                  Math.max(0, parseInt(e.target.value) || 0),
                );
                handleChange("teachersUsingICT", value);
              }}
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="100"
              min="0"
              max="100"
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
          Upload publication lists, patent certificates, PhD certificates,
          course plans, LMS screenshots, ICT facility photos, etc. (PDF, JPG,
          PNG - Max 10MB each)
        </p>
        <FileUpload section="quality-of-teachers" onUpload={handleFileUpload} />

        {uploadingFile && (
          <p className="mt-2 animate-pulse text-sm text-indigo-600">
            Uploading document...
          </p>
        )}

        {formData.documents.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Uploaded Documents ({formData.documents.length})
            </p>
            {formData.documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
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
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  Document {index + 1}
                </a>
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
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between border-t pt-6">
        <button
          onClick={onPrevious}
          disabled={isFirstStep}
          className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
        >
          ← Previous
        </button>

        <div className="flex space-x-3">
          <button
            onClick={() => handleSubmit("save")}
            disabled={saving}
            className="rounded-lg bg-gray-600 px-6 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
            type="button"
          >
            {saving ? "Saving..." : "Save Progress"}
          </button>

          <button
            onClick={() => handleSubmit("saveAndContinue")}
            disabled={saving}
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
