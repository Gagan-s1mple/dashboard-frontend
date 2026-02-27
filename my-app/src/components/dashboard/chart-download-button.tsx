/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { Button } from "../ui/button";
import { DownloadCloud, Image } from "lucide-react";
import { toast } from "sonner";
import * as htmlToImage from "html-to-image";

interface ChartDownloadButtonProps {
  chartOption: any;
  chartTitle: string;
}

export const ChartDownloadButton = ({ chartOption, chartTitle }: ChartDownloadButtonProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const echartRef = useRef<any>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const downloadChart = async (format: string) => {
    if (!chartRef.current) return;

    try {
      let dataUrl: string;

      if (format === "png" || format === "jpg") {
        if (echartRef.current && echartRef.current.getEchartsInstance) {
          try {
            const instance = echartRef.current.getEchartsInstance();
            const canvas = instance.getRenderedCanvas({
              backgroundColor: "#fff",
              pixelRatio: 2,
            });
            dataUrl = canvas.toDataURL(format === "png" ? "image/png" : "image/jpeg", 0.95);
          } catch {
            // Fallback: use html-to-image (Firefox-compatible)
            dataUrl = format === "png"
              ? await htmlToImage.toPng(chartRef.current, {
                backgroundColor: "#ffffff",
                pixelRatio: 2,
                cacheBust: true,
              })
              : await htmlToImage.toJpeg(chartRef.current, {
                backgroundColor: "#ffffff",
                pixelRatio: 2,
                quality: 0.95,
                cacheBust: true,
              });
          }
        } else {
          // Fallback: use html-to-image (Firefox-compatible)
          dataUrl = format === "png"
            ? await htmlToImage.toPng(chartRef.current, {
              backgroundColor: "#ffffff",
              pixelRatio: 2,
              cacheBust: true,
            })
            : await htmlToImage.toJpeg(chartRef.current, {
              backgroundColor: "#ffffff",
              pixelRatio: 2,
              quality: 0.95,
              cacheBust: true,
            });
        }

        const link = document.createElement("a");
        link.download = `${chartTitle || "chart"}.${format}`;
        link.href = dataUrl;
        link.click();
        toast.success(`Chart downloaded as ${format.toUpperCase()}`);
      }
    } catch (error) {

      throw error
    }

    setShowMenu(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-slate-100"
        onClick={() => setShowMenu(!showMenu)}
        title="Download options"
      >
        <DownloadCloud className="w-4 h-4" />
      </Button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-50 overflow-hidden">
            <div className="py-1">
              <button
                onClick={() => downloadChart("png")}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Image className="w-4 h-4" />
                Download as PNG
              </button>
              <button
                onClick={() => downloadChart("jpg")}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Image className="w-4 h-4" />
                Download as JPG
              </button>
            </div>
          </div>
        </>
      )}

      <div
        ref={chartRef}
        className="absolute -left-[9999px] top-0 w-[800px] h-[400px] bg-white p-4"
      >
        <ReactECharts
          ref={echartRef}
          option={chartOption}
          style={{ height: "100%", width: "100%" }}
          opts={{ renderer: "canvas" }}
        />
      </div>
    </div>
  );
};