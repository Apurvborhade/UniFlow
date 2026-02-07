"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import EmployeeTable from "@/components/Employesstable";
import EmployeeFormModal from "../../../components/employeeFormModel";
import { toast } from "sonner";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    const res = await axios.get(
      "https://uniflow-backend.apurvaborhade.dev/api/employees",
    );
    setEmployees(res.data.data);
    setLoading(false);
  };
  const handleEditEmployee = (employee: any) => {
    setEditingId(employee.id);
    setEditingEmployee(employee);
    setOpenModal(true);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSuccess = (updatedEmployee?: any) => {
    if (editingId && updatedEmployee) {
      setEmployees((prev) =>
        prev.map((e) => (e.id === updatedEmployee.id ? updatedEmployee : e)),
      );
    } else {
      fetchEmployees();
    }

    setEditingId(null);
    setEditingEmployee(null);
    setOpenModal(false);
  };
  const handleDeleteEmployee = async (id: string) => {
    try {
      await axios.delete(
        `https://uniflow-backend.apurvaborhade.dev/api/employees/delete/${id}`,
      );
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      toast.success("Deleted Employee Successfully")
    } catch {
      toast.error("Failed to delete employee");
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setEditingEmployee(null);
            setOpenModal(true);
            setOpenModal(true);
          }}
          className="bg-black text-white px-5 py-2 rounded-lg"
        >
          + Add Employee
        </button>
      </div>
      <EmployeeTable
        employees={employees}
        loading={loading}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
      />
      {openModal && (
        <EmployeeFormModal
          employee={editingEmployee}
          onClose={() => setOpenModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </main>
  );
}
