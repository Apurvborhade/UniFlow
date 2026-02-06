"use client";

import React from "react";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import axios from "axios";

interface ParsedPayrollData {
  recipient: string;
  wallet: string;
  amount: string;
  chain: string;
}

interface CSVUploadProps {
  onDataParsed?: (data: ParsedPayrollData[]) => void;
}



export default function CSVUpload({ onDataParsed }: CSVUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (content: string): ParsedPayrollData[] => {
    const lines = content.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("CSV must contain header and at least one data row");
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const requiredHeaders = ["recipient", "wallet", "amount", "chain"];

    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`);
    }

    const data: ParsedPayrollData[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(",").map((v) => v.trim());
      const recipientIdx = headers.indexOf("recipient");
      const walletIdx = headers.indexOf("wallet");
      const amountIdx = headers.indexOf("amount");
      const chainIdx = headers.indexOf("chain");

      data.push({
        recipient: values[recipientIdx] || "",
        wallet: values[walletIdx] || "",
        amount: values[amountIdx] || "",
        chain: values[chainIdx] || "",
      });
    }

    if (data.length === 0) {
      throw new Error("No valid data rows found in CSV");
    }

    return data;
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const content = await file.text();
      const parsedData = parseCSV(content);
      setFileName(file.name);
      onDataParsed?.(parsedData);
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(
        "https://uniflow-backend.apurvaborhade.dev/api/employees/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      console.log("Upload successful:", response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse CSV file");
      setFileName(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed  rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        } ${isLoading ? "opacity-60" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isLoading}
        />

        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>

          {fileName && !error ? (
            <>
              <div>
                <p className="text-lg font-semibold text-green-600">
                  File Uploaded Successfully
                </p>
                <p className="text-sm text-gray-600 mt-1">{fileName}</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  Drag and drop your CSV file here
                </p>
                <p className="text-sm text-gray-600 mt-1">or click to browse</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Required columns: Recipient, Wallet, Amount, Chain
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-semibold text-red-700">Error</p>
          <p className="text-sm text-red-600 mt-1">{error}</p>
          <p
            className="text-xs text-red-500 mt-2 cursor-pointer hover:underline"
            onClick={() => fileInputRef.current?.click()}
          >
            Try uploading again
          </p>
        </div>
      )}

      {isLoading && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-blue-700">
            Processing CSV file...
          </p>
        </div>
      )}
    </div>
  );
}
