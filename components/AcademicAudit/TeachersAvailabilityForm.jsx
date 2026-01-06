/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";

export default function TeachersAvailabilityForm({
  data,
  onSave,
  onPrevious,
  isFirstStep,
  isLastStep,
  saving,
}) {
  const [formData, setFormData] = useState({
    ugStudents: 0,
    pgStudents: 0,
    programWiseTeachers: [],
    totalTeachers: 0,
    visitingFaculty: 0,
  });

  // Initialize form data only once
  useEffect(() => {
    if (data?.teachersAvailability) {
      setFormData(data.teachersAvailability);
    } else if (
      data?.academicPrograms &&
      formData.programWiseTeachers.length === 0
    ) {
      // Initialize from academic programs only if not already initialized
      const programTeachers = data.academicPrograms.map((prog) => ({
        programme: prog.programme,
        duration: getDuration(prog.programme),
        sanctionedIntake: prog.totalIntake,
        requiredTeachers: calculateRequiredTeachers(
          prog.totalIntake,
          getDuration(prog.programme),
        ),
        regularTeachersAvailable: 0,
        assistantProfessors: 0,
        associateProfessors: 0,
        professors: 0,
        studentTeacherRatio: 0,
        cadreRatio: "0:0",
      }));
      setFormData((prev) => ({
        ...prev,
        programWiseTeachers: programTeachers,
      }));
    }
  }, [data?.academicPrograms, data?.teachersAvailability]);

  // Auto-calculate total teachers when program data changes
  useEffect(() => {
    if (formData.programWiseTeachers.length > 0) {
      const total = formData.programWiseTeachers.reduce((sum, prog) => {
        return (
          sum +
          (parseInt(prog.assistantProfessors) || 0) +
          (parseInt(prog.associateProfessors) || 0) +
          (parseInt(prog.professors) || 0)
        );
      }, 0);

      if (total !== formData.totalTeachers) {
        setFormData((prev) => ({ ...prev, totalTeachers: total }));
      }
    }
  }, [formData.programWiseTeachers]);

  const getDuration = (programme) => {
    if (programme.includes("BALLB") || programme.includes("B.A. LL.B"))
      return 5;
    if (programme.includes("M.") || programme.includes("LLM")) return 2;
    if (programme.includes("BCA") || programme.includes("MCA")) return 3;
    return 3;
  };

  const calculateRequiredTeachers = (intake, duration) => {
    const totalStudents = intake * duration;
    return Math.ceil(totalStudents / 20);
  };

  const calculateStudentTeacherRatio = (intake, duration, totalFaculty) => {
    if (totalFaculty === 0) return 0;
    const totalStudents = intake * duration;
    return Math.round(totalStudents / totalFaculty);
  };

  const calculateCadreRatio = (assistant, associate, professor) => {
    const juniorFaculty = parseInt(assistant) || 0;
    const seniorFaculty =
      (parseInt(associate) || 0) + (parseInt(professor) || 0);

    if (seniorFaculty === 0) return "0:0";
    const ratio = Math.round(juniorFaculty / seniorFaculty);
    return `1:${ratio}`;
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleProgramChange = (index, field, value) => {
    const updated = [...formData.programWiseTeachers];
    updated[index][field] = value;

    // Calculate required teachers
    if (field === "sanctionedIntake" || field === "duration") {
      updated[index].requiredTeachers = calculateRequiredTeachers(
        updated[index].sanctionedIntake,
        updated[index].duration,
      );
    }

    // Recalculate all derived values when faculty numbers change
    if (
      field === "assistantProfessors" ||
      field === "associateProfessors" ||
      field === "professors"
    ) {
      const totalFaculty =
        (parseInt(updated[index].assistantProfessors) || 0) +
        (parseInt(updated[index].associateProfessors) || 0) +
        (parseInt(updated[index].professors) || 0);

      // Update student-teacher ratio
      updated[index].studentTeacherRatio = calculateStudentTeacherRatio(
        updated[index].sanctionedIntake,
        updated[index].duration,
        totalFaculty,
      );

      // Update cadre ratio
      updated[index].cadreRatio = calculateCadreRatio(
        updated[index].assistantProfessors,
        updated[index].associateProfessors,
        updated[index].professors,
      );
    }

    setFormData({ ...formData, programWiseTeachers: updated });
  };

  const handleSubmit = (action) => {
    onSave(formData, action);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Max Marks: 115</strong> - Provide details of teacher
          availability and ratios
        </p>
      </div>

      {/* Total Students */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Total UG Students <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.ugStudents}
            onChange={(e) =>
              handleChange("ugStudents", parseInt(e.target.value) || 0)
            }
            className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            placeholder="1851"
            min="0"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Total PG Students
          </label>
          <input
            type="number"
            value={formData.pgStudents}
            onChange={(e) =>
              handleChange("pgStudents", parseInt(e.target.value) || 0)
            }
            className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            placeholder="0"
            min="0"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Total Regular Teachers (Auto-calculated)
          </label>
          <input
            type="number"
            value={formData.totalTeachers}
            className="w-full text-gray-900 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2"
            disabled
            title="Automatically calculated from program-wise faculty data"
          />
          <p className="mt-1 text-xs text-gray-500">
            Auto-calculated from all programs
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Visiting/Adjunct Faculty
          </label>
          <input
            type="number"
            value={formData.visitingFaculty}
            onChange={(e) =>
              handleChange("visitingFaculty", parseInt(e.target.value) || 0)
            }
            className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            placeholder="9"
            min="0"
          />
        </div>
      </div>

      {/* Program-wise Teachers */}
      <div className="space-y-6">
        <h3 className="mt-6 text-lg font-semibold text-gray-900">
          Program-wise Teacher Details
        </h3>

        {formData.programWiseTeachers.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
            <p className="text-gray-600">
              No programs found. Please complete the Academic Programs section
              first.
            </p>
          </div>
        ) : (
          formData.programWiseTeachers.map((program, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 bg-gray-50 p-6"
            >
              <h4 className="text-md mb-4 font-semibold text-indigo-900">
                {program.programme}
              </h4>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Duration (Years) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={program.duration}
                    onChange={(e) =>
                      handleProgramChange(
                        index,
                        "duration",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                    min="1"
                    max="5"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Sanctioned Intake <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={program.sanctionedIntake}
                    onChange={(e) =>
                      handleProgramChange(
                        index,
                        "sanctionedIntake",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Required Teachers
                  </label>
                  <input
                    type="number"
                    value={program.requiredTeachers}
                    className="w-full text-gray-900 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2"
                    disabled
                    title="Formula: (Intake × Duration) / 20"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Formula: ({program.sanctionedIntake} × {program.duration}) ÷
                    20
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Assistant Professors <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={program.assistantProfessors}
                    onChange={(e) =>
                      handleProgramChange(
                        index,
                        "assistantProfessors",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Associate Professors
                  </label>
                  <input
                    type="number"
                    value={program.associateProfessors}
                    onChange={(e) =>
                      handleProgramChange(
                        index,
                        "associateProfessors",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Professors
                  </label>
                  <input
                    type="number"
                    value={program.professors}
                    onChange={(e) =>
                      handleProgramChange(
                        index,
                        "professors",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="w-full text-gray-900 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Student-Teacher Ratio
                  </label>
                  <input
                    type="text"
                    value={`1:${program.studentTeacherRatio}`}
                    className="w-full text-gray-900 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2"
                    disabled
                    title="Total Students / Total Faculty"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Cadre Ratio (Sr:Jr)
                  </label>
                  <input
                    type="text"
                    value={program.cadreRatio}
                    className="w-full text-gray-900 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2"
                    disabled
                    title="Senior Faculty : Junior Faculty"
                  />
                </div>

                <div className="md:col-span-3">
                  <div className="rounded-lg bg-indigo-50 p-3">
                    <p className="text-xs text-indigo-800">
                      <strong>Total Faculty:</strong>{" "}
                      {(parseInt(program.assistantProfessors) || 0) +
                        (parseInt(program.associateProfessors) || 0) +
                        (parseInt(program.professors) || 0)}{" "}
                      | <strong>Required:</strong> {program.requiredTeachers}
                      {(parseInt(program.assistantProfessors) || 0) +
                        (parseInt(program.associateProfessors) || 0) +
                        (parseInt(program.professors) || 0) <
                      program.requiredTeachers ? (
                        <span className="ml-2 text-red-600">
                          ⚠️{" "}
                          {program.requiredTeachers -
                            ((parseInt(program.assistantProfessors) || 0) +
                              (parseInt(program.associateProfessors) || 0) +
                              (parseInt(program.professors) || 0))}{" "}
                          more teachers needed
                        </span>
                      ) : (
                        <span className="ml-2 text-green-600">✓ Adequate</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
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
