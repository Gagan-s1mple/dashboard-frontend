/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  LayoutDashboard,
  TrendingUp,
  BarChart,
  FileText,
  Printer,
  Download,
  FileSpreadsheet,
  FileJson,
  Image,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { ChartDownloadButton } from "./chart-download-button";
import { SequentialLoader } from "./loaders";

interface DashboardCardProps {
  dashboardData: any;
  timestamp: Date;
  cardRef?: React.RefObject<HTMLDivElement>;
  showLoader?: boolean;
}

export const DashboardCard = ({
  dashboardData,
  timestamp,
  cardRef,
  showLoader,
}: DashboardCardProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const dashboardCardRef = useRef<HTMLDivElement>(null);

  const hasKPIs =
    dashboardData?.kpis &&
    Array.isArray(dashboardData.kpis) &&
    dashboardData.kpis.length > 0;
  const hasCharts =
    dashboardData?.charts &&
    Array.isArray(dashboardData.charts) &&
    dashboardData.charts.length > 0;
  const hasContent =
    dashboardData?.content &&
    typeof dashboardData.content === "string" &&
    dashboardData.content.trim() !== "";
  const hasTable =
    dashboardData?.table &&
    Array.isArray(dashboardData.table) &&
    dashboardData.table.length > 0;

  const renderChart = (chartOption: any, index: number) => {
    const fixedChartOption = { ...chartOption };

    // Remove the title from inside the chart - only show in header
    if (fixedChartOption.title) {
      fixedChartOption.title = { ...fixedChartOption.title, show: false };
    }

    if (fixedChartOption.series) {
      fixedChartOption.series = fixedChartOption.series.map((series: any) => {
        if (series.type === "doughnut") {
          return {
            ...series,
            type: "pie",
            radius: ["40%", "70%"],
          };
        }
        return series;
      });
    }

    // Generate a title for download button
    const chartTitle = chartOption.title?.text || `Chart ${index + 1}`;

    return (
      <Card
        key={`chart-${chartTitle}-${index}`}
        className="shadow-sm chart-container relative group"
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">{chartTitle}</CardTitle>
          <ChartDownloadButton
            chartOption={fixedChartOption}
            chartTitle={chartTitle}
          />
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ReactECharts
              option={fixedChartOption}
              style={{ height: "100%", width: "100%" }}
              opts={{ renderer: "canvas" }}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderKPICard = (kpi: any, index: number) => {
    if (!kpi || !kpi.title) {
      return null;
    }

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
      <Card key={`kpi-${kpi.title}-${index}`} className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            {kpi.title}
          </CardTitle>
          <Badge variant={badgeVariant}>{badgeIcon}</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-black">{kpi.value}</div>
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

  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      if (dashboardData.kpis && dashboardData.kpis.length > 0) {
        const kpiData = dashboardData.kpis.map((kpi: any) => ({
          Metric: kpi.title,
          Value: kpi.value,
          Description: kpi.description || "",
        }));
        const kpiWs = XLSX.utils.json_to_sheet(kpiData);
        XLSX.utils.book_append_sheet(wb, kpiWs, "KPIs");
      }

      if (dashboardData.charts && dashboardData.charts.length > 0) {
        const chartData: any[] = [];
        dashboardData.charts.forEach((chart: any, idx: number) => {
          const chartTitle = chart.title?.text || `Chart ${idx + 1}`;

          if (chart.series && chart.series.length > 0) {
            chart.series.forEach((series: any) => {
              if (series.data && Array.isArray(series.data)) {
                series.data.forEach((item: any, dataIdx: number) => {
                  chartData.push({
                    Chart: chartTitle,
                    Series: series.name || `Series ${dataIdx + 1}`,
                    Category: item.name || `Item ${dataIdx + 1}`,
                    Value: item.value || item,
                  });
                });
              }
            });
          }
        });

        if (chartData.length > 0) {
          const chartWs = XLSX.utils.json_to_sheet(chartData);
          XLSX.utils.book_append_sheet(wb, chartWs, "Chart Data");
        }
      }

      XLSX.writeFile(wb, `dashboard-${Date.now()}.xlsx`);
      toast.success("Excel file downloaded successfully!");
    } catch (error) {
      
      toast.error("Failed to export as Excel");
    }
  };

  const exportToHTML = async () => {
    if (!dashboardCardRef.current) return;

    try {
      const dashboardHTML = dashboardCardRef.current.outerHTML;
      const fullHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Dashboard Export - ${new Date().toLocaleDateString()}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
              padding: 20px;
              background: white;
              color: #1e293b;
            }
            .dashboard-container {
              max-width: 1400px;
              margin: 0 auto;
            }
            .kpi-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 16px;
              margin-bottom: 24px;
            }
            .chart-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
              gap: 20px;
            }
            .card {
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 16px;
              background: white;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="dashboard-container">
            ${dashboardHTML}
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([fullHTML], { type: "text/html" });
      downloadFile(blob, `dashboard-${Date.now()}.html`);
      toast.success("HTML file downloaded successfully!");
    } catch (error) {
 
      toast.error("Failed to export as HTML");
    }
  };

  const handleDownload = async (format: string) => {
    if (!dashboardCardRef.current) return;

    setIsExporting(true);
    setShowDownloadMenu(false);

    try {
      if (format === "png") {
        const canvas = await htmlToImage.toCanvas(dashboardCardRef.current, {
          backgroundColor: "#ffffff",
          pixelRatio: 2,
        });
        const image = canvas.toDataURL("image/png");
        const blob = await (await fetch(image)).blob();
        downloadFile(blob, `dashboard-${Date.now()}.png`);
        toast.success("PNG downloaded successfully!");
      } else if (format === "jpg") {
        const canvas = await htmlToImage.toCanvas(dashboardCardRef.current, {
          backgroundColor: "#ffffff",
          pixelRatio: 2,
        });
        const image = canvas.toDataURL("image/jpeg", 0.95);
        const blob = await (await fetch(image)).blob();
        downloadFile(blob, `dashboard-${Date.now()}.jpg`);
        toast.success("JPG downloaded successfully!");
      } else if (format === "pdf") {
        const canvas = await htmlToImage.toCanvas(dashboardCardRef.current, {
          backgroundColor: "#ffffff",
          pixelRatio: 2,
        });
        const image = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [canvas.width, canvas.height],
        });
        pdf.addImage(image, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save(`dashboard-${Date.now()}.pdf`);
        toast.success("PDF downloaded successfully!");
      } else if (format === "excel") {
        exportToExcel();
      } else if (format === "html") {
        await exportToHTML();
      } else if (format === "print") {
        const canvas = await htmlToImage.toCanvas(dashboardCardRef.current, {
          backgroundColor: "#ffffff",
          pixelRatio: 2,
        });
        const image = canvas.toDataURL("image/png");
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Dashboard Report</title>
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                img { width: 100%; height: auto; }
              </style>
            </head>
            <body>
              <img src="${image}" />
              <script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }</script>
            </body>
            </html>
          `);
          printWindow.document.close();
        }
      }
    } catch (error) {

      toast.error("Failed to export. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // If no data at all, show empty state
  if (!dashboardData || (!hasKPIs && !hasCharts && !hasContent && !hasTable)) {
    return (
      <Card className="w-full shadow-2xl bg-white overflow-hidden">
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
                <p className="text-sm text-slate-600">Complete Overview</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-400">
            <div className="p-4 rounded-full bg-slate-200 mb-4">
              <BarChart className="w-12 h-12" />
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">
              No Dashboard Data Available
            </p>
            <p className="text-xs text-slate-500">
              Generate a dashboard to see all components
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-2xl bg-white overflow-hidden">
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
              <p className="text-sm text-slate-600">Complete Overview</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {timestamp && (
              <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300">
                <Calendar className="w-3 h-3 mr-1" />
                {timestamp.toLocaleDateString()}
              </Badge>
            )}

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
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDownloadMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border z-50 overflow-hidden">
                    <div className="p-2">
                      <div className="text-xs font-semibold text-slate-500 px-4 pt-2 pb-1">
                        IMAGE
                      </div>
                      <button
                        onClick={() => handleDownload("png")}
                        className="flex items-center w-full px-4 py-2.5 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <div className="p-1.5 bg-blue-100 rounded-lg mr-3">
                          <Image className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-slate-800">
                            PNG
                          </div>
                          <div className="text-xs text-slate-500">
                            High quality image
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleDownload("jpg")}
                        className="flex items-center w-full px-4 py-2.5 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <div className="p-1.5 bg-blue-100 rounded-lg mr-3">
                          <Image className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-slate-800">
                            JPG
                          </div>
                          <div className="text-xs text-slate-500">
                            Compressed image
                          </div>
                        </div>
                      </button>

                      <div className="h-px bg-slate-200 my-2"></div>

                      <div className="text-xs font-semibold text-slate-500 px-4 pt-1 pb-1">
                        DOCUMENT
                      </div>
                      <button
                        onClick={() => handleDownload("pdf")}
                        className="flex items-center w-full px-4 py-2.5 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <div className="p-1.5 bg-red-100 rounded-lg mr-3">
                          <FileText className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-slate-800">
                            PDF
                          </div>
                          <div className="text-xs text-slate-500">
                            Professional document
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleDownload("html")}
                        className="flex items-center w-full px-4 py-2.5 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        <div className="p-1.5 bg-orange-100 rounded-lg mr-3">
                          <FileJson className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-slate-800">
                            HTML
                          </div>
                          <div className="text-xs text-slate-500">
                            Web page format
                          </div>
                        </div>
                      </button>

                      <div className="h-px bg-slate-200 my-2"></div>

                      <div className="text-xs font-semibold text-slate-500 px-4 pt-1 pb-1">
                        DATA
                      </div>
                      <button
                        onClick={() => handleDownload("excel")}
                        className="flex items-center w-full px-4 py-2.5 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <div className="p-1.5 bg-green-100 rounded-lg mr-3">
                          <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-slate-800">
                            Excel
                          </div>
                          <div className="text-xs text-slate-500">
                            Spreadsheet data
                          </div>
                        </div>
                      </button>

                      <div className="h-px bg-slate-200 my-2"></div>

                      <button
                        onClick={() => handleDownload("print")}
                        className="flex items-center w-full px-4 py-2.5 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="p-1.5 bg-gray-100 rounded-lg mr-3">
                          <Printer className="w-4 h-4 text-gray-700" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-slate-800">
                            Print
                          </div>
                          <div className="text-xs text-slate-500">
                            Send to printer
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent ref={dashboardCardRef} className="p-6">
        {showLoader ? (
          <div className="min-h-[600px] flex items-center justify-center">
            <SequentialLoader />
          </div>
        ) : (
          <div className="space-y-6">
            {/* REMOVED: Content section - now shown only in main message */}

            {/* KPIs section - only show if has KPIs */}
            {hasKPIs && (
              <div>
                {/* <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Key Performance Indicators
                </h3> */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {dashboardData.kpis.map((kpi: any, i: number) =>
                    renderKPICard(kpi, i),
                  )}
                </div>
              </div>
            )}

            {/* Charts section - only show if has charts */}
            {hasCharts && (
              <div>
                {/* <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <BarChart className="w-5 h-5 text-indigo-600" />
                  Visualizations
                </h3> */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {dashboardData.charts.map((chart: any, i: number) =>
                    renderChart(chart, i),
                  )}
                </div>
              </div>
            )}

            {/* Table section if available */}
            {dashboardData.table &&
              Array.isArray(dashboardData.table) &&
              dashboardData.table.length > 0 && (
                <div>
                  {/* <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  Data Table
                </h3> */}
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(dashboardData.table[0]).map((key) => (
                            <th
                              key={key}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {key.replace(/_/g, " ")}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dashboardData.table.map((row: any, idx: number) => (
                          <tr key={idx}>
                            {Object.values(row).map(
                              (value: any, colIdx: number) => (
                                <td
                                  key={colIdx}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                >
                                  {value}
                                </td>
                              ),
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
