"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle2, AlertCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "./ui/button";

type Checkpoint = {
  event: string;
  message?: string;
  data?: any;
};

type PayrollModalProps = {
  start?: boolean; 
};

export default function PayrollModal({ start }: PayrollModalProps) {
  const [showCard, setShowCard] = useState(false);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [employeeTransfers, setEmployeeTransfers] = useState<Checkpoint[]>([]);
  const [completed, setCompleted] = useState(false);
  const [running, setRunning] = useState(false);
  const [hasError, setHasError] = useState(false);
  const evtSourceRef = useRef<EventSource | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const startPayroll = () => {
    setShowCard(true);
    setCheckpoints([]);
    setEmployeeTransfers([]);
    setCompleted(false);
    setRunning(true);
    setHasError(false);

    const evtSource = new EventSource(
      "https://uniflow-backend.apurvaborhade.dev/api/payroll/run",
    );
    evtSourceRef.current = evtSource;

    const addCheckpoint = (event: string, data: any) => {
      if (event === "TRANSFER_PROGRESS") {
        setEmployeeTransfers((prev) => [
          ...prev,
          { event, message: data?.message || "", data },
        ]);
      } else {
        setCheckpoints((prev) => [
          ...prev,
          { event, message: data?.message || "", data },
        ]);
      }

      if (event === "FAILED") {
        setCompleted(true);
        setRunning(false);
        setHasError(true);
        setErrorMessage(data?.reason || data?.message || "Unknown error");
        evtSource.close();
      }

      if (event === "PAYROLL_COMPLETED") {
        setCompleted(true);
        setRunning(false);
        evtSource.close();
      }
    };

    const events = [
      "INIT",
      "FETCH_EMPLOYEES",
      "CALCULATE_TOTAL",
      "CHECK_FUNDS",
      "TRANSFER_FUNDS",
      "TRANSFER_PROGRESS",
      "PAYROLL_COMPLETED",
      "FAILED",
    ];

    events.forEach((event) => {
      evtSource.addEventListener(event, (e: MessageEvent) => {
        addCheckpoint(event, JSON.parse(e.data));
      });
    });
  };

  const closeModal = () => {
    setShowCard(false);
    evtSourceRef.current?.close();
  };

  useEffect(() => {
    if (start) {
      startPayroll();
    }
  }, [start]);

  useEffect(() => {
    return () => evtSourceRef.current?.close();
  }, []);
  const totalSteps = checkpoints.length + employeeTransfers.length;
  const totalExpectedSteps = 6 + employeeTransfers.length;
  const progress = Math.min((totalSteps / totalExpectedSteps) * 100, 100);

  const getEventLabel = (event: string): string => {
    const labels: { [key: string]: string } = {
      INIT: "Initializing Payroll",
      FETCH_EMPLOYEES: "Fetching Employees",
      CALCULATE_TOTAL: "Calculating Totals",
      CHECK_FUNDS: "Checking Funds",
      TRANSFER_FUNDS: "Processing Transfers",
      TRANSFER_PROGRESS: "Transferring to Employees",
      PAYROLL_COMPLETED: "Payroll Completed",
      FAILED: "Payroll Failed",
    };
    return labels[event] || event;
  };

  const getEventIcon = (
    event: string,
    isActive: boolean,
    isCompleted: boolean,
  ) => {
    if (event === "FAILED") {
      return <XCircle className="w-5 h-5 text-red-500 shrink-0" />;
    }
    if (isCompleted) {
      return <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />;
    }
    if (isActive) {
      return (
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
      );
    }
    return (
      <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
    );
  };

  return (
    <div>
      <Button
        onClick={startPayroll}
        disabled={running}
        className="px-6 py-2.5 rounded-lg font-semibold text-white transition-all duration-200 flex items-center gap-2"
        style={{
          backgroundColor: running ? "#9CA3AF" : "#000000",
          cursor: running ? "not-allowed" : "pointer",
          opacity: running ? 0.7 : 1,
        }}
      >
        <span>+</span>
        {running ? "Running Payroll..." : "Run Payroll"}
      </Button>

      {showCard && (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 pointer-events-auto p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Payroll Progress
                </h2>
                <p className="text-gray-600 text-sm">
                  {running && "Processing your payroll..."}
                  {completed && !hasError && "Payroll completed successfully!"}
                  {completed &&
                    hasError &&
                    "Payroll processing encountered an error."}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-600">
                    Overall Progress
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-2.5 bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  Processing Steps
                </h3>
                <div className="space-y-3">
                  {checkpoints.map((cp, idx) => {
                    const isActive =
                      !completed && idx === checkpoints.length - 1;
                    const isCompleted = completed || checkpoints.length > idx;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 transition-all"
                      >
                        {getEventIcon(cp.event, isActive, isCompleted)}
                        <div className="1">
                          <p className="text-sm font-medium text-gray-900">
                            {getEventLabel(cp.event)}
                          </p>
                          {cp.message && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {cp.message}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {employeeTransfers.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                    Employee Transfers ({employeeTransfers.length})
                  </h3>
                  <div className="max-h-48 overflow-y-auto">
                    <div className="space-y-2">
                      {employeeTransfers.map((et, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-2.5 rounded-lg bg-green-50"
                        >
                          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                          <span className="text-sm text-gray-700">
                            <span className="font-medium">
                              {et.data?.employeeName ||
                                `Employee ${et.data?.employeeId}`}
                            </span>
                            {" - "} Paid Successfully
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {completed && hasError && (
                <div className="p-4 rounded-xl text-center bg-red-50 border border-red-200">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <p className="font-semibold text-red-900">{errorMessage}</p>
                  </div>
                </div>
              )}

              <div className="mt-8 flex gap-3">
                {completed && (
                  <button
                    onClick={closeModal}
                    className="1 px-6 w-full py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Done
                  </button>
                )}
                {!completed && (
                  <button
                    onClick={closeModal}
                    className="1 px-6 py-3 rounded-lg font-semibold bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="fixed inset-0 z-40" onClick={closeModal} />
        </>
      )}
    </div>
  );
}
