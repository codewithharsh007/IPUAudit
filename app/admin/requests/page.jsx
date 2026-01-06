"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PendingRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/admin/colleges?status=pending");
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        setError("Failed to fetch pending requests");
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      setError("An error occurred while fetching requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    setProcessing(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/colleges/${selectedRequest._id}/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rejectionReason: action === "reject" ? rejectionReason : undefined,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(
          action === "approve"
            ? `${selectedRequest.collegeName} has been approved successfully!`
            : `${selectedRequest.collegeName} has been rejected.`,
        );
        setShowModal(false);
        setSelectedRequest(null);
        setRejectionReason("");
        fetchRequests();

        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setError(data.message || "Failed to process request");
      }
    } catch (error) {
      console.error("Error processing request:", error);
      setError("An error occurred while processing the request");
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setRejectionReason("");
    setError("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar role="admin" onLogout={handleLogout} />

      <div className="flex-grow">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Pending Requests
            </h1>
            <p className="mt-2 text-gray-600">
              Review and approve college registrations
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 animate-pulse rounded-r border-l-4 border-green-500 bg-green-50 p-4">
              <div className="flex items-center">
                <svg
                  className="mr-2 h-5 w-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm font-medium text-green-800">
                  {successMessage}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !showModal && (
            <div className="mb-6 rounded-r border-l-4 border-red-500 bg-red-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg
                    className="mr-2 h-5 w-5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
                <button
                  onClick={() => setError("")}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
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
          )}

          {/* Loading State */}
          {loading ? (
            <div className="rounded-lg bg-white p-12 text-center shadow">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading pending requests...</p>
            </div>
          ) : requests.length === 0 ? (
            /* Empty State */
            <div className="rounded-lg bg-white p-12 text-center shadow">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
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
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No pending requests
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                All registration requests have been processed.
              </p>
            </div>
          ) : (
            /* Requests Table */
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        College Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Director
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Programs
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {requests.map((request) => (
                      <tr
                        key={request._id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {request.collegeName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {request.directorName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.directorMobile}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {request.programs
                              .slice(0, 2)
                              .map((program, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                                >
                                  {program}
                                </span>
                              ))}
                            {request.programs.length > 2 && (
                              <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                                +{request.programs.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setActionType("view");
                              setShowModal(true);
                            }}
                            className="mr-4 text-indigo-600 transition-colors hover:text-indigo-900"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setActionType("approve");
                              setShowModal(true);
                            }}
                            className="mr-4 text-green-600 transition-colors hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setActionType("reject");
                              setShowModal(true);
                            }}
                            className="text-red-600 transition-colors hover:text-red-900"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedRequest && (
        <div className="bg-opacity-75 fixed inset-0 z-50 flex h-full w-full items-center justify-center overflow-y-auto bg-gray-600 p-4">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between rounded-t-lg border-b border-gray-200 bg-white px-6 py-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {actionType === "view" && "📋 College Details"}
                {actionType === "approve" && "✅ Approve Registration"}
                {actionType === "reject" && "❌ Reject Registration"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 transition-colors hover:text-gray-600"
                disabled={processing}
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
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4">
              {/* Error in Modal */}
              {error && (
                <div className="mb-4 rounded-r border-l-4 border-red-500 bg-red-50 p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* College Details Grid */}
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 p-4 md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">
                    College Name
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {selectedRequest.collegeName}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Email Address
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedRequest.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    College Code
                  </p>
                  <p className="mt-1 rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-900">
                    {selectedRequest.collegeCode}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Director Name
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedRequest.directorName}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Director Mobile
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedRequest.directorMobile}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Institute Telephone
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedRequest.instituteTelephone}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Establishment Year
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedRequest.establishmentYear}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedRequest.address}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Website</p>
                  <a
                    href={selectedRequest.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    {selectedRequest.website} ↗
                  </a>
                </div>

                <div className="md:col-span-2">
                  <p className="mb-2 text-sm font-medium text-gray-500">
                    Programs Offered
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.programs.map((program, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                      >
                        {program}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rejection Reason Textarea */}
              {actionType === "reject" && (
                <div className="mt-6">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows="4"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 transition-all placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-red-500 focus:outline-none"
                    placeholder="Provide a detailed reason for rejection (e.g., incomplete documents, invalid information, etc.)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    <span className="font-medium text-red-500">*Required:</span>{" "}
                    This reason will be sent to the college via email.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex justify-end space-x-3 rounded-b-lg border-t border-gray-200 bg-gray-50 px-6 py-4">
              {actionType === "view" ? (
                <button
                  onClick={handleCloseModal}
                  className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                  Close
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCloseModal}
                    disabled={processing}
                    className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAction(actionType)}
                    disabled={
                      processing ||
                      (actionType === "reject" && !rejectionReason.trim())
                    }
                    className={`transform rounded-lg border border-transparent px-6 py-2 text-sm font-medium text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
                      actionType === "approve"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {processing ? (
                      <span className="flex items-center">
                        <svg
                          className="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing...
                      </span>
                    ) : actionType === "approve" ? (
                      "✓ Approve College"
                    ) : (
                      "✗ Reject College"
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
