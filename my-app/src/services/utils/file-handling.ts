/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchDataSources } from "@/src/services/api/dashboard/data-source";
import { useUploadStore } from "@/src/services/api/dashboard/upload-store";
import { useDeleteFileStore } from "@/src/services/api/dashboard/delete-store";

// Types
export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  isExisting?: boolean;
}

export interface DatabaseFile {
  id: string;
  name: string;
  icon: string;
}

// Helper functions
export const getFileTypeFromName = (filename: string): string => {
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
    default:
      return "application/octet-stream";
  }
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getFileIcon = (filename: string): string => {
  if (filename.endsWith(".csv")) return "📄";
  if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) return "📊";
  if (filename.endsWith(".json")) return "📋";
  return "📁";
};

export const loadExistingFiles = async (): Promise<UploadedFile[]> => {
  try {
    const existingFiles = await fetchDataSources();

    if (!Array.isArray(existingFiles)) {
      return [];
    }

    const formattedFiles: UploadedFile[] = existingFiles.map((file: any) => {
      if (typeof file === "string") {
        return {
          name: file,
          size: 0,
          type: getFileTypeFromName(file),
          uploadedAt: new Date(),
          isExisting: true,
        };
      }

      return {
        name: file.name || file.filename || file.originalname || "Unknown file",
        size: file.size || file.fileSize || 0,
        type: file.type || file.mimetype || getFileTypeFromName(file.name || file.filename || ""),
        uploadedAt: file.uploadedAt || file.createdAt || file.uploadDate
          ? new Date(file.uploadedAt || file.createdAt || file.uploadDate)
          : new Date(),
        isExisting: true,
      };
    });

    return formattedFiles;
  } catch (error: any) {
    console.error("Failed to load existing files:", error);
    return [];
  }
};

export const convertToDatabaseFiles = (files: UploadedFile[]): DatabaseFile[] => {
  return files.map((file) => ({
    id: file.name,
    name: file.name,
    icon: getFileIcon(file.name),
  }));
};

// Hook for file operations
export const useFileOperations = () => {
  const { uploadAndGenerate } = useUploadStore();
  const { deleteFile } = useDeleteFileStore();

  const uploadFiles = async (userEmail: string, files: File[]) => {
    try {
      await uploadAndGenerate(userEmail, Array.from(files));
      return files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
      }));
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  };

  const deleteFileByName = async (filename: string) => {
    try {
      await deleteFile(filename);
      return true;
    } catch (error) {
      console.error("Delete failed:", error);
      throw error;
    }
  };

  return { uploadFiles, deleteFileByName };
};