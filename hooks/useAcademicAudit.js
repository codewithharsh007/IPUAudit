import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export function useAcademicAudit(initialStep = 1) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [auditData, setAuditData] = useState(null);
  const [auditId, setAuditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch existing audit data
  const fetchAuditData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/college/academic-audit/save");

      if (response.ok) {
        const data = await response.json();
        if (data.audit) {
          setAuditData(data.audit);
          setAuditId(data.audit._id);
          setCurrentStep(data.audit.currentStep || 1);
        }
      }
    } catch (error) {
      console.error("Error fetching audit:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditData();
  }, [fetchAuditData]);

  // Save section data
  const saveSection = async (section, data, action = "save") => {
    try {
      setSaving(true);

      const response = await fetch("/api/college/academic-audit/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          data,
          currentStep:
            action === "saveAndContinue" ? currentStep + 1 : currentStep,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      const result = await response.json();
      setAuditData((prev) => ({ ...prev, ...result.audit }));
      setAuditId(result.audit.id);

      if (action === "saveAndContinue") {
        setCurrentStep((prev) => prev + 1);
      }

      return { success: true };
    } catch (error) {
      console.error("Error saving section:", error);
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  };

  // Submit final audit
  const submitAudit = async () => {
    try {
      setSaving(true);

      const response = await fetch("/api/college/academic-audit/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit");
      }

      router.push("/college/academic-audit/success");
      return { success: true };
    } catch (error) {
      console.error("Error submitting audit:", error);
      alert(error.message);
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  return {
    currentStep,
    auditData,
    auditId,
    loading,
    saving,
    saveSection,
    submitAudit,
    goToPreviousStep,
    goToStep,
    refetch: fetchAuditData,
  };
}
