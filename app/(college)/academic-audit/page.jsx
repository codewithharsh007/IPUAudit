"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  AcademicProgramsForm,
  AccreditationForm,
  TeachersAvailabilityForm,
  QualityOfTeachersForm,
  FacultyDevelopmentForm,
  GrievanceRedressalForm,
  UniversityExaminationsForm,
  LibraryForm,
  LaboratoriesForm,
  CoCurricularActivitiesForm,
  PublicationsForm,
  StudentDevelopmentForm,
  PlacementForm,
  GeneralParametersForm,
  FeedbackForm,
  DeficienciesForm,
  SummaryReviewForm,
  DirectPDFUpload,
} from "@/components/AcademicAudit";

export default function AcademicAuditPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [auditData, setAuditData] = useState(null);
  const [auditId, setAuditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [academicYear, setAcademicYear] = useState("2024-25");
  const [showPDFUpload, setShowPDFUpload] = useState(false);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  // Section configuration
  const sections = [
    {
      id: 1,
      key: "academicPrograms",
      name: "Academic Programs",
      component: AcademicProgramsForm,
      maxMarks: 0,
    },
    {
      id: 2,
      key: "accreditation",
      name: "Accreditation Status",
      component: AccreditationForm,
      maxMarks: 50,
    },
    {
      id: 3,
      key: "teachersAvailability",
      name: "Teachers Availability",
      component: TeachersAvailabilityForm,
      maxMarks: 115,
    },
    {
      id: 4,
      key: "qualityOfTeachers",
      name: "Quality of Teachers",
      component: QualityOfTeachersForm,
      maxMarks: 100,
    },
    {
      id: 5,
      key: "facultyDevelopment",
      name: "Faculty Development",
      component: FacultyDevelopmentForm,
      maxMarks: 40,
    },
    {
      id: 6,
      key: "grievanceRedressal",
      name: "Grievance Redressal",
      component: GrievanceRedressalForm,
      maxMarks: 100,
    },
    {
      id: 7,
      key: "universityExaminations",
      name: "University Examinations",
      component: UniversityExaminationsForm,
      maxMarks: 30,
    },
    {
      id: 8,
      key: "library",
      name: "Library",
      component: LibraryForm,
      maxMarks: 100,
    },
    {
      id: 9,
      key: "laboratories",
      name: "Laboratories",
      component: LaboratoriesForm,
      maxMarks: 100,
    },
    {
      id: 10,
      key: "coCurricularActivities",
      name: "Co-Curricular Activities",
      component: CoCurricularActivitiesForm,
      maxMarks: 100,
    },
    {
      id: 11,
      key: "publications",
      name: "Publications",
      component: PublicationsForm,
      maxMarks: 40,
    },
    {
      id: 12,
      key: "studentDevelopment",
      name: "Student Development",
      component: StudentDevelopmentForm,
      maxMarks: 35,
    },
    {
      id: 13,
      key: "placement",
      name: "Placement",
      component: PlacementForm,
      maxMarks: 60,
    },
    {
      id: 14,
      key: "generalParameters",
      name: "General Parameters",
      component: GeneralParametersForm,
      maxMarks: 30,
    },
    {
      id: 15,
      key: "feedback",
      name: "Feedback",
      component: FeedbackForm,
      maxMarks: 50,
    },
    {
      id: 16,
      key: "deficiencies",
      name: "Deficiencies",
      component: DeficienciesForm,
      maxMarks: 50,
    },
    {
      id: 17,
      key: "summary",
      name: "Review & Submit",
      component: SummaryReviewForm,
      maxMarks: 0,
    },
  ];

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    } else if (!authLoading && user?.role !== "college") {
      router.push("/unauthorized");
    }
  }, [authLoading, user, router]);

  // Fetch audit data
  useEffect(() => {
    if (user && user.role === "college") {
      fetchAuditData();
    }
  }, [academicYear, user]);

  // Auto-save indicator timeout
  useEffect(() => {
    if (lastSaved) {
      const timer = setTimeout(() => setLastSaved(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  const fetchAuditData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/college/academic-audit/save?year=${academicYear}`,
        {
          credentials: "include", // ✅ Add this
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Audit data:", data);
        if (data.audit) {
          setAuditData(data.audit);
          setAuditId(data.audit._id || data.audit.id);
          setCurrentStep(data.audit.currentStep || 1);
        }
      } else if (response.status === 404) {
        // ✅ This is OK - no audit exists yet
        console.log("ℹ️ No existing audit found, starting fresh");
        setAuditData(null);
        setAuditId(null);
        setCurrentStep(1);
      } else {
        const errorData = await response.json();
        console.error("❌ Failed to fetch audit:", errorData);
        setError(errorData.error || "Failed to load audit data");
      }
    } catch (error) {
      console.error("❌ Error fetching audit data:", error);
      setError("Failed to load audit data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (sectionData, action = "save") => {
    setSaving(true);
    setError(null);

    try {
      const currentSection = sections[currentStep - 1];
      console.log(
        "💾 Saving section:",
        currentSection.key,
        "with data:",
        sectionData,
      );

      const response = await fetch("/api/college/academic-audit/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ Add this
        body: JSON.stringify({
          academicYear,
          section: currentSection.key,
          data: sectionData,
          currentStep:
            action === "saveAndContinue" ? currentStep + 1 : currentStep,
          auditId: auditId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Save failed:", errorData);
        throw new Error(errorData.error || "Failed to save");
      }

      const result = await response.json();
      console.log("✅ Section saved successfully:", result);

      setAuditData(result.audit);
      setAuditId(result.audit._id || result.audit.id);
      setLastSaved(new Date());

      if (action === "saveAndContinue" && currentStep < sections.length) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      return { success: true };
    } catch (error) {
      console.error("❌ Error saving audit:", error);
      setError(error.message || "Failed to save. Please try again.");
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!auditId) {
      setError("No audit data to submit. Please save your data first.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      console.log("📤 Submitting audit:", auditId);

      const response = await fetch("/api/college/academic-audit/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ Add this
        body: JSON.stringify({ auditId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Submit failed:", errorData);
        throw new Error(errorData.error || "Failed to submit");
      }

      const result = await response.json();
      console.log("✅ Audit submitted successfully:", result);

      alert("Academic Audit submitted successfully!");
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (error) {
      console.error("❌ Error submitting audit:", error);
      setError(error.message || "Failed to submit audit");
    } finally {
      setSaving(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStepClick = (stepId) => {
    if (stepId <= (auditData?.currentStep || 1) || stepId <= currentStep) {
      setCurrentStep(stepId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePDFUploadSuccess = async () => {
    await fetchAuditData();
    setShowPDFUpload(false);
    alert("PDF uploaded successfully!");
  };

  // Loading state
  if (authLoading || (loading && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading audit data...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user || user.role !== "college") {
    return null;
  }

  const currentSection = sections[currentStep - 1];
  const CurrentStepComponent = currentSection.component;
  const completedSections = sections.filter(
    (s) => s.id < currentStep && auditData?.[s.key],
  ).length;
  const progressPercentage = (
    (completedSections / sections.length) *
    100
  ).toFixed(0);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar role="college" onLogout={logout} />

      <div className="flex-grow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  Academic Audit
                </h1>
                <p className="mt-1 text-sm text-gray-600 sm:text-base">
                  Academic Session: {academicYear}
                </p>
                {lastSaved && (
                  <p className="mt-1 text-xs text-green-600">
                    ✓ Last saved: {lastSaved.toLocaleTimeString()}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  disabled={saving}
                >
                  <option value="2024-25">2024-25</option>
                  <option value="2025-26">2025-26</option>
                  <option value="2026-27">2026-27</option>
                </select>

                <button
                  onClick={() => setShowPDFUpload(!showPDFUpload)}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                  disabled={saving}
                >
                  {showPDFUpload ? "📝 Fill Form" : "📄 Upload PDF"}
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Overall Progress</span>
                <span className="font-medium">{progressPercentage}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
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
                <div className="ml-3 flex-1">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setError(null)}
                    className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {showPDFUpload ? (
            <DirectPDFUpload
              auditData={auditData}
              academicYear={academicYear}
              onSuccess={handlePDFUploadSuccess}
              onCancel={() => setShowPDFUpload(false)}
            />
          ) : (
            <>
              {/* Progress Steps */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {sections.map((section) => {
                    const isCompleted = section.id < currentStep;
                    const isCurrent = section.id === currentStep;
                    const isAccessible =
                      section.id <= (auditData?.currentStep || 1);

                    return (
                      <button
                        key={section.id}
                        onClick={() => handleStepClick(section.id)}
                        disabled={!isAccessible && !isCurrent}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                          isCurrent
                            ? "bg-indigo-600 text-white shadow-lg"
                            : isCompleted
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : isAccessible
                                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                : "cursor-not-allowed bg-gray-100 text-gray-400"
                        }`}
                      >
                        <span className="font-bold">{section.id}.</span>
                        <span>{section.name}</span>
                        {isCompleted && (
                          <span className="text-green-600">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current Step Form */}
              <div className="rounded-lg bg-white p-4 shadow-lg sm:p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                      {currentSection.name}
                    </h2>
                    {currentSection.maxMarks > 0 && (
                      <p className="mt-1 text-sm text-gray-600">
                        Maximum Marks: {currentSection.maxMarks}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">
                      Step {currentStep} of {sections.length}
                    </p>
                  </div>
                </div>

                <CurrentStepComponent
                  data={auditData}
                  onSave={handleSave}
                  onPrevious={handlePrevious}
                  onSubmit={handleSubmit}
                  isFirstStep={currentStep === 1}
                  isLastStep={currentStep === sections.length}
                  saving={saving}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
