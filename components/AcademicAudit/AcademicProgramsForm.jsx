"use client";

import { useState, useEffect } from "react";

export default function AcademicProgramsForm({
  data,
  onSave,
  onPrevious,
  isFirstStep,
  isLastStep,
  saving,
}) {
  const [programs, setPrograms] = useState([
    {
      programme: "",
      startYear: "",
      regulatoryBody: "",
      sanctionedIntakeFirstShift: "",
      sanctionedIntakeSecondShift: "",
      totalIntake: 0,
      totalStudents: "",
    },
  ]);

  // Load data from props when component mounts or data changes
  useEffect(() => {
    if (data?.academicPrograms?.length > 0) {
      setPrograms(data.academicPrograms);
    }
  }, [data]);

  const handleAddProgram = () => {
    setPrograms([
      ...programs,
      {
        programme: "",
        startYear: "",
        regulatoryBody: "",
        sanctionedIntakeFirstShift: "",
        sanctionedIntakeSecondShift: "",
        totalIntake: 0,
        totalStudents: "",
      },
    ]);
  };

  const handleRemoveProgram = (index) => {
    if (programs.length > 1) {
      setPrograms(programs.filter((_, i) => i !== index));
    }
  };

  const handleProgramChange = (index, field, value) => {
    const updated = [...programs];
    updated[index][field] = value;

    // Auto-calculate total intake
    if (
      field === "sanctionedIntakeFirstShift" ||
      field === "sanctionedIntakeSecondShift"
    ) {
      const firstShift =
        parseInt(updated[index].sanctionedIntakeFirstShift) || 0;
      const secondShift =
        parseInt(updated[index].sanctionedIntakeSecondShift) || 0;
      updated[index].totalIntake = firstShift + secondShift;
    }

    setPrograms(updated);
  };

  const handleSubmit = (action) => {
    // Validate that at least one program is filled
    const hasValidProgram = programs.some(
      (p) =>
        p.programme &&
        p.startYear &&
        p.regulatoryBody &&
        p.sanctionedIntakeFirstShift &&
        p.totalStudents,
    );

    if (!hasValidProgram) {
      alert("Please fill in at least one complete program before saving.");
      return;
    }

    onSave(programs, action);
  };

  const programOptions = [
    "BBA(G)",
    "B.Com(H)",
    "BCA",
    "BA(JMC)",
    "BALLB(H)",
    "MBA",
    "M.Tech",
    "MCA",
    "Other",
  ];

  const regulatoryBodies = ["AICTE", "BCI", "UGC", "NCTE", "COA", "NMC", "N/A"];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Section B: Academic Programmes</strong> - Provide details of
          all academic programs offered
        </p>
      </div>

      {programs.map((program, index) => (
        <div
          key={index}
          className="relative rounded-lg border border-gray-200 bg-gray-50 p-6"
        >
          {programs.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveProgram(index)}
              className="absolute top-4 right-4 text-red-600 hover:text-red-800"
              aria-label="Remove program"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Program {index + 1}
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Programme Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Programme Name <span className="text-red-500">*</span>
              </label>
              <select
                value={program.programme}
                onChange={(e) =>
                  handleProgramChange(index, "programme", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500 text-gray-900"
                required
              >
                <option value="">Select Programme</option>
                {programOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Year */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Start Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={program.startYear}
                onChange={(e) =>
                  handleProgramChange(index, "startYear", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500 text-gray-900"
                placeholder="2007"
                min="1900"
                max="2099"
                required
              />
            </div>

            {/* Regulatory Body */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Regulatory Body <span className="text-red-500">*</span>
              </label>
              <select
                value={program.regulatoryBody}
                onChange={(e) =>
                  handleProgramChange(index, "regulatoryBody", e.target.value)
                }
                className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select Regulatory Body</option>
                {regulatoryBodies.map((body) => (
                  <option key={body} value={body}>
                    {body}
                  </option>
                ))}
              </select>
            </div>

            {/* Sanctioned Intake - First Shift */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Sanctioned Intake (1st Shift){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={program.sanctionedIntakeFirstShift}
                onChange={(e) =>
                  handleProgramChange(
                    index,
                    "sanctionedIntakeFirstShift",
                    e.target.value,
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500 text-gray-900"
                placeholder="120"
                min="0"
                required
              />
            </div>

            {/* Sanctioned Intake - Second Shift */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Sanctioned Intake (2nd Shift)
              </label>
              <input
                type="number"
                value={program.sanctionedIntakeSecondShift}
                onChange={(e) =>
                  handleProgramChange(
                    index,
                    "sanctionedIntakeSecondShift",
                    e.target.value,
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500 text-gray-900"
                placeholder="0"
                min="0"
              />
            </div>

            {/* Total Intake (Auto-calculated) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Total Intake
              </label>
              <input
                type="number"
                value={program.totalIntake}
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-900"
                disabled
                readOnly
              />
            </div>

            {/* Total Students */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Total Students (All Years){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={program.totalStudents}
                onChange={(e) =>
                  handleProgramChange(index, "totalStudents", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500 text-gray-900"
                placeholder="681"
                min="0"
                required
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add Program Button */}
      <button
        type="button"
        onClick={handleAddProgram}
        className="w-full rounded-lg border-2 border-dashed border-gray-300 py-3 text-gray-600 transition-colors hover:border-indigo-500 hover:text-indigo-600"
      >
        + Add Another Program
      </button>

      {/* Action Buttons */}
      <div className="flex justify-between border-t pt-6">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirstStep}
          className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← Previous
        </button>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => handleSubmit("save")}
            disabled={saving}
            className="rounded-lg bg-gray-600 px-6 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Progress"}
          </button>

          <button
            type="button"
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
