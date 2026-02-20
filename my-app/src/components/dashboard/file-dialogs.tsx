/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { X, Upload, Database, Plus, Trash2, Check } from "lucide-react";
import { DatabaseFile } from "@/src/services/utils/file-handling";

interface FileDialogsProps {
  showFileDialog: boolean;
  setShowFileDialog: (show: boolean) => void;
  showFileUploadModal: boolean;
  setShowFileUploadModal: (show: boolean) => void;
  availableFiles: DatabaseFile[];
  selectedFiles: string[];
  toggleFileSelection: (fileName: string) => void;
  handleDeleteFile: (filename: string) => void;
  uploadSuccess: boolean;
  recentlyUploadedFile: string | null;
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSelection: () => void;
  onClose: () => void;
}

export const FileDialogs = ({
  showFileDialog,
  setShowFileDialog,
  showFileUploadModal,
  setShowFileUploadModal,
  availableFiles,
  selectedFiles,
  toggleFileSelection,
  handleDeleteFile,
  uploadSuccess,
  recentlyUploadedFile,
  uploading,
  fileInputRef,
  onClearSelection,
}: FileDialogsProps) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownStartedRef = useRef(false);

  useEffect(() => {
    if (uploadSuccess && countdown === null && !countdownStartedRef.current) {
      countdownStartedRef.current = true;
      setCountdown(3);
    }
  }, [uploadSuccess]);

  useEffect(() => {
    if (countdown === null || countdown < 0) return;

    if (countdown === 0) {
      countdownStartedRef.current = false;
      setShowFileUploadModal(false);
      setShowFileDialog(true); // ✅ Reopen file selection dialog after countdown
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, setShowFileUploadModal, setShowFileDialog]);

  // Handle cancel in upload modal - go back to file selection
  const handleUploadCancel = () => {
    setShowFileUploadModal(false);
    setCountdown(null);
    countdownStartedRef.current = false;
    setShowFileDialog(true); // ✅ Reopen file selection dialog on cancel
  };

  return (
    <>
      {/* File Selection Dialog */}
      <Dialog open={showFileDialog} onOpenChange={setShowFileDialog}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0" aria-describedby="file-selection-description">
          <DialogHeader className="p-6 border-b">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-slate-600" />
              <DialogTitle className="text-lg font-semibold text-slate-800">
                Select Data Sources
              </DialogTitle>
            </div>
            <div id="file-selection-description" className="sr-only">
              Select one or more CSV files from your database to analyze
            </div>
          </DialogHeader>

          <div className="flex-1 flex gap-6 p-6 overflow-hidden">
            {/* Available Files */}
            <div className="flex-1 flex flex-col border border-slate-200 rounded-lg">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-800">
                    Available Files
                  </h4>
                  <Badge variant="secondary">
                    {
                      availableFiles.filter(
                        (f) => !selectedFiles.includes(f.id),
                      ).length
                    }{" "}
                    available
                  </Badge>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                {availableFiles.filter(
                  (file) => !selectedFiles.includes(file.id),
                ).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <Database className="w-12 h-12 text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">No files available</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Upload files to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableFiles
                      .filter((file) => !selectedFiles.includes(file.id))
                      .map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-all group"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-lg">{file.icon}</span>
                            <span className="text-sm text-slate-700 font-medium truncate">
                              {file.name}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              onClick={() => toggleFileSelection(file.id)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-indigo-600 hover:bg-indigo-50"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteFile(file.id)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </ScrollArea>

              <div className="p-4 border-t">
                <Button
                  onClick={() => {
                    setShowFileDialog(false);
                    setShowFileUploadModal(true);
                  }}
                  variant="ghost"
                  className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload New File</span>
                </Button>
              </div>
            </div>

            {/* Selected Files */}
            <div className="flex-1 flex flex-col border border-slate-200 rounded-lg">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-800">
                    Selected Files
                  </h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {selectedFiles.length} selected
                    </Badge>
                    {selectedFiles.length > 0 && (
                      <Button
                        onClick={onClearSelection}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-slate-500 hover:text-red-600 hover:bg-red-50"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                {selectedFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Database className="w-16 h-16 text-slate-300 mb-3" />
                    <p className="text-base text-slate-500 font-medium">
                      No files selected
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      Choose from available files on the left
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedFiles.map((fileId) => {
                      const file = availableFiles.find((f) => f.id === fileId);
                      return (
                        <div
                          key={fileId}
                          className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-lg">{file?.icon}</span>
                            <span className="text-sm text-indigo-700 font-medium truncate">
                              {file?.name}
                            </span>
                          </div>
                          <Button
                            onClick={() => toggleFileSelection(fileId)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          <div className="p-6 border-t flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowFileDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => setShowFileDialog(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      <Dialog open={showFileUploadModal} onOpenChange={setShowFileUploadModal}>
        <DialogContent className="max-w-lg" aria-describedby="upload-description">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-800">
              Upload New File
            </DialogTitle>
            <div id="upload-description" className="sr-only">
              Upload a new CSV file to your database
            </div>
          </DialogHeader>

          {uploadSuccess && recentlyUploadedFile ? (
            <div className="border-2 border-green-500 rounded-lg p-8 text-center bg-green-50">
              <div className="mb-4">
                {countdown === null ? (
                  <>
                    <Check className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-green-700 mb-2">
                      Upload Successful!
                    </h4>
                    <p className="text-green-600">{recentlyUploadedFile}</p>
                  </>
                ) : (
                  <>
                    <Check className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-green-700 mb-2">
                      Upload Successful!
                    </h4>
                    <p className="text-green-600 mb-4">
                      {recentlyUploadedFile}
                    </p>
                    <div className="text-4xl font-bold text-green-600 animate-pulse">
                      {countdown}
                    </div>
                    <p className="text-sm text-green-600 mt-2">
                      Returning to file selection...
                    </p>
                  </>
                )}
              </div>
              {countdown === null && (
                <Button
                  onClick={handleUploadCancel}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white"
                >
                  Back to File Selection
                </Button>
              )}
            </div>
          ) : (
            <>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500"
              >
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">
                  Click to upload files
                </p>
                <p className="text-sm text-slate-500">CSV, Excel, JSON</p>
              </div>

              {uploading && (
                <div className="flex items-center justify-center mt-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  <span className="ml-2 text-sm text-slate-600">
                    Uploading...
                  </span>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={handleUploadCancel}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
