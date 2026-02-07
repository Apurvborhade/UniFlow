"use client";

import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import { toast } from "sonner";

export default function PayrollSchedulePage() {
  const [frequency, setFrequency] = useState<Frequency>("MONTHLY");
  const [runAt, setRunAt] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [schedules, setSchedules] = useState<PayrollSchedule[]>([]);
  const toDateTimeLocal = (iso: string) => (iso ? iso.slice(0, 16) : "");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          "https://uniflow-backend.apurvaborhade.dev/api/scheduler/payroll/list",
        );
        const normalized = res.data.schedules.map((s: any) => ({
          ...s,
          id: String(s.id),
        }));
        setSchedules(normalized);
      } catch (err) {
        toast.error("Failed to load schedules");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!runAt) {
      toast.error("Please select a date and time");
      return;
    }

    const payload = { frequency, runAt, isActive };
    setLoading(true);

    try {
      if (editingId) {
        const res = await axios.put(
          `https://uniflow-backend.apurvaborhade.dev/api/scheduler/payroll/update/${editingId}`,
          payload,
        );
        const updated: PayrollSchedule = res.data.schedule;
        setSchedules((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s)),
        );
        toast.success(res.data.message || "Schedule updated");
        setEditingId(null);
      } else {
        const res = await axios.post(
          "https://uniflow-backend.apurvaborhade.dev/api/scheduler/payroll/create",
          payload,
        );
        const created: PayrollSchedule = res.data.schedule;
        setSchedules((prev) => [...prev, created]);
        toast.success("Schedule created successfully");
      }
    } catch (err) {
      console.error(err);
      toast.error(editingId ? "Update failed" : "Failed to create schedule");
    } finally {
      setLoading(false);
      setRunAt("");
      setFrequency("MONTHLY");
      setIsActive(true);
      setShowForm(false);
    }
  };

  const handleEditSchedule = async (schedule: PayrollSchedule) => {
    setFrequency(schedule.frequency);
    setRunAt(toDateTimeLocal(schedule.runAt));
    setIsActive(schedule.isActive);
    setEditingId(schedule.id);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowForm(false);
    setRunAt("");
    setFrequency("MONTHLY");
    setIsActive(true);
  };

  const toggleScheduleActive = async (id: string) => {
    const updatedSchedules = schedules.map((schedule) =>
      schedule.id === id
        ? { ...schedule, isActive: !schedule.isActive }
        : schedule,
    );
    setSchedules(updatedSchedules);

    const toggledSchedule = updatedSchedules.find((s) => s.id === id);
    if (!toggledSchedule) return;
    setLoading(true);

    try {
      await axios.put(
        `https://uniflow-backend.apurvaborhade.dev/api/scheduler/payroll/update/${id}`,
        { isActive: toggledSchedule.isActive },
      );
      toast.success(
        toggledSchedule.isActive ? "Schedule activated" : "Schedule paused",
      );
    } catch (err) {
      console.error("Failed to update schedule status:", err);
      toast.error("Failed to update schedule");

      // Revert UI on error
      setSchedules(schedules);
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = (id: string) => {
    setLoading(true);
    try {
      axios.delete(
        `https://uniflow-backend.apurvaborhade.dev/api/scheduler/payroll/delete/${id}`,
      );
      setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
      toast.success("Schedule deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete schedule");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="min-h-screen bg-white">
      <div className=" max-w-5xl mx-auto  bg-white  rounded-2xl p-6 sm:p-2 mb-6 sm:mb-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Payroll Schedules
          </h2>

          <button
            onClick={() => {
              handleCancelEdit();
              setShowForm(true);
            }}
            className="bg-black hover:bg-blue-700 hover:scale-105 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base"
          >
            + Add Schedule
          </button>
        </div>
      </div>

      <div className="max-w-5xl  mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mt-8 sm:mt-0">
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-50">
            <div className="w-12 h-12 border-4 border-white border-t-black rounded-full animate-spin"></div>
          </div>
        )}
        {/* Active Schedules List */}
        {schedules.length > 0 ? (
          <>
            <div className="bg-white border border-black rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Active Schedules
                </h2>
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider py-3">
                        Frequency
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider py-3">
                        Run Time
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider py-3">
                        Last Run
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider py-3">
                        Next Run
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider py-3">
                        Status
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((schedule) => (
                      <tr
                        key={schedule.id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-4 text-sm">
                          <span className="px-3 py-1 bg-white text-black text-xs font-semibold rounded-full">
                            {schedule.frequency}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-gray-900">
                          {formatDate(schedule.runAt)}
                        </td>
                        <td className="py-4 text-sm text-gray-600">
                          {schedule.lastRunAt
                            ? formatDate(schedule.lastRunAt)
                            : "N/A"}
                        </td>
                        <td className="py-4 text-sm text-gray-600">
                          {schedule.nextRunAt
                            ? formatDate(schedule.nextRunAt)
                            : "N/A"}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleScheduleActive(schedule.id)}
                              className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors ${schedule.isActive ? "bg-green-500" : "bg-gray-300"}`}
                            >
                              <span
                                className={`w-4 h-4 bg-white rounded-full transition-transform ${schedule.isActive ? "translate-x-4" : "translate-x-0"}`}
                              />
                            </button>
                            <span className="text-xs font-medium text-gray-700">
                              {schedule.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>

                        <td className="py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditSchedule(schedule)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => deleteSchedule(schedule.id)}
                              className="px-3 py-1 bg-red-700 text-white rounded-lg text-xs font-semibold hover:bg-red-800 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden space-y-4">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-2">
                          {schedule.frequency}
                        </span>
                        <span
                          className={`ml-2 inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                            schedule.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {schedule.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="text-gray-600">
                        <p className="text-xs text-gray-500">Run Time</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(schedule.runAt)}
                        </p>
                      </div>
                      {schedule.nextRunAt && (
                        <div className="text-gray-600">
                          <p className="text-xs text-gray-500">Next Run</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(schedule.nextRunAt)}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSchedule(schedule)}
                        className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleScheduleActive(schedule.id)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                          schedule.isActive
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {schedule.isActive ? "Pause" : "Resume"}
                      </button>
                      <button
                        onClick={() => deleteSchedule(schedule.id)}
                        className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white border border-black rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8">
            <div className="flex flex-col items-center gap-4 py-10">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                No Payroll Schedules Found
              </h2>
              <p className="text-sm text-gray-600">
                Get started by creating your first payroll schedule.
              </p>
              <button
                onClick={() => {
                  handleCancelEdit();
                  setShowForm(true);
                }}
                className="bg-black hover:bg-blue-700 hover:scale-105 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                + Add Schedule
              </button>
            </div>
          </div>
        )}

        {/* Create/Edit Schedule Form */}
        {showForm && (
          <div className="bg-white border border-black rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">
              {editingId
                ? "Edit Payroll Schedule"
                : "Create New Payroll Schedule"}
            </h2>

            <form onSubmit={handleAddSchedule} className="space-y-6">
              {/* Frequency Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Frequency
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(
                    ["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY"] as Frequency[]
                  ).map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setFrequency(freq)}
                      className={`py-3 px-4 rounded-lg font-semibold transition-colors text-sm ${
                        frequency === freq
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              {/* Run At DateTime */}
              <div>
                <label
                  htmlFor="runAt"
                  className="block text-sm font-semibold text-gray-900 mb-3"
                >
                  Schedule Run Time
                </label>
                <input
                  id="runAt"
                  type="datetime-local"
                  value={runAt}
                  onChange={(e) => setRunAt(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:scale-105  hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {editingId ? "Update Schedule" : "Create Schedule"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
