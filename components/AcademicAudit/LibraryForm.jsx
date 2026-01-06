"use client";

import { useState, useEffect } from "react";
import FileUpload from "./FileUpload";

export default function LibraryForm({
  data,
  onSave,
  onPrevious,
  isFirstStep,
  isLastStep,
  saving,
}) {
  const [formData, setFormData] = useState({
    totalBooksAdded: 0,
    totalVolumesAdded: 0,
    programWiseBooks: [],
    journalsAdded: 0,
    journalsDiscontinued: 0,
    indianJournals: 0,
    internationalJournals: 0,
    documents: [],
  });

  useEffect(() => {
    if (data?.library) {
      setFormData(data.library);
    } else if (data?.academicPrograms && data.academicPrograms.length > 0) {
      // ✅ Fixed: Use functional setState to avoid formData dependency
      setFormData((prev) => {
        // Only initialize if programWiseBooks is empty
        if (prev.programWiseBooks.length === 0) {
          const programBooks = data.academicPrograms.map((prog) => ({
            programme: prog.programme,
            titles: 0,
            volumes: 0,
            score: 0,
          }));
          return { ...prev, programWiseBooks: programBooks };
        }
        return prev;
      });
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleProgramChange = (index, field, value) => {
    const updated = [...formData.programWiseBooks];
    updated[index][field] = parseFloat(value) || 0;

    // Calculate score (titles * volumes)
    if (field === "titles" || field === "volumes") {
      updated[index].score = updated[index].titles * updated[index].volumes;
    }

    setFormData({ ...formData, programWiseBooks: updated });
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
    onSave(formData, action);
  };

  const totalScore = formData.programWiseBooks.reduce(
    (sum, prog) => sum + (prog.score || 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Max Marks: 100</strong> - Provide details of library books and
          journals
        </p>
      </div>

      {/* Books Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Total Books Added During the Year{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.totalBooksAdded}
            onChange={(e) => handleChange("totalBooksAdded", e.target.value)}
            className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            placeholder="1144"
            min="0"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Total Volumes Added During the Year{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.totalVolumesAdded}
            onChange={(e) => handleChange("totalVolumesAdded", e.target.value)}
            className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            placeholder="1144"
            min="0"
            required
          />
        </div>
      </div>

      {/* Program-wise Books */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="text-md mb-4 font-semibold text-gray-900">
          Program-wise Books
        </h3>

        {formData.programWiseBooks.length > 0 ? (
          <div className="space-y-4">
            {formData.programWiseBooks.map((program, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <h4 className="mb-3 text-sm font-semibold text-gray-900">
                  {program.programme}
                </h4>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Titles
                    </label>
                    <input
                      type="number"
                      value={program.titles}
                      onChange={(e) =>
                        handleProgramChange(index, "titles", e.target.value)
                      }
                      className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                      placeholder="597"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Volumes
                    </label>
                    <input
                      type="number"
                      value={program.volumes}
                      onChange={(e) =>
                        handleProgramChange(index, "volumes", e.target.value)
                      }
                      className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                      placeholder="4594"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Score (Titles × Volumes)
                    </label>
                    <input
                      type="number"
                      value={program.score}
                      className="w-full text-gray-900 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2"
                      disabled
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-yellow-50 p-4 text-center">
            <p className="text-sm text-yellow-800">
              No programs found. Please complete Academic Programs section
              first.
            </p>
          </div>
        )}

        <div className="mt-4 rounded-lg bg-indigo-50 p-4">
          <p className="text-sm font-medium text-indigo-900">
            Total Score: <span className="text-lg font-bold">{totalScore}</span>
          </p>
        </div>
      </div>

      {/* Journals */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="text-md mb-4 font-semibold text-gray-900">Journals</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Journals Added During the Year
            </label>
            <input
              type="number"
              value={formData.journalsAdded}
              onChange={(e) => handleChange("journalsAdded", e.target.value)}
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="6"
              min="0"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Journals Discontinued
            </label>
            <input
              type="number"
              value={formData.journalsDiscontinued}
              onChange={(e) =>
                handleChange("journalsDiscontinued", e.target.value)
              }
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="0"
              min="0"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Indian Journals <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.indianJournals}
              onChange={(e) => handleChange("indianJournals", e.target.value)}
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="41"
              min="0"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Ratio: {formData.indianJournals}/12 ={" "}
              {(formData.indianJournals / 12).toFixed(2)}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              International Journals <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.internationalJournals}
              onChange={(e) =>
                handleChange("internationalJournals", e.target.value)
              }
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="17"
              min="0"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Ratio: {formData.internationalJournals}/3 ={" "}
              {(formData.internationalJournals / 3).toFixed(2)} (Cap: 10)
            </p>
          </div>
        </div>
      </div>

      {/* Document Upload */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Upload Supporting Documents
        </label>
        <p className="mb-3 text-sm text-gray-600">
          Upload library book list, journal list, accession register, etc.
        </p>
        <FileUpload section="library" onUpload={handleFileUpload} />

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
