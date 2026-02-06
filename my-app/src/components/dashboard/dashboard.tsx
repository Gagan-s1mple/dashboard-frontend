/* eslint-disable react/no-unescaped-entities */

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
  Plus,
  MoreVertical,
  Send,
  Check,
  Database,
} from "lucide-react";

import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
// CHANGED THIS IMPORT ONLY:
import { useDashboardStore } from "@/src/services/api/dashboard/dashboard-api-store";

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
    }, 20000);
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
  isExisting?: boolean;
}

export function SalesDashboard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [loadingFiles, setLoadingFiles] = useState(false);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [recentlyUploadedFile, setRecentlyUploadedFile] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const {
    loading,
    hasData,
    dashboardData,
    fetchDashboardData,
    resetDashboard,
    polling,
    currentTaskId,
    stopPolling,
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
    polling,
    currentTaskId,
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
      
      // Set the recently uploaded file name for display
      const uploadedFileName = files[0].name;
      setRecentlyUploadedFile(uploadedFileName);
      setUploadSuccess(true);

      toast.success(
        `Uploaded ${files.length} file(s) successfully! Data is ready for analysis.`,
        {
          duration: 3000,
          position: "top-center",
        },
      );
      
      // Wait for 3 seconds, then close upload modal and show file selection dialog
      setTimeout(() => {
        setShowFileUploadModal(false);
        setRecentlyUploadedFile(null);
        setUploadSuccess(false);
        setShowFileDialog(true);
      }, 3000);
      
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
  const handleDeleteFile = async (filename: string) => {
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
              <span className="font-medium text-slate-900">"{filename}"</span>?
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
                  await performDelete(filename);
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
  const performDelete = async (filename: string) => {
    const originalFiles = [...uploadedFiles]; // Keep backup in case deletion fails

    try {
      // Optimistically remove from UI
      setUploadedFiles((prev) => prev.filter((file) => file.name !== filename));
      setSelectedFiles((prev) => prev.filter((file) => file !== filename));

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
    setSelectedFiles([]);
    setQuery("");
  };

  // Get file names for API call
  const getFileNames = () => {
    if (selectedFiles.length === 0) {
      toast.warning("Please select at least one file to analyze", {
        duration: 3000,
        position: "top-center",
      });
      return "";
    }
    return selectedFiles.join(",");
  };

  const handleSendQuery = async () => {
    if (!query.trim()) {
      toast.error("Please enter a query", {
        duration: 3000,
        position: "top-center",
      });
      return;
    }

    const fileNames = getFileNames();
    if (!fileNames) return;

    // Log the parameters being sent
    console.log("📤 Sending query to backend:");
    console.log("  - Query:", query.trim());
    console.log("  - File Names:", fileNames);
    console.log("  - Selected Files Array:", selectedFiles);

    await fetchDashboardData(query.trim(), fileNames);
  };

  const toggleFileSelection = (fileName: string) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileName)) {
        return prev.filter(f => f !== fileName);
      } else {
        return [...prev, fileName];
      }
    });
  };

  // Show loading state
  if (loading || polling) {
    return (
      <div className="w-full h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        <Toaster />
        <SequentialLoader />
        {polling && currentTaskId && (
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-500">
              Generating dashboard... Task ID: {currentTaskId.slice(0, 8)}...
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Polling every 20 seconds for status
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={stopPolling}
              className="mt-2"
            >
              Cancel Generation
            </Button>
          </div>
        )}
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
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <div className="bg-white border-2 border-slate-200 focus-within:border-indigo-500 rounded-md overflow-hidden">
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask for a dashboard based on your uploaded data (e.g., 'Plot a sales Dashboard')"
                    className="w-full text-base h-32 px-4 py-3 outline-none resize-none"
                    disabled={loading}
                  />
                  
                  {/* Selected files display inside chat bubble */}
                  {selectedFiles.length > 0 && (
                    <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
                      <div className="flex items-center gap-2 mb-1">
                        <File className="w-3 h-3 text-slate-500" />
                        <span className="text-xs text-slate-500">Selected files:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedFiles.map((file) => (
                          <div
                            key={file}
                            className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200"
                          >
                            <File className="w-3 h-3 text-slate-500" />
                            <span className="text-xs text-slate-700 truncate max-w-[80px]">
                              {file}
                            </span>
                            <button
                              onClick={() => toggleFileSelection(file)}
                              className="text-slate-400 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between">
                    {/* Plus button for file selection */}
                    <button
                      onClick={() => setShowFileDialog(true)}
                      className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-2"
                      title="Select files"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-sm">Select Files</span>
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {/* Send button inside chat bubble */}
                      <button
                        onClick={handleSendQuery}
                        disabled={!query.trim() || selectedFiles.length === 0 || loading}
                        className={`p-2 rounded-full transition-colors ${
                          query.trim() && selectedFiles.length > 0 && !loading
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
                  onClick={() => {
                    setQuery(q);
                    const fileNames = getFileNames();
                    if (fileNames) {
                      fetchDashboardData(q, fileNames);
                    }
                  }}
                  disabled={loading}
                  className="text-sm border-slate-300 hover:border-indigo-400 hover:bg-indigo-50"
                >
                  {q}
                </Button>
              ))}
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
                onClick={() => {
                  const fileNames = getFileNames();
                  if (fileNames) {
                    fetchDashboardData("Plot a sales Dashboard", fileNames);
                  }
                }}
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
                onClick={() => {
                  const fileNames = getFileNames();
                  if (fileNames) {
                    fetchDashboardData("Show me product performance", fileNames);
                  }
                }}
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
                onClick={() => {
                  const fileNames = getFileNames();
                  if (fileNames) {
                    fetchDashboardData("Analyze branch sales", fileNames);
                  }
                }}
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

        {/* File Selection Dialog */}
        {showFileDialog && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowFileDialog(false)}
            />
            <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[80vh] bg-white rounded-lg shadow-xl z-50 flex flex-col">
              <div className="p-6 border-b flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="w-6 h-6 text-indigo-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Select Data Sources</h3>
                      <p className="text-sm text-slate-500">
                        Choose the data sources you want to analyze
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFileDialog(false)}
                    className="p-2 hover:bg-slate-100 rounded-md"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 flex gap-6 p-6 overflow-hidden">
                {/* Left side - Available files */}
                <div className="flex-1 flex flex-col border border-slate-200 rounded-lg bg-white">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-800">Available Files</h4>
                      <Badge variant="secondary">
                        {uploadedFiles.length} available
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500">
                      Select files from your uploaded data
                    </p>
                  </div>
                  
                  <div className="flex-1 overflow-auto p-4">
                    {uploadedFiles.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full py-12">
                        <File className="w-12 h-12 text-slate-300 mb-3" />
                        <p className="text-base text-slate-500 font-medium">
                          No files available
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          Upload files to start analyzing data
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {uploadedFiles.map((file) => (
                          <div
                            key={file.name}
                            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="p-2 rounded-md bg-indigo-100">
                                <File className="w-4 h-4 text-indigo-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">
                                  {file.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-slate-500">
                                    {formatFileSize(file.size)}
                                  </span>
                                  <span className="text-xs text-slate-400">•</span>
                                  <span className="text-xs text-slate-500">
                                    {file.uploadedAt.toLocaleDateString()}
                                  </span>
                                  {file.isExisting && (
                                    <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                                      Existing
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => toggleFileSelection(file.name)}
                                className={`p-1.5 rounded-md transition-colors ${
                                  selectedFiles.includes(file.name)
                                    ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                                title={selectedFiles.includes(file.name) ? "Remove from selection" : "Add to selection"}
                              >
                                {selectedFiles.includes(file.name) ? (
                                  <X className="w-4 h-4" />
                                ) : (
                                  <Plus className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteFile(file.name)}
                                disabled={deleteLoading}
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                                title="Delete file"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 border-t">
                    <button
                      onClick={() => {
                        setShowFileDialog(false);
                        setShowFileUploadModal(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      <Upload className="w-5 h-5" />
                      <span className="font-medium">Upload New File</span>
                    </button>
                  </div>
                </div>
                
                {/* Right side - Selected files */}
                <div className="flex-1 flex flex-col border border-slate-200 rounded-lg bg-white">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-800">Selected Files</h4>
                      {selectedFiles.length > 0 && (
                        <Badge variant="secondary">
                          {selectedFiles.length} selected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      Files that will be used for analysis
                    </p>
                  </div>
                  
                  <div className="flex-1 overflow-auto p-4">
                    {selectedFiles.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full py-12">
                        <File className="w-12 h-12 text-slate-300 mb-3" />
                        <p className="text-base text-slate-500 font-medium">
                          No files selected
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          Select files from the left panel
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedFiles.map((fileName) => {
                          const file = uploadedFiles.find(f => f.name === fileName);
                          return (
                            <div
                              key={fileName}
                              className="flex items-center justify-between p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="p-2 rounded-md bg-indigo-100">
                                  <File className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-800 truncate">
                                    {fileName}
                                  </p>
                                  {file && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-slate-500">
                                        {formatFileSize(file.size)}
                                      </span>
                                      <span className="text-xs text-slate-400">•</span>
                                      <span className="text-xs text-slate-500">
                                        {file.uploadedAt.toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => toggleFileSelection(fileName)}
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                                title="Remove file"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 border-t">
                    {selectedFiles.length > 0 && (
                      <button
                        onClick={() => setSelectedFiles([])}
                        className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                      >
                        Clear All Selections
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t flex-shrink-0 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFileDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setShowFileDialog(false)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Done
                </Button>
              </div>
            </div>
          </>
        )}

        {/* File Upload Modal */}
        {showFileUploadModal && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowFileUploadModal(false)}
            />
            <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-lg shadow-xl z-50">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Upload New File</h3>
                  <button
                    onClick={() => setShowFileUploadModal(false)}
                    className="p-1 hover:bg-slate-100 rounded-md"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                    multiple
                  />
                  
                  {/* Upload success message */}
                  {uploadSuccess && recentlyUploadedFile ? (
                    <div className="border-2 border-green-500 rounded-lg p-8 text-center bg-green-50">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="w-8 h-8 text-green-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-green-700 mb-2">Upload Successful!</h4>
                      <p className="text-green-600 mb-1">
                        File uploaded: <span className="font-medium">{recentlyUploadedFile}</span>
                      </p>
                      <p className="text-sm text-green-500">
                        Returning to file selection in 3 seconds...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition-colors"
                      >
                        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">Click to upload files</p>
                        <p className="text-sm text-slate-500 mt-1">
                          Supported formats: CSV, Excel, JSON
                        </p>
                      </div>
                      
                      {uploading && (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                          <span className="ml-2 text-sm text-slate-600">Uploading...</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowFileUploadModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
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
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <div className="bg-white border-2 border-slate-200 focus-within:border-indigo-500 rounded-md overflow-hidden">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask for a dashboard based on your uploaded data (e.g., 'Plot a sales Dashboard')"
                className="w-full text-base h-32 px-4 py-3 outline-none resize-none"
                disabled={loading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendQuery();
                  }
                }}
              />
              
              {/* Selected files display inside chat bubble */}
              {selectedFiles.length > 0 && (
                <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-2 mb-1">
                    <File className="w-3 h-3 text-slate-500" />
                    <span className="text-xs text-slate-500">Selected files:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedFiles.map((file) => (
                      <div
                        key={file}
                        className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200"
                      >
                        <File className="w-3 h-3 text-slate-500" />
                        <span className="text-xs text-slate-700 truncate max-w-[80px]">
                          {file}
                        </span>
                        <button
                          onClick={() => toggleFileSelection(file)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between">
                {/* Plus button for file selection */}
                <button
                  onClick={() => setShowFileDialog(true)}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-2"
                  title="Select files"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-sm">Select Files</span>
                </button>
                
                <div className="flex items-center gap-2">
                  {/* Send button inside chat bubble */}
                  <button
                    onClick={handleSendQuery}
                    disabled={!query.trim() || selectedFiles.length === 0 || loading}
                    className={`p-2 rounded-full transition-colors ${
                      query.trim() && selectedFiles.length > 0 && !loading
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

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
              onClick={() => {
                setQuery(q);
                const fileNames = getFileNames();
                if (fileNames) {
                  fetchDashboardData(q, fileNames);
                }
              }}
              disabled={loading}
              className="text-sm border-slate-300 hover:border-indigo-400 hover:bg-indigo-50"
            >
              {q}
            </Button>
          ))}
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap=6">
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

      {/* File Selection Dialog */}
      {showFileDialog && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowFileDialog(false)}
          />
          <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[80vh] bg-white rounded-lg shadow-xl z-50 flex flex-col">
            <div className="p-6 border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-6 h-6 text-indigo-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Select Data Sources</h3>
                    <p className="text-sm text-slate-500">
                      Choose the data sources you want to analyze
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFileDialog(false)}
                  className="p-2 hover:bg-slate-100 rounded-md"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 flex gap-6 p-6 overflow-hidden">
              {/* Left side - Available files */}
              <div className="flex-1 flex flex-col border border-slate-200 rounded-lg bg-white">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-800">Available Files</h4>
                    <Badge variant="secondary">
                      {uploadedFiles.length} available
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    Select files from your uploaded data
                    </p>
                  </div>
                  
                  <div className="flex-1 overflow-auto p-4">
                    {uploadedFiles.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full py-12">
                        <File className="w-12 h-12 text-slate-300 mb-3" />
                        <p className="text-base text-slate-500 font-medium">
                          No files available
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          Upload files to start analyzing data
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {uploadedFiles.map((file) => (
                          <div
                            key={file.name}
                            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="p-2 rounded-md bg-indigo-100">
                                <File className="w-4 h-4 text-indigo-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">
                                  {file.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-slate-500">
                                    {formatFileSize(file.size)}
                                  </span>
                                  <span className="text-xs text-slate-400">•</span>
                                  <span className="text-xs text-slate-500">
                                    {file.uploadedAt.toLocaleDateString()}
                                  </span>
                                  {file.isExisting && (
                                    <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                                      Existing
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => toggleFileSelection(file.name)}
                                className={`p-1.5 rounded-md transition-colors ${
                                  selectedFiles.includes(file.name)
                                    ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                                title={selectedFiles.includes(file.name) ? "Remove from selection" : "Add to selection"}
                              >
                                {selectedFiles.includes(file.name) ? (
                                  <X className="w-4 h-4" />
                                ) : (
                                  <Plus className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteFile(file.name)}
                                disabled={deleteLoading}
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                                title="Delete file"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 border-t">
                    <button
                      onClick={() => {
                        setShowFileDialog(false);
                        setShowFileUploadModal(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      <Upload className="w-5 h-5" />
                      <span className="font-medium">Upload New File</span>
                    </button>
                  </div>
                </div>
                
                {/* Right side - Selected files */}
                <div className="flex-1 flex flex-col border border-slate-200 rounded-lg bg-white">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-800">Selected Files</h4>
                      {selectedFiles.length > 0 && (
                        <Badge variant="secondary">
                          {selectedFiles.length} selected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      Files that will be used for analysis
                    </p>
                  </div>
                  
                  <div className="flex-1 overflow-auto p-4">
                    {selectedFiles.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full py-12">
                        <File className="w-12 h-12 text-slate-300 mb-3" />
                        <p className="text-base text-slate-500 font-medium">
                          No files selected
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          Select files from the left panel
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedFiles.map((fileName) => {
                          const file = uploadedFiles.find(f => f.name === fileName);
                          return (
                            <div
                              key={fileName}
                              className="flex items-center justify-between p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="p-2 rounded-md bg-indigo-100">
                                  <File className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-800 truncate">
                                    {fileName}
                                  </p>
                                  {file && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-slate-500">
                                        {formatFileSize(file.size)}
                                      </span>
                                      <span className="text-xs text-slate-400">•</span>
                                      <span className="text-xs text-slate-500">
                                        {file.uploadedAt.toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => toggleFileSelection(fileName)}
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                                title="Remove file"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 border-t">
                    {selectedFiles.length > 0 && (
                      <button
                        onClick={() => setSelectedFiles([])}
                        className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                      >
                        Clear All Selections
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t flex-shrink-0 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFileDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setShowFileDialog(false)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Done
                </Button>
              </div>
            </div>
          </>
        )}

        {/* File Upload Modal */}
        {showFileUploadModal && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowFileUploadModal(false)}
            />
            <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-lg shadow-xl z-50">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Upload New File</h3>
                  <button
                    onClick={() => setShowFileUploadModal(false)}
                    className="p-1 hover:bg-slate-100 rounded-md"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                    multiple
                  />
                  
                  {/* Upload success message */}
                  {uploadSuccess && recentlyUploadedFile ? (
                    <div className="border-2 border-green-500 rounded-lg p-8 text-center bg-green-50">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="w-8 h-8 text-green-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-green-700 mb-2">Upload Successful!</h4>
                      <p className="text-green-600 mb-1">
                        File uploaded: <span className="font-medium">{recentlyUploadedFile}</span>
                      </p>
                      <p className="text-sm text-green-500">
                        Returning to file selection in 3 seconds...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition-colors"
                      >
                        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">Click to upload files</p>
                        <p className="text-sm text-slate-500 mt-1">
                          Supported formats: CSV, Excel, JSON
                        </p>
                      </div>
                      
                      {uploading && (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                          <span className="ml-2 text-sm text-slate-600">Uploading...</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowFileUploadModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
    </div>
  );
}