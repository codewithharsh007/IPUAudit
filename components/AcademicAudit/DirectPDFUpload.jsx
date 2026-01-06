"use client";

import { useState } from "react";

export default function DirectPDFUpload({ auditData, academicYear, onSuccess, onCancel }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError(null);

    if (selectedFile) {
      // Validate file type
      if (selectedFile.type !== "application/pdf") {
        setError("Please select a PDF file");
        setFile(null);
        return;
      }

      // Validate file size (max 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError("File size should not exceed 50MB");
        setFile(null);
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async (submitImmediately = false) => {
    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("academicYear", academicYear);
      formData.append("submitImmediately", submitImmediately.toString());
      if (auditData?._id) {
        formData.append("auditId", auditData._id);
      }

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentage = (e.loaded / e.total) * 100;
          setUploadProgress(percentage);
        }
      });

      const response = await new Promise((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(xhr.statusText));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

        xhr.open("POST", "/api/college/academic-audit/upload-pdf");
        xhr.send(formData);
      });

      if (response.success) {
        onSuccess(response.audit);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message || "Failed to upload PDF");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Upload Complete PDF</h2>
        <p className="mt-2 text-gray-600">
          If you have already filled the academic audit form, you can upload it directly as a PDF
        </p>
      </div>

      {/* Existing PDF Display */}
      {auditData?.directPDFUpload?.uploaded && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-start">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-green-800">PDF Already Uploaded</h3>
              <p className="mt-1 text-sm text-green-700">
                {auditData.directPDFUpload.fileName}
              </p>
              <p className="mt-1 text-xs text-green-600">
                Uploaded: {new Date(auditData.directPDFUpload.uploadedAt).toLocaleString()}
              </p>
              <a
                href={auditData.directPDFUpload.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center text-sm font-medium text-green-700 hover:text-green-800"
              >
                View PDF →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Area */}
      <div className="mb-6">
        <label
          htmlFor="pdf-upload"
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:border-indigo-500 hover:bg-indigo-50"
        >
          <svg
            className="mb-4 h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="mb-2 text-sm font-medium text-gray-700">
            {file ? file.name : "Click to upload or drag and drop"}
          </p>
          <p className="text-xs text-gray-500">PDF (MAX. 5MB)</p>
          <input
            id="pdf-upload"
            type="file"
            className="hidden"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>

        {/* File Info */}
        {file && (
          <div className="mt-3 rounded-lg bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-red-600 hover:text-red-800"
                disabled={uploading}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-gray-700">Uploading...</span>
            <span className="font-medium text-indigo-600">{uploadProgress.toFixed(0)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          disabled={uploading}
        >
          Cancel
        </button>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => handleUpload(false)}
            disabled={!file || uploading}
            className="rounded-lg bg-gray-600 px-6 py-2 text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Save as Draft"}
          </button>

          <button
            onClick={() => handleUpload(true)}
            disabled={!file || uploading}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload & Submit"}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 rounded-lg bg-blue-50 p-4">
        <h4 className="text-sm font-medium text-blue-900">Instructions:</h4>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-blue-800">
          <li>Only PDF files are accepted</li>
          <li>Maximum file size: 50MB</li>
          <li>Ensure the PDF contains all required sections</li>
          <li>"Save as Draft" - Upload without submitting</li>
          <li>"Upload & Submit" - Upload and submit for review immediately</li>
        </ul>
      </div>
    </div>
  );
}
