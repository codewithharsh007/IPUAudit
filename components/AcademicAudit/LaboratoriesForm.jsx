"use client";

import { useState, useEffect } from "react";
import FileUpload from "./FileUpload";

export default function LaboratoriesForm({
  data,
  onSave,
  onPrevious,
  isFirstStep,
  isLastStep,
  saving,
}) {
  const [formData, setFormData] = useState({
    otherLabs: [],
    internetSpeed: "",
    documents: [],
  });

  useEffect(() => {
    if (data?.laboratories) {
      setFormData({
        otherLabs: data.laboratories.otherLabs || [],
        totalComputers: data.laboratories.totalComputers || 0,
        licensedSoftware: data.laboratories.licensedSoftware || 0,
        internetSpeed: data.laboratories.internetSpeed || "",
        documents: data.laboratories.documents || [],
      });
    }
  }, [data]);

  const handleChange = (field, value) => {
    // Convert to number for numeric fields
    const parsedValue = ["totalComputers", "licensedSoftware"].includes(field)
      ? parseInt(value) || 0
      : value;

    setFormData({ ...formData, [field]: parsedValue });
  };

  const handleAddLab = () => {
    setFormData({
      ...formData,
      otherLabs: [
        ...formData.otherLabs,
        { labName: "", instruments: "", upgradation: "" },
      ],
    });
  };

  const handleRemoveLab = (index) => {
    setFormData({
      ...formData,
      otherLabs: formData.otherLabs.filter((_, i) => i !== index),
    });
  };

  const handleLabChange = (index, field, value) => {
    const updated = [...formData.otherLabs];
    updated[index][field] = value;
    setFormData({ ...formData, otherLabs: updated });
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
    // Validate required fields
    if (!formData.totalComputers || formData.totalComputers <= 0) {
      alert("Please enter total computers available");
      return;
    }

    if (!formData.licensedSoftware || formData.licensedSoftware < 0) {
      alert("Please enter number of licensed software");
      return;
    }

    if (!formData.internetSpeed || !formData.internetSpeed.trim()) {
      alert("Please enter internet connectivity details");
      return;
    }

    onSave(formData, action);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Max Marks: 100</strong> - Provide details of laboratory
          facilities
        </p>
      </div>

      {/* Other Labs (Non-Computer) */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-md font-semibold text-gray-900">
            Laboratories (Other than Computer Labs)
          </h3>
          <button
            type="button"
            onClick={handleAddLab}
            className="rounded-lg bg-indigo-600 px-3 py-1 text-sm text-white transition-colors hover:bg-indigo-700"
          >
            + Add Lab
          </button>
        </div>

        {formData.otherLabs.length > 0 ? (
          <div className="space-y-4">
            {formData.otherLabs.map((lab, index) => (
              <div
                key={index}
                className="relative rounded-lg border border-gray-200 bg-white p-4"
              >
                <button
                  type="button"
                  onClick={() => handleRemoveLab(index)}
                  className="absolute top-2 right-2 text-red-600 transition-colors hover:text-red-800"
                  aria-label="Remove lab"
                >
                  ✕
                </button>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Lab Name
                    </label>
                    <input
                      type="text"
                      value={lab.labName}
                      onChange={(e) =>
                        handleLabChange(index, "labName", e.target.value)
                      }
                      className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                      placeholder="Physics Lab, Chemistry Lab, etc."
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Status of Instruments/Equipment
                    </label>
                    <textarea
                      value={lab.instruments}
                      onChange={(e) =>
                        handleLabChange(index, "instruments", e.target.value)
                      }
                      className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                      placeholder="List of available instruments and their condition"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Up-gradation Details
                    </label>
                    <textarea
                      value={lab.upgradation}
                      onChange={(e) =>
                        handleLabChange(index, "upgradation", e.target.value)
                      }
                      className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                      placeholder="Details of new equipment, technological upgrades, etc."
                      rows="2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-gray-500">
            {`No labs added yet. Click "Add Lab" to add one.`}
          </p>
        )}
      </div>

      {/* Computer Labs */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="text-md mb-4 font-semibold text-gray-900">
          Computer Labs
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          UG: 1 computer per 6 students | PG: 1 computer per 3 students (or as
          per statutory body)
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Total Computers Available in Labs{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.totalComputers}
              onChange={(e) => handleChange("totalComputers", e.target.value)}
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="240"
              min="0"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Licensed Software Available{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.licensedSoftware}
              onChange={(e) => handleChange("licensedSoftware", e.target.value)}
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="20"
              min="0"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Number of licensed software as per course curriculum
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Internet Connectivity <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.internetSpeed}
              onChange={(e) => handleChange("internetSpeed", e.target.value)}
              className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Leased Line 200 Mbps, Airtel Broadband 40/100 Mbps (7 Lines)"
              rows="2"
              required
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
          Upload lab photos, equipment list, software licenses, internet bill,
          etc.
        </p>
        <FileUpload section="laboratories" onUpload={handleFileUpload} />

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
                  className="text-sm text-indigo-600 transition-colors hover:text-indigo-800"
                >
                  Document {index + 1} →
                </a>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
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
          type="button"
          onClick={onPrevious}
          disabled={isFirstStep}
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
