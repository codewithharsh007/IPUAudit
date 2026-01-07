import { useState, useEffect } from "react";

export function useFormData(data, sectionKey, defaultValues) {
  const [formData, setFormData] = useState(defaultValues);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    console.log(`📥 Loading ${sectionKey} data:`, data?.[sectionKey]);

    if (data?.[sectionKey]) {
      setFormData(data[sectionKey]);
      setIsModified(false);
    } else {
      // Reset to default if no data
      setFormData(defaultValues);
      setIsModified(false);
    }
  }, [data, sectionKey]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsModified(true);
  };

  const resetForm = () => {
    setFormData(data?.[sectionKey] || defaultValues);
    setIsModified(false);
  };

  return {
    formData,
    setFormData,
    isModified,
    setIsModified,
    handleChange,
    resetForm,
  };
}
