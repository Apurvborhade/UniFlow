"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import EmployeeTable from "@/components/Employesstable";
import EmployeeFormModal from "../../../components/employeeFormModel";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    const res = await axios.get(
      "https://uniflow-backend.apurvaborhade.dev/api/employees",
    );
    setEmployees(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <button
          onClick={() => {
            setEditingEmployee(null);
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
        onEdit={(emp :any) => {
          setEditingEmployee(emp);
          setOpenModal(true);
        }}
        onDelete={async (id :any ) => {
          await axios.delete(
            `https://uniflow-backend.apurvaborhade.dev/api/employees/${id}`,
          );
          fetchEmployees();
        }}
      />
         {openModal && (
        <EmployeeFormModal
          employee={editingEmployee}
          onClose={() => setOpenModal(false)}
          onSuccess={fetchEmployees}
        />
      )}
    </main>
  );
}
