
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

"use client";
import React, { useRef, useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Toaster } from "../ui/sonner";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Calendar,
  TrendingUp,
  BarChart,
  FileText,
  Printer,
  Download,
  Upload,
  FileSpreadsheet,
  Globe,
  X,
  File,
  ArrowLeft,
  User,
  Settings,
  LogOut,
  Trash2,
  RefreshCw,
} from "lucide-react";

import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { useDashboardStore } from "@/src/services/api/dashboard/dashboard-store";

import { useUploadStore } from "@/src/services/api/dashboard/upload-store";
import { useDeleteFileStore } from "@/src/services/api/dashboard/delete-store";
import { useRouter } from "next/navigation";

import { fetchDataSources } from "@/src/services/api/dashboard/data-source";

const SequentialLoader = () => {
  const messages = [
    "Preparing dashboard...",
    "Loading data...",
    "Almost there...",
    "Please wait ⏳",
  ];
  const [step, setStep] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % messages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <p className="text-slate-500 text-sm font-medium">{messages[step]}</p>
    </div>
  );
};

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  isExisting?: boolean; // Flag to identify files loaded from backend
}

// Helper function to get auth token
// const getAuthToken = (): string | null => {
//   return localStorage.getItem("auth_token");
// };

export function SalesDashboard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [loadingFiles, setLoadingFiles] = useState(false);
  const router = useRouter();

  const {
    loading,
    hasData,
    dashboardData,
    fetchDashboardData,
    resetDashboard,
  } = useDashboardStore();
  const { uploading, uploadAndGenerate } = useUploadStore();
  const { deleteFile, loading: deleteLoading } = useDeleteFileStore();

  useEffect(() => {
    // Get user email from localStorage
    const email = localStorage.getItem("user_email") || "";
    setUserEmail(email);

    // Load existing files from backend
    loadExistingFiles();
  }, []);

  const loadExistingFiles = async () => {
    setLoadingFiles(true);
    try {
      // Use the fetchDataSources utility function
      const existingFiles = await fetchDataSources();
      console.log("Raw existing files from API:", existingFiles);

      if (!Array.isArray(existingFiles)) {
        console.warn("Existing files is not an array:", existingFiles);
        setUploadedFiles([]);
        return;
      }

      // Convert backend response to UploadedFile format
      const formattedFiles: UploadedFile[] = existingFiles.map((file: any) => {
        // Handle string filenames (e.g., "DistrictswiseCR_AEdataf_24-25.csv")
        if (typeof file === "string") {
          return {
            name: file,
            size: 0, // Default size since we don't have this info
            type: getFileTypeFromName(file), // Helper function to guess file type
            uploadedAt: new Date(), // Default date
            isExisting: true,
          };
        }

        // Handle file objects (if backend returns objects in the future)
        return {
          name:
            file.name || file.filename || file.originalname || "Unknown file",
          size: file.size || file.fileSize || 0,
          type:
            file.type ||
            file.mimetype ||
            getFileTypeFromName(file.name || file.filename || ""),
          uploadedAt:
            file.uploadedAt || file.createdAt || file.uploadDate
              ? new Date(file.uploadedAt || file.createdAt || file.uploadDate)
              : new Date(),
          isExisting: true,
        };
      });

      setUploadedFiles(formattedFiles);
      console.log(
        "Loaded existing files:",
        formattedFiles.length,
        formattedFiles,
      );
    } catch (error: any) {
      console.error("Failed to load existing files:", error);
      toast.error(error.message || "Failed to load existing files", {
        duration: 3000,
        position: "top-center",
      });
    } finally {
      setLoadingFiles(false);
    }
  };

  // Helper function to guess file type from filename
  const getFileTypeFromName = (filename: string): string => {
    if (!filename) return "application/octet-stream";

    const ext = filename.split(".").pop()?.toLowerCase();

    switch (ext) {
      case "csv":
        return "text/csv";
      case "xlsx":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      case "xls":
        return "application/vnd.ms-excel";
      case "json":
        return "application/json";
      case "txt":
        return "text/plain";
      case "pdf":
        return "application/pdf";
      default:
        return "application/octet-stream";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_email");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("token_type");
    router.push("/");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  console.log("📊 Dashboard State:", {
    loading,
    hasData,
    kpisCount: dashboardData.kpis?.length || 0,
    chartsCount: dashboardData.charts?.length || 0,
    dashboardData: dashboardData,
  });

  // Dynamic chart rendering function - ALL CONTENT FROM BACKEND
  const renderChart = (chartOption: any, index: number) => {
    console.log(`📈 Rendering chart ${index}:`, {
      title: chartOption.title?.text,
      seriesType: chartOption.series?.[0]?.type,
      dataLength: chartOption.series?.[0]?.data?.length,
    });

    // Fix chart option if it has doughnut type (ECharts uses pie with radius)
    const fixedChartOption = { ...chartOption };

    if (fixedChartOption.series) {
      fixedChartOption.series = fixedChartOption.series.map((series: any) => {
        if (series.type === "doughnut") {
          return {
            ...series,
            type: "pie",
            radius: ["40%", "70%"], // This creates a doughnut effect
          };
        }
        return series;
      });
    }

    return (
      <Card key={index} className="shadow-sm chart-container">
        <CardHeader>
          {/* Chart Title from backend */}
          <CardTitle>
            {fixedChartOption.title?.text || `Chart ${index + 1}`}
          </CardTitle>
          {/* Chart Description can be derived from tooltip or other properties */}
          <CardDescription>
            {fixedChartOption.tooltip?.formatter
              ? `Interactive chart showing ${fixedChartOption.title?.text?.toLowerCase() || "data"}`
              : "Data visualization"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReactECharts
            option={fixedChartOption}
            style={{ height: "400px" }}
            opts={{ renderer: "canvas" }}
          />
        </CardContent>
      </Card>
    );
  };

  // Dynamic KPI card rendering - ALL CONTENT FROM BACKEND
  const renderKPICard = (kpi: any, index: number) => {
    console.log(`📊 Rendering KPI ${index}:`, kpi);

    // Determine badge based on KPI title from backend
    let badgeVariant: "secondary" | "outline" | "default" | "destructive" =
      "secondary";
    let badgeIcon = "📊";

    if (kpi.title.includes("Sales") || kpi.title.includes("Revenue")) {
      badgeVariant = "secondary";
      badgeIcon = "₹";
    } else if (
      kpi.title.includes("Transaction") ||
      kpi.title.includes("Count")
    ) {
      badgeVariant = "outline";
      badgeIcon = "#";
    } else if (kpi.title.includes("Rating") || kpi.title.includes("Score")) {
      badgeVariant = "default";
      badgeIcon = "⭐";
    } else if (
      kpi.title.includes("Profit") ||
      kpi.title.includes("Income") ||
      kpi.title.includes("Margin")
    ) {
      badgeVariant = "destructive";
      badgeIcon = "💰";
    }

    return (
      <Card key={index} className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          {/* KPI Title from backend */}
          <CardTitle className="text-sm font-medium text-slate-600">
            {kpi.title}
          </CardTitle>
          <Badge variant={badgeVariant}>{badgeIcon}</Badge>
        </CardHeader>
        <CardContent>
          {/* KPI Value from backend */}
          <div className="text-2xl font-bold text-black">{kpi.value}</div>
          {/* KPI Description from backend */}
          <p className="text-xs text-muted-foreground">{kpi.description}</p>
        </CardContent>
      </Card>
    );
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const showSuccessMessage = (format: string) => {
    toast.success(`${format} downloaded successfully!`, {
      duration: 3000,
      position: "top-center",
    });
  };

  const handleHTMLExport = () => {
    try {
      const { kpis, charts } = dashboardData;

      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Supermarket Sales Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      background: #f8fafc;
      padding: 20px;
      color: #1e293b;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 { font-size: 2.5rem; text-align: center; margin-bottom: 10px; color: #1e293b; }
    .subtitle { text-align: center; color: #64748b; margin-bottom: 30px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .kpi-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .kpi-title { font-size: 0.875rem; color: #64748b; margin-bottom: 8px; }
    .kpi-value { font-size: 1.875rem; font-weight: bold; color: #1e293b; }
    .section { background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .section-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 15px; color: #1e293b; }
    .chart-container { 
      margin: 20px 0; 
      padding: 20px; 
      background: white; 
      border-radius: 12px; 
      box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
    }
    .chart-title { font-size: 1.125rem; font-weight: 600; margin-bottom: 10px; color: #1e293b; }
    .footer { text-align: center; color: #94a3b8; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Supermarket Sales Dashboard</h1>
    <p class="subtitle">Comprehensive sales analytics and performance insights</p>
    
    <div class="kpi-grid">
      ${kpis
        .map(
          (kpi) => `
        <div class="kpi-card">
          <div class="kpi-title">${kpi.title}</div>
          <div class="kpi-value">${kpi.value}</div>
          <p class="kpi-description">${kpi.description}</p>
        </div>
      `,
        )
        .join("")}
    </div>

    ${charts
      .map(
        (chart, index) => `
      <div class="section">
        <h2 class="section-title">${chart.title?.text || `Chart ${index + 1}`}</h2>
        <div class="chart-container">
          <!-- Chart ${index + 1}: ${chart.title?.text} -->
          <p><em>Note: Charts are rendered dynamically in the application. This HTML export contains data summaries only.</em></p>
          ${
            chart.series && chart.series[0] && chart.series[0].data
              ? `
            <p>Data Points: ${JSON.stringify(chart.series[0].data)}</p>
          `
              : ""
          }
        </div>
      </div>
    `,
      )
      .join("")}

    <div class="footer">
      Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
    </div>
  </div>
</body>
</html>
      `;

      const blob = new Blob([htmlContent], { type: "text/html" });
      downloadFile(blob, `Supermarket-Sales-Dashboard-${Date.now()}.html`);
      showSuccessMessage("HTML");
    } catch (error) {
      console.error("HTML export failed:", error);
      toast.error("Failed to export HTML. Please try again.", {
        duration: 3000,
        position: "top-center",
      });
    }
  };

  const handleExcelExport = async () => {
    try {
      setIsExporting(true);

      const { kpis, charts } = dashboardData;

      const wb = XLSX.utils.book_new();

      // Dashboard Summary Sheet
      const summaryData = [
        ["SUPERMARKET SALES DASHBOARD"],
        [],
        ["KEY PERFORMANCE INDICATORS"],
        ...kpis.map((kpi) => [kpi.title, kpi.value, kpi.description]),
        [],
        ["CHART SUMMARIES"],
      ];

      charts.forEach((chart, index) => {
        summaryData.push([]);
        summaryData.push([chart.title?.text || `Chart ${index + 1}`]);

        if (chart.series && chart.series[0] && chart.series[0].data) {
          summaryData.push(["Data Points:"]);
          chart.series[0].data.forEach((item: any) => {
            if (typeof item === "object") {
              summaryData.push([item.name || "Item", item.value || "Value"]);
            } else {
              summaryData.push([`Data Point`, item]);
            }
          });
        }
      });

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

      // Style the summary sheet
      summarySheet["!cols"] = [{ wch: 30 }, { wch: 20 }, { wch: 40 }];

      XLSX.utils.book_append_sheet(wb, summarySheet, "Dashboard Summary");

      XLSX.writeFile(wb, `Supermarket-Sales-Dashboard-${Date.now()}.xlsx`);
      showSuccessMessage("Excel");
    } catch (error) {
      console.error("Excel export failed:", error);
      toast.error("Failed to export Excel. Please try again.", {
        duration: 3000,
        position: "top-center",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = async (
    format: "jpeg" | "png" | "pdf" | "print" | "excel" | "html",
  ) => {
    if (!cardRef.current) return;

    if (format === "excel") {
      handleExcelExport();
      setShowDownloadMenu(false);
      return;
    }

    if (format === "html") {
      handleHTMLExport();
      setShowDownloadMenu(false);
      return;
    }

    setIsExporting(true);
    setShowDownloadMenu(false);

    try {
      switch (format) {
        case "jpeg":
        case "png": {
          const dataUrl =
            format === "png"
              ? await htmlToImage.toPng(cardRef.current, {
                  quality: 0.95,
                  backgroundColor: "#ffffff",
                  pixelRatio: 2,
                })
              : await htmlToImage.toJpeg(cardRef.current, {
                  quality: 0.95,
                  backgroundColor: "#ffffff",
                  pixelRatio: 2,
                });

          const blob = await (await fetch(dataUrl)).blob();
          const filename = `Supermarket-Dashboard-${Date.now()}.${format === "png" ? "png" : "jpg"}`;

          downloadFile(blob, filename);
          showSuccessMessage(format.toUpperCase());
          break;
        }

        case "pdf": {
          const pdf = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
          });

          const dataUrl = await htmlToImage.toJpeg(cardRef.current, {
            quality: 0.9,
            backgroundColor: "#ffffff",
            pixelRatio: 1.5,
          });

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();

          pdf.addImage(dataUrl, "JPEG", 0, 0, pdfWidth, pdfHeight);
          pdf.save(`Supermarket-Dashboard-${Date.now()}.pdf`);
          showSuccessMessage("PDF");
          break;
        }

        case "print": {
          const dataUrl = await htmlToImage.toJpeg(cardRef.current, {
            quality: 0.95,
            backgroundColor: "#ffffff",
            pixelRatio: 2,
          });

          const printWindow = window.open("", "_blank");
          if (!printWindow) {
            toast.error("Please allow popups to print", {
              duration: 3000,
              position: "top-center",
            });
            break;
          }

          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Supermarket Sales Dashboard</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background: white;
                }
                .print-header { 
                  text-align: center; 
                  margin-bottom: 20px;
                  padding-bottom: 15px;
                  border-bottom: 2px solid #e5e7eb;
                }
                .print-title { 
                  font-size: 24px; 
                  font-weight: bold; 
                  margin-bottom: 10px;
                  color: #1e293b;
                }
                .print-image { 
                  width: 100%; 
                  max-width: 100%;
                  border: 1px solid #e5e7eb;
                  border-radius: 8px;
                }
                .print-footer {
                  margin-top: 20px;
                  text-align: center;
                  font-size: 12px;
                  color: #94a3b8;
                  padding-top: 15px;
                  border-top: 1px solid #e5e7eb;
                }
                .no-print { 
                  margin-top: 20px; 
                  text-align: center;
                }
                .print-btn {
                  padding: 10px 20px;
                  background: #4f46e5;
                  color: white;
                  border: none;
                  border-radius: 6px;
                  cursor: pointer;
                  font-size: 14px;
                  font-weight: 500;
                }
                .print-btn:hover { background: #4338ca; }
                .close-btn {
                  padding: 10px 20px;
                  background: #6b7280;
                  color: white;
                  border: none;
                  border-radius: 6px;
                  margin-left: 10px;
                  cursor: pointer;
                  font-size: 14px;
                  font-weight: 500;
                }
                .close-btn:hover { background: #4b5563; }
                @media print {
                  body { margin: 0; padding: 10mm; }
                  .no-print { display: none; }
                  .print-image { border: none; }
                }
              </style>
            </head>
            <body>
              <div class="print-header">
                <div class="print-title">Supermarket Sales Dashboard</div>
              </div>
              <img src="${dataUrl}" class="print-image" alt="Dashboard" />
              <div class="print-footer">
                Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
              </div>
              <div class="no-print">
                <button onclick="window.print()" class="print-btn">Print Now</button>
                <button onclick="window.close()" class="close-btn">Close</button>
              </div>
              <script>
                window.onload = function() {
                  setTimeout(() => window.print(), 500);
                }
              </script>
            </body>
            </html>
          `);
          printWindow.document.close();
          break;
        }
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export. Please try again.", {
        duration: 3000,
        position: "top-center",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // File upload handling
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const userEmail = localStorage.getItem("user_email");
    if (!userEmail) {
      toast.error("Please login first", {
        duration: 3000,
        position: "top-center",
      });
      return;
    }

    try {
      // Upload files to backend
      await uploadAndGenerate(userEmail, Array.from(files));

      // Update local state for UI
      const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      toast.success(
        `Uploaded ${files.length} file(s) successfully! Data is ready for analysis.`,
        {
          duration: 3000,
          position: "top-center",
        },
      );
    } catch (error) {
      console.log("error",error)
      toast.error("Upload failed. Please try again.", {
        duration: 3000,
        position: "top-center",
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Delete file from backend
  const handleDeleteFile = async (filename: string, index: number) => {
    // Use toast for confirmation instead of alert
    toast.custom((t) => (
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg border p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-semibold text-slate-900">
              Delete File
            </h3>
            <div className="mt-1 text-sm text-slate-600">
              Are you sure you want to delete{" "}
              <span className="font-medium text-slate-900">&quot;{filename}&ldquo;</span>?
              This action cannot be undone.
            </div>
            <div className="mt-3 flex justify-end space-x-2">
              <button
                onClick={() => {
                  toast.dismiss(t);
                }}
                className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  toast.dismiss(t);
                  await performDelete(filename, index);
                }}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  // Perform the actual delete operation
  const performDelete = async (filename: string, index: number) => {
    const originalFiles = [...uploadedFiles]; // Keep backup in case deletion fails

    try {
      // Optimistically remove from UI
      setUploadedFiles((prev) => prev.filter((_, i) => i !== index));

      // Call the deleteFile function from store
      await deleteFile(filename);

      toast.success(`File "${filename}" deleted successfully!`, {
        duration: 2000,
        position: "top-center",
      });
    } catch (error: any) {
      console.error("Delete error:", error);

      // Restore the file if deletion failed
      setUploadedFiles(originalFiles);

      toast.error(`Failed to delete file: ${error.message}`, {
        duration: 3000,
        position: "top-center",
      });
    }
  };

  const handleRefreshFiles = async () => {
    await loadExistingFiles();
    toast.success("Files refreshed successfully!", {
      duration: 2000,
      position: "top-center",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleNewQuery = () => {
    console.log("🔄 Starting new query, resetting dashboard");
    resetDashboard();
    setUploadedFiles([]);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="w-full h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        <Toaster />
        <SequentialLoader />
      </div>
    );
  }

  // Show initial query input (no dashboard yet)
  if (!hasData) {
    return (
      <div className="w-full min-h-screen bg-gray-50 p-6">
        <Toaster />
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv,.json"
          onChange={handleFileUpload}
          className="hidden"
          multiple
        />

        {/* Welcome Section */}
        <div className="max-w-5xl mx-auto mb-10">
          {/* User info */}
          {userEmail && (
            <div className="flex justify-end mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-lg">
                <User className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-800">
                  {userEmail}
                </span>
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
              <LayoutDashboard className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-3">
              AI-Powered Dashboard Generator
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Describe what kind of dashboard you want, and our AI will generate
              it for you with interactive charts and insights.
            </p>
          </div>

          {/* Query Input with Upload Button */}
          <div className="w-full max-w-5xl mx-auto mb-6 space-y-3">
            {/* Query Input Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const query = (e.target as any).query?.value;
                if (!query?.trim() || loading) return;
                await fetchDashboardData(query.trim());
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                name="query"
                placeholder="Ask for a dashboard based on your uploaded data (e.g., 'Plot a sales Dashboard')"
                className="flex-1 text-base h-12 px-4 border-2 border-slate-200 focus:border-indigo-500 rounded-md"
                disabled={loading}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  variant="outline"
                  className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 h-12 px-4"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Data
                    </>
                  )}
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 h-12 px-6"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Dashboard
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Quick Query Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-slate-600 flex items-center gap-1">
                <Globe className="w-4 h-4" />
                Quick queries:
              </span>
              {[
                "Plot a sales Dashboard",
                "Show me product performance",
                "Analyze branch sales",
              ].map((q, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => fetchDashboardData(q)}
                  disabled={loading}
                  className="text-sm border-slate-300 hover:border-indigo-400 hover:bg-indigo-50"
                >
                  {q}
                </Button>
              ))}
            </div>

            {/* Uploaded Files Section - Only shown when files are uploaded */}
            <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-slate-700">
                    Available Files ({uploadedFiles.length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleRefreshFiles}
                    disabled={loadingFiles}
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-indigo-600 hover:bg-indigo-50 flex items-center gap-1"
                  >
                    {loadingFiles ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600"></div>
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    Refresh
                  </Button>
                  <Button
                    onClick={() => setUploadedFiles([])}
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-red-600 hover:bg-red-50"
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              {loadingFiles ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  <span className="ml-2 text-sm text-slate-600">
                    Loading files...
                  </span>
                </div>
              ) : uploadedFiles.length > 0 ? (
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded-md border border-slate-200 hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-md bg-indigo-100">
                          <File className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium text-slate-800 truncate"
                            title={file.name}
                          >
                            {file.name}
                            {file.isExisting && (
                              <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                Existing
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">
                              {formatFileSize(file.size)}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500">
                              {file.uploadedAt.toLocaleDateString()}{" "}
                              {file.uploadedAt.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteFile(file.name, index)}
                          disabled={deleteLoading}
                          className="ml-2 p-1 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                          title="Delete file from server permanently"
                        >
                          {deleteLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="w-4 h-4 text-red-600" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setUploadedFiles((prev) =>
                              prev.filter((_, i) => i !== index),
                            );
                            toast.success("File removed from list", {
                              duration: 2000,
                              position: "top-center",
                            });
                          }}
                          className="ml-2 p-1 hover:bg-red-100 rounded-md transition-colors"
                          title="Remove file from this list only"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <File className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">No files available</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload files to start analyzing data
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Start Examples */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">
              Try these examples:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <Card
                className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => fetchDashboardData("Plot a sales Dashboard")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <CardTitle className="text-base">Sales Dashboard</CardTitle>
                  </div>
                  <p className="text-sm text-slate-600">
                    Generate a complete sales performance dashboard with charts
                    and KPIs.
                  </p>
                </CardContent>
              </Card>

              <Card
                className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() =>
                  fetchDashboardData("Show me product performance")
                }
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <BarChart className="w-5 h-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-base">
                      Product Analysis
                    </CardTitle>
                  </div>
                  <p className="text-sm text-slate-600">
                    Analyze product performance across different categories and
                    metrics.
                  </p>
                </CardContent>
              </Card>

              <Card
                className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => fetchDashboardData("Analyze branch sales")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Globe className="w-5 h-5 text-purple-600" />
                    </div>
                    <CardTitle className="text-base">
                      Branch Comparison
                    </CardTitle>
                  </div>
                  <p className="text-sm text-slate-600">
                    Compare performance across different branches and locations.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show dashboard with data
  return (
    <div className="w-full h-full bg-gray-50 p-6">
      <Toaster />

      {/* Top Navigation Bar */}
      <div className="max-w-7xl mx-auto mb-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleNewQuery}
            variant="outline"
            className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            New Query
          </Button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg">
            <User className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-800">
              {userEmail}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleSettings}
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Query Input with Upload Button */}
      <div className="max-w-7xl mx-auto mb-6 space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv,.json"
          onChange={handleFileUpload}
          className="hidden"
          multiple
        />

        {/* Query Input Form */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const query = (e.target as any).query?.value;
            if (!query?.trim() || loading) return;
            await fetchDashboardData(query.trim());
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            name="query"
            placeholder="Ask for a dashboard based on your uploaded data (e.g., 'Plot a sales Dashboard')"
            className="flex-1 text-base h-12 px-4 border-2 border-slate-200 focus:border-indigo-500 rounded-md"
            disabled={loading}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              variant="outline"
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 h-12 px-4"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Data
                </>
              )}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 h-12 px-6"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Loading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate Dashboard
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Quick Query Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-slate-600 flex items-center gap-1">
            <Globe className="w-4 h-4" />
            Quick queries:
          </span>
          {[
            "Plot a sales Dashboard",
            "Show me product performance",
            "Analyze branch sales",
          ].map((q, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => fetchDashboardData(q)}
              disabled={loading}
              className="text-sm border-slate-300 hover:border-indigo-400 hover:bg-indigo-50"
            >
              {q}
            </Button>
          ))}
        </div>

        {/* Uploaded Files Section - Only shown when files are uploaded */}
        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-slate-700">
                Available Files ({uploadedFiles.length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefreshFiles}
                disabled={loadingFiles}
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-indigo-600 hover:bg-indigo-50 flex items-center gap-1"
              >
                {loadingFiles ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600"></div>
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                Refresh
              </Button>
              <Button
                onClick={() => setUploadedFiles([])}
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-red-600 hover:bg-red-50"
              >
                Clear All
              </Button>
            </div>
          </div>

          {loadingFiles ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-sm text-slate-600">
                Loading files...
              </span>
            </div>
          ) : uploadedFiles.length > 0 ? (
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-md border border-slate-200 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-md bg-indigo-100">
                      <File className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium text-slate-800 truncate"
                        title={file.name}
                      >
                        {file.name}
                        {file.isExisting && (
                          <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            Existing
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">
                          {formatFileSize(file.size)}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">
                          {file.uploadedAt.toLocaleDateString()}{" "}
                          {file.uploadedAt.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDeleteFile(file.name, index)}
                      disabled={deleteLoading}
                      className="ml-2 p-1 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                      title="Delete file from server permanently"
                    >
                      {deleteLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-600" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setUploadedFiles((prev) =>
                          prev.filter((_, i) => i !== index),
                        );
                        toast.success("File removed from list", {
                          duration: 2000,
                          position: "top-center",
                        });
                      }}
                      className="ml-2 p-1 hover:bg-red-100 rounded-md transition-colors"
                      title="Remove file from this list only"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <File className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-600">No files available</p>
              <p className="text-xs text-slate-500 mt-1">
                Upload files to start analyzing data
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dashboard Card */}
      <Card
        ref={cardRef}
        className="w-full max-w-7xl mx-auto shadow-2xl bg-white overflow-hidden"
      >
        <CardHeader className="border-b bg-white px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-600 shadow-lg">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">
                  AI-Generated Dashboard
                </CardTitle>
                <p className="text-sm text-slate-600">
                  Interactive analytics dashboard generated from your query
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </Badge>

              <div className="relative">
                <Button
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  disabled={isExporting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                >
                  {isExporting ? (
                    <>
                      <Download className="w-4 h-4 mr-2 animate-bounce" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </>
                  )}
                </Button>

                {showDownloadMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-50 bg-black/10"
                      onClick={() => setShowDownloadMenu(false)}
                    />
                    <div className="fixed right-4 top-20 w-80 bg-white rounded-2xl shadow-2xl border z-[60]">
                      <div className="p-4 border-b bg-slate-50">
                        <div className="text-base font-semibold text-slate-800">
                          Export Dashboard
                        </div>
                        <div className="text-sm text-slate-500 mt-1">
                          Choose your export format
                        </div>
                      </div>

                      <div className="p-3">
                        <button
                          onClick={() => handleDownload("excel")}
                          className="flex items-center w-full px-4 py-3.5 hover:bg-green-50 rounded-xl group mb-2"
                        >
                          <div className="p-2.5 bg-green-100 rounded-xl mr-4 group-hover:bg-green-200">
                            <FileSpreadsheet className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-slate-800">
                              Export as Excel
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Complete data in spreadsheet
                            </div>
                          </div>
                        </button>

                        <button
                          onClick={() => handleDownload("html")}
                          className="flex items-center w-full px-4 py-3.5 hover:bg-orange-50 rounded-xl group mb-2"
                        >
                          <div className="p-2.5 bg-orange-100 rounded-xl mr-4 group-hover:bg-orange-200">
                            <Globe className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-slate-800">
                              Export as HTML
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Standalone web page
                            </div>
                          </div>
                        </button>

                        <button
                          onClick={() => handleDownload("jpeg")}
                          className="flex items-center w-full px-4 py-3.5 hover:bg-blue-50 rounded-xl group mb-2"
                        >
                          <div className="p-2.5 bg-blue-100 rounded-xl mr-4 group-hover:bg-blue-200">
                            <Download className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-slate-800">
                              Download as JPEG
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Compressed format
                            </div>
                          </div>
                        </button>

                        <button
                          onClick={() => handleDownload("png")}
                          className="flex items-center w-full px-4 py-3.5 hover:bg-purple-50 rounded-xl group mb-2"
                        >
                          <div className="p-2.5 bg-purple-100 rounded-xl mr-4 group-hover:bg-purple-200">
                            <Download className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-slate-800">
                              Download as PNG
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              High quality
                            </div>
                          </div>
                        </button>

                        <button
                          onClick={() => handleDownload("pdf")}
                          className="flex items-center w-full px-4 py-3.5 hover:bg-red-50 rounded-xl group mb-2"
                        >
                          <div className="p-2.5 bg-red-100 rounded-xl mr-4 group-hover:bg-red-200">
                            <FileText className="w-5 h-5 text-red-600" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-slate-800">
                              Download as PDF
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Professional document
                            </div>
                          </div>
                        </button>

                        <div className="h-px bg-slate-200 my-3"></div>

                        <button
                          onClick={() => handleDownload("print")}
                          className="flex items-center w-full px-4 py-3.5 hover:bg-gray-50 rounded-xl group"
                        >
                          <div className="p-2.5 bg-gray-100 rounded-xl mr-4 group-hover:bg-gray-200">
                            <Printer className="w-5 h-5 text-gray-700" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-slate-800">
                              Print
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Send to printer
                            </div>
                          </div>
                        </button>
                      </div>

                      <div className="px-4 py-3 border-t bg-slate-50">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>
                            Generated {new Date().toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => setShowDownloadMenu(false)}
                            className="text-indigo-600 hover:text-indigo-700 font-semibold"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {loading ? (
            <div className="min-h-[600px] flex items-center justify-center">
              <SequentialLoader />
            </div>
          ) : (
            <div className="space-y-8">
              {/* SECTION 1: KPI Cards - Header Hardcoded, Content Dynamic */}
              {dashboardData.kpis && dashboardData.kpis.length > 0 && (
                <div>
                  {/* HARDCODED SECTION HEADER */}
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Key Performance Indicators
                  </h3>

                  {/* DYNAMIC CONTENT FROM BACKEND */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {dashboardData.kpis.map((kpi, index) =>
                      renderKPICard(kpi, index),
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 2: Charts - Header Hardcoded, Content Dynamic */}
              {dashboardData.charts && dashboardData.charts.length > 0 && (
                <div>
                  {/* HARDCODED SECTION HEADER */}
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-indigo-600" />
                    Visualizations
                  </h3>

                  {/* DYNAMIC CONTENT FROM BACKEND */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {dashboardData.charts.map((chart, index) =>
                      renderChart(chart, index),
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 3: Key Insights - Header Hardcoded, Content Dynamic */}
              <div>
                {/* HARDCODED SECTION HEADER */}
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  Key Insights
                </h3>

                {/* DYNAMIC CONTENT FROM BACKEND */}
                <Card className="shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    {dashboardData.kpis && dashboardData.kpis.length > 0 ? (
                      dashboardData.kpis.slice(0, 3).map((kpi, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3"
                        >
                          <Badge
                            variant={
                              index === 0
                                ? "default"
                                : index === 1
                                  ? "outline"
                                  : "secondary"
                            }
                          >
                            {index === 0
                              ? "Top"
                              : index === 1
                                ? "Important"
                                : "Notable"}
                          </Badge>
                          <span className="text-sm">
                            <strong>{kpi.title}:</strong> {kpi.value} -{" "}
                            {kpi.description}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No insights available
                      </p>
                    )}

                    {dashboardData.charts &&
                      dashboardData.charts.length > 0 && (
                        <div className="flex items-center space-x-3 pt-2 border-t">
                          <Badge variant="destructive">Charts</Badge>
                          <span className="text-sm">
                            Dashboard contains {dashboardData.charts.length}{" "}
                            interactive charts with detailed analytics
                          </span>
                        </div>
                      )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
