"use client";

import { useState, useEffect } from "react";

export default function InstituteInfoForm({
  data,
  onSave,
  onPrevious,
  isFirstStep,
  isLastStep,
  saving,
}) {
  const [formData, setFormData] = useState({
    institutionName: "",
    directorName: "",
    address: "",
    directorMobile: "",
    instituteTelephone: "",
    email: "",
    website: "",
  });

  const [errors, setErrors] = useState({});
  const [isModified, setIsModified] = useState(false);

  // Load data from props
  useEffect(() => {
    if (data?.instituteInfo) {
      setFormData(data.instituteInfo);
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsModified(true);

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.institutionName?.trim()) {
      newErrors.institutionName = "Institution name is required";
    }

    if (!formData.directorName?.trim()) {
      newErrors.directorName = "Director/Principal name is required";
    }

    if (!formData.address?.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.directorMobile?.trim()) {
      newErrors.directorMobile = "Director mobile number is required";
    } else if (!/^\d{10}$/.test(formData.directorMobile)) {
      newErrors.directorMobile = "Please enter a valid 10-digit mobile number";
    }

    if (!formData.instituteTelephone?.trim()) {
      newErrors.instituteTelephone = "Institution telephone is required";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (
      formData.website &&
      !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(
        formData.website,
      )
    ) {
      newErrors.website = "Please enter a valid website URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (action) => {
    if (!validateForm()) {
      return;
    }

    const result = await onSave(formData, action);

    if (result.success && isModified) {
      // Update college profile with new data
      await updateCollegeProfile();
      setIsModified(false);
    }
  };

  const updateCollegeProfile = async () => {
    try {
      const response = await fetch("/api/college/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          collegeName: formData.institutionName,
          directorName: formData.directorName,
          address: formData.address,
          directorMobile: formData.directorMobile,
          phone: formData.instituteTelephone,
          email: formData.email,
          website: formData.website,
        }),
      });

      if (response.ok) {
        console.log("✅ College profile updated");
      }
    } catch (error) {
      console.error("Failed to update college profile:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Institution Name */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Name of the Institution <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="institutionName"
          value={formData.institutionName}
          onChange={handleChange}
          className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
            errors.institutionName ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter institution name"
        />
        {errors.institutionName && (
          <p className="mt-1 text-sm text-red-500">{errors.institutionName}</p>
        )}
      </div>

      {/* Director/Principal Name */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Name of the Director/Principal <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="directorName"
          value={formData.directorName}
          onChange={handleChange}
          className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
            errors.directorName ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter director/principal name"
        />
        {errors.directorName && (
          <p className="mt-1 text-sm text-red-500">{errors.directorName}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Address <span className="text-red-500">*</span>
        </label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
            errors.address ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter complete address with pincode"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-500">{errors.address}</p>
        )}
      </div>

      {/* Contact Details */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Director Mobile */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Mobile No. (Director/Principal){" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="directorMobile"
            value={formData.directorMobile}
            onChange={handleChange}
            maxLength={10}
            className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
              errors.directorMobile ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="10-digit mobile number"
          />
          {errors.directorMobile && (
            <p className="mt-1 text-sm text-red-500">{errors.directorMobile}</p>
          )}
        </div>

        {/* Institution Telephone */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Telephone No. (Institution) <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="instituteTelephone"
            value={formData.instituteTelephone}
            onChange={handleChange}
            className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
              errors.instituteTelephone ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Institution telephone number"
          />
          {errors.instituteTelephone && (
            <p className="mt-1 text-sm text-red-500">
              {errors.instituteTelephone}
            </p>
          )}
        </div>
      </div>

      {/* Email and Website */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Email */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Email ID <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="institution@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Website */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Institution Website URL
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
              errors.website ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="https://www.example.com"
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-500">{errors.website}</p>
          )}
        </div>
      </div>

      {/* Modification Warning */}
      {isModified && (
        <div className="rounded border-l-4 border-yellow-400 bg-yellow-50 p-4">
          <div className="flex">
            <div className="shrink-0">
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
              <p className="text-sm text-yellow-700">
                Changes made here will also update your college profile
                information.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between border-t pt-6">
        <button
          onClick={onPrevious}
          disabled={isFirstStep || saving}
          className="rounded-lg bg-gray-200 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← Previous
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => handleSave("save")}
            disabled={saving}
            className="rounded-lg bg-indigo-100 px-6 py-2 text-indigo-600 transition-colors hover:bg-indigo-200 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          <button
            onClick={() => handleSave("saveAndContinue")}
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
