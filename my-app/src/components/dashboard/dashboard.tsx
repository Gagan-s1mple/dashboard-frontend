/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
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
} from "lucide-react";

import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { useDashboardStore } from "@/src/services/api/dashboard/dashboard-store";

const SequentialLoader = () => {
  const messages = [
    "Preparing dashboard...",
    "Loading data...",
    "Almost there...",
    "Please wait ⏳",
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
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

export  function SalesDashboard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const { loading, dashboardData, kpis, calculateKPIs } = useDashboardStore();

  useEffect(() => {
    calculateKPIs();
  }, []);

  // Chart Options
  const productLineChartOption = {
    title: { text: "Sales by Product Line", left: "center" },
    tooltip: { trigger: "item", formatter: "{a} <br/>{b}: ₹{c} ({d}%)" },
    legend: { orient: "vertical", left: "left" },
    series: [
      {
        name: "Product Sales",
        type: "pie",
        radius: "50%",
        data: dashboardData.productLineSales.map((item) => ({ value: item.value, name: item.name })),
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0, 0, 0, 0.5)" } },
      },
    ],
  };

  const monthlyTrendOption = {
    title: { text: "Monthly Sales Trend", left: "center" },
    tooltip: { trigger: "axis" },
    legend: { data: ["Sales", "Transactions"], top: 30 },
    xAxis: { type: "category", data: dashboardData.monthlyData.map((d) => d.month) },
    yAxis: [
      { type: "value", name: "Sales (₹)", position: "left" },
      { type: "value", name: "Transactions", position: "right" },
    ],
    series: [
      {
        name: "Sales",
        type: "line",
        yAxisIndex: 0,
        data: dashboardData.monthlyData.map((d) => d.sales),
        smooth: true,
        lineStyle: { width: 3 },
      },
      {
        name: "Transactions",
        type: "bar",
        yAxisIndex: 1,
        data: dashboardData.monthlyData.map((d) => d.transactions),
      },
    ],
  };

  const branchComparisonOption = {
    title: { text: "Branch Performance", left: "center" },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: { data: ["Sales", "Transactions"], top: 30 },
    xAxis: { type: "category", data: dashboardData.branchData.map((d) => `${d.branch} (${d.city})`) },
    yAxis: [{ type: "value", name: "Sales (₹)" }, { type: "value", name: "Transactions" }],
    series: [
      {
        name: "Sales",
        type: "bar",
        yAxisIndex: 0,
        data: dashboardData.branchData.map((d) => d.sales),
        itemStyle: { color: "#5470c6" },
      },
      {
        name: "Transactions",
        type: "bar",
        yAxisIndex: 1,
        data: dashboardData.branchData.map((d) => d.transactions),
        itemStyle: { color: "#91cc75" },
      },
    ],
  };

  const customerSegmentOption = {
    title: { text: "Customer Segment Analysis", left: "center" },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    xAxis: { type: "category", data: dashboardData.customerData.map((d) => `${d.type} ${d.gender}`) },
    yAxis: { type: "value", name: "Sales (₹)" },
    series: [
      {
        name: "Sales",
        type: "bar",
        data: dashboardData.customerData.map((d) => d.sales),
        itemStyle: { color: "#ee6666" },
      },
    ],
  };

  const paymentMethodOption = {
    title: { text: "Payment Method Distribution", left: "center" },
    tooltip: { trigger: "item" },
    series: [
      {
        name: "Payment Methods",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        label: { show: false, position: "center" },
        emphasis: { label: { show: true, fontSize: "30", fontWeight: "bold" } },
        labelLine: { show: false },
        data: dashboardData.paymentData.map((item) => ({ value: item.sales, name: item.method })),
      },
    ],
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
    const message = document.createElement("div");
    message.className = "fixed bottom-4 right-4 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg z-[100]";
    message.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span class="font-medium">${format} downloaded successfully!</span>
      </div>
    `;
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 3000);
  };

  const handleExcelExport = async () => {
    try {
      setIsExporting(true);
      
      // Prepare data for Python script
      const exportData = {
        kpis,
        dashboardData,
        outputFile: `Supermarket-Sales-Dashboard-${Date.now()}.xlsx`
      };
      
      // Create FormData to send to backend
      const formData = new FormData();
      formData.append('data', JSON.stringify(exportData));
      
      // Call backend API to generate Excel with charts
      const response = await fetch('/api/generate-excel-dashboard', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Excel generation failed');
      }
      
      // Download the file
      const blob = await response.blob();
      downloadFile(blob, exportData.outputFile);
      showSuccessMessage("Excel Dashboard with Charts");
    } catch (error) {
      console.error("Excel export failed:", error);
      
      // Fallback to basic XLSX export if backend fails
      try {
        const wb = XLSX.utils.book_new();
        
        // Dashboard Summary Sheet
        const summaryData = [
          ["SUPERMARKET SALES DASHBOARD"],
          [],
          ["KEY PERFORMANCE INDICATORS"],
          ["Total Sales", `₹${kpis.totalSales.toLocaleString()}`],
          ["Total Transactions", kpis.totalTransactions.toLocaleString()],
          ["Average Transaction Value", `₹${kpis.averageTransactionValue.toFixed(2)}`],
          ["Average Rating", `${kpis.avgRating.toFixed(2)}/10`],
          [],
          ["PRODUCT LINE SALES"],
          ["Product Line", "Sales (₹)", "Transactions", "Avg Value (₹)"],
          ...dashboardData.productLineSales.map((item) => [
            item.name,
            item.value,
            item.transactions,
            item.avgValue,
          ]),
          [],
          ["BRANCH PERFORMANCE"],
          ["Branch", "City", "Sales (₹)", "Transactions", "Rating"],
          ...dashboardData.branchData.map((item) => [
            item.branch,
            item.city,
            item.sales,
            item.transactions,
            item.rating,
          ]),
          [],
          ["MONTHLY TRENDS"],
          ["Month", "Sales (₹)", "Transactions"],
          ...dashboardData.monthlyData.map((item) => [item.month, item.sales, item.transactions]),
          [],
          ["CUSTOMER SEGMENTS"],
          ["Type", "Gender", "Sales (₹)", "Transactions", "Rating"],
          ...dashboardData.customerData.map((item) => [
            item.type,
            item.gender,
            item.sales,
            item.transactions,
            item.rating,
          ]),
          [],
          ["PAYMENT METHODS"],
          ["Payment Method", "Sales (₹)", "Transactions"],
          ...dashboardData.paymentData.map((item) => [item.method, item.sales, item.transactions]),
          [],
          ["KEY INSIGHTS"],
          ["• Food & Beverages leads in total sales (₹56,145)"],
          ["• Naypyitaw branch has highest sales (₹1,10,569) and rating (7.1/10)"],
          ["• March showed strong recovery with ₹1,09,456 in sales"],
          ["• Cash remains the preferred payment method (34.7% of total sales)"],
        ];
        
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        
        // Style the summary sheet
        summarySheet['!cols'] = [
          { wch: 30 },
          { wch: 20 },
          { wch: 15 },
          { wch: 15 },
          { wch: 10 }
        ];
        
        XLSX.utils.book_append_sheet(wb, summarySheet, "Dashboard");
        
        // Individual data sheets for reference
        const productSheet = XLSX.utils.json_to_sheet(dashboardData.productLineSales);
        XLSX.utils.book_append_sheet(wb, productSheet, "Product Lines");
        
        const branchSheet = XLSX.utils.json_to_sheet(dashboardData.branchData);
        XLSX.utils.book_append_sheet(wb, branchSheet, "Branches");
        
        const monthlySheet = XLSX.utils.json_to_sheet(dashboardData.monthlyData);
        XLSX.utils.book_append_sheet(wb, monthlySheet, "Monthly Data");
        
        const customerSheet = XLSX.utils.json_to_sheet(dashboardData.customerData);
        XLSX.utils.book_append_sheet(wb, customerSheet, "Customer Segments");
        
        const paymentSheet = XLSX.utils.json_to_sheet(dashboardData.paymentData);
        XLSX.utils.book_append_sheet(wb, paymentSheet, "Payment Methods");
        
        XLSX.writeFile(wb, `Supermarket-Sales-Dashboard-${Date.now()}.xlsx`);
        showSuccessMessage("Excel (Basic)");
      } catch (fallbackError) {
        console.error("Fallback export also failed:", fallbackError);
        alert("Failed to export Excel. Please try again.");
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleHTMLExport = () => {
    try {
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
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f1f5f9; font-weight: 600; color: #475569; }
    tr:hover { background: #f8fafc; }
    .insights { display: grid; gap: 15px; }
    .insight { padding: 15px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #6366f1; }
    .insight-title { font-weight: 600; margin-bottom: 5px; }
    .footer { text-align: center; color: #94a3b8; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Supermarket Sales Dashboard</h1>
    <p class="subtitle">Comprehensive sales analytics and performance insights</p>
    
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-title">Total Sales</div>
        <div class="kpi-value">₹${kpis.totalSales.toLocaleString()}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Total Transactions</div>
        <div class="kpi-value">${kpis.totalTransactions.toLocaleString()}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Avg Transaction</div>
        <div class="kpi-value">₹${kpis.averageTransactionValue.toFixed(0)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Avg Rating</div>
        <div class="kpi-value">${kpis.avgRating.toFixed(1)}/10</div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Product Line Sales</h2>
      <table>
        <thead>
          <tr>
            <th>Product Line</th>
            <th>Sales (₹)</th>
            <th>Transactions</th>
            <th>Avg Value (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${dashboardData.productLineSales
            .map(
              (item) => `
            <tr>
              <td>${item.name}</td>
              <td>₹${item.value.toLocaleString()}</td>
              <td>${item.transactions}</td>
              <td>₹${item.avgValue.toFixed(2)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2 class="section-title">Branch Performance</h2>
      <table>
        <thead>
          <tr>
            <th>Branch</th>
            <th>City</th>
            <th>Sales (₹)</th>
            <th>Transactions</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          ${dashboardData.branchData
            .map(
              (item) => `
            <tr>
              <td>${item.branch}</td>
              <td>${item.city}</td>
              <td>₹${item.sales.toLocaleString()}</td>
              <td>${item.transactions}</td>
              <td>${item.rating.toFixed(2)}/10</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2 class="section-title">Monthly Sales Trends</h2>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Sales (₹)</th>
            <th>Transactions</th>
          </tr>
        </thead>
        <tbody>
          ${dashboardData.monthlyData
            .map(
              (item) => `
            <tr>
              <td>${item.month}</td>
              <td>₹${item.sales.toLocaleString()}</td>
              <td>${item.transactions}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2 class="section-title">Customer Segments</h2>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Gender</th>
            <th>Sales (₹)</th>
            <th>Transactions</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          ${dashboardData.customerData
            .map(
              (item) => `
            <tr>
              <td>${item.type}</td>
              <td>${item.gender}</td>
              <td>₹${item.sales.toLocaleString()}</td>
              <td>${item.transactions}</td>
              <td>${item.rating.toFixed(2)}/10</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2 class="section-title">Payment Methods</h2>
      <table>
        <thead>
          <tr>
            <th>Payment Method</th>
            <th>Sales (₹)</th>
            <th>Transactions</th>
          </tr>
        </thead>
        <tbody>
          ${dashboardData.paymentData
            .map(
              (item) => `
            <tr>
              <td>${item.method}</td>
              <td>₹${item.sales.toLocaleString()}</td>
              <td>${item.transactions}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2 class="section-title">Key Insights</h2>
      <div class="insights">
        <div class="insight">
          <div class="insight-title">Top Performer</div>
          <p>Food & Beverages leads in total sales (₹56,145)</p>
        </div>
        <div class="insight">
          <div class="insight-title">Best Branch</div>
          <p>Naypyitaw branch has highest sales (₹1,10,569) and rating (7.1/10)</p>
        </div>
        <div class="insight">
          <div class="insight-title">Growth</div>
          <p>March showed strong recovery with ₹1,09,456 in sales</p>
        </div>
        <div class="insight">
          <div class="insight-title">Payment</div>
          <p>Cash remains the preferred payment method (34.7% of total sales)</p>
        </div>
      </div>
    </div>

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
      alert("Failed to export HTML. Please try again.");
    }
  };

  const handleDownload = async (format: "jpeg" | "png" | "pdf" | "print" | "excel" | "html") => {
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
            alert("Please allow popups to print");
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
      alert("Failed to export. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Handle file upload logic here
    console.log("File uploaded:", file.name);
    alert(`File "${file.name}" uploaded successfully! (Processing not implemented in this demo)`);
  };

  return (
    <div className="w-full h-full bg-gray-50 p-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileUpload}
        className="hidden"
      />

      <Card className="w-full shadow-2xl bg-white overflow-hidden">
        <CardHeader className="border-b bg-white px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-600 shadow-lg">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">
                  Supermarket Sales Dashboard
                </CardTitle>
                <p className="text-sm text-slate-600">Comprehensive sales analytics and performance insights</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300">
                <Calendar className="w-3 h-3 mr-1" />
                Jan - Mar 2019
              </Badge>

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Data
              </Button>

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
                        <div className="text-base font-semibold text-slate-800">Export Dashboard</div>
                        <div className="text-sm text-slate-500 mt-1">Choose your export format</div>
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
                            <div className="font-semibold text-slate-800">Export as Excel</div>
                            <div className="text-xs text-slate-500 mt-0.5">Complete data in spreadsheet</div>
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
                            <div className="font-semibold text-slate-800">Export as HTML</div>
                            <div className="text-xs text-slate-500 mt-0.5">Standalone web page</div>
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
                            <div className="font-semibold text-slate-800">Download as JPEG</div>
                            <div className="text-xs text-slate-500 mt-0.5">Compressed format</div>
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
                            <div className="font-semibold text-slate-800">Download as PNG</div>
                            <div className="text-xs text-slate-500 mt-0.5">High quality</div>
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
                            <div className="font-semibold text-slate-800">Download as PDF</div>
                            <div className="text-xs text-slate-500 mt-0.5">Professional document</div>
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
                            <div className="font-semibold text-slate-800">Print</div>
                            <div className="text-xs text-slate-500 mt-0.5">Send to printer</div>
                          </div>
                        </button>
                      </div>

                      <div className="px-4 py-3 border-t bg-slate-50">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Generated {new Date().toLocaleDateString()}</span>
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

        <CardContent ref={cardRef} className="p-6">
          {loading ? (
            <div className="min-h-[600px] flex items-center justify-center">
              <SequentialLoader />
            </div>
          ) : (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Key Performance Indicators
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-slate-600">Total Sales</CardTitle>
                      <Badge variant="secondary">₹</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-black">₹{kpis.totalSales.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Revenue in Indian Rupees</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-slate-600">Total Transactions</CardTitle>
                      <Badge variant="secondary">#</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-black">
                        {kpis.totalTransactions.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Number of sales transactions</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-slate-600">Avg Transaction</CardTitle>
                      <Badge variant="secondary">₹</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-black">
                        ₹{kpis.averageTransactionValue.toFixed(0)}
                      </div>
                      <p className="text-xs text-muted-foreground">Average transaction value</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-slate-600">Avg Rating</CardTitle>
                      <Badge variant="secondary">⭐</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-black">{kpis.avgRating.toFixed(1)}/10</div>
                      <p className="text-xs text-muted-foreground">Customer satisfaction</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Charts Section */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <BarChart className="w-5 h-5 text-indigo-600" />
                  Visualizations
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="shadow-sm chart-container">
                    <CardHeader>
                      <CardTitle>Product Line Performance</CardTitle>
                      <CardDescription>Sales distribution across product categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ReactECharts option={productLineChartOption} style={{ height: "400px" }} />
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm chart-container">
                    <CardHeader>
                      <CardTitle>Monthly Sales Trend</CardTitle>
                      <CardDescription>Sales and transaction trends over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ReactECharts option={monthlyTrendOption} style={{ height: "400px" }} />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Middle Row Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm chart-container">
                  <CardHeader>
                    <CardTitle>Branch Comparison</CardTitle>
                    <CardDescription>Performance comparison across different branches</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReactECharts option={branchComparisonOption} style={{ height: "400px" }} />
                  </CardContent>
                </Card>

                <Card className="shadow-sm chart-container">
                  <CardHeader>
                    <CardTitle>Customer Segments</CardTitle>
                    <CardDescription>Sales analysis by customer type and gender</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReactECharts option={customerSegmentOption} style={{ height: "400px" }} />
                  </CardContent>
                </Card>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="shadow-sm chart-container">
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Distribution of payment preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReactECharts option={paymentMethodOption} style={{ height: "300px" }} />
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2 shadow-sm">
                  <CardHeader>
                    <CardTitle>Key Insights</CardTitle>
                    <CardDescription>Summary of important findings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Badge>Top Performer</Badge>
                      <span className="text-sm">Food & Beverages leads in total sales (₹56,145)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">Best Branch</Badge>
                      <span className="text-sm">
                        Naypyitaw branch has highest sales (₹1,10,569) and rating (7.1/10)
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">Growth</Badge>
                      <span className="text-sm">March showed strong recovery with ₹1,09,456 in sales</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="destructive">Payment</Badge>
                      <span className="text-sm">
                        Cash remains the preferred payment method (34.7% of total sales)
                      </span>
                    </div>
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