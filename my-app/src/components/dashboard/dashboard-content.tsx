/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import React, { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { toast } from "sonner";
import {
  LayoutDashboard,
  TrendingUp,
  BarChart,
  FileText,
  Printer,
  Download,
  Upload,
  FileSpreadsheet,
  X,
  Plus,
  Check,
  Database,
  Copy,
  ArrowUp,
  RotateCcw,
  Clock,
  Brain,
  Calendar,
  DownloadCloud,
  Image,
  FileJson,
  Mic,
  CircleStop,
} from "lucide-react";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// Import ReactMarkdown for markdown formatting
import ReactMarkdown from "react-markdown";

// Import shadcn components
import { Textarea } from "../ui/textarea";

// Import stores
import { useDashboardStore } from "@/src/services/api/dashboard/dashboard-api-store";
import { useChatStore } from "@/src/services/api/chat/chat-store";
import { useUploadStore } from "@/src/services/api/dashboard/upload-store";
import { useSidebarStore } from "@/src/services/api/chat/sidebar-store";

// Import components
import { DashboardCard } from "./dashboard-card";
import { QuickQueries } from "./quick-queries";
import { MessageInput } from "./message-input";
import { FileDialogs } from "./file-dialogs";
import { ThinkingIndicator } from "./loaders";

// Import utilities
import {
  UploadedFile,
  DatabaseFile,
  loadExistingFiles,
  convertToDatabaseFiles,
  useFileOperations,
} from "@/src/services/utils/file-handling";

// ==================== MESSAGE INTERFACE ====================
interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  files?: string[];
  dashboardData?: any;
  visualRendered?: boolean;
}

interface DashboardContentProps {
  userEmail: string;
}

export const DashboardContent = ({ userEmail }: DashboardContentProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const toastShownRef = useRef<string | null>(null);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [recentlyUploadedFile, setRecentlyUploadedFile] = useState<
    string | null
  >(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [availableFiles, setAvailableFiles] = useState<DatabaseFile[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const [hasShownNoFileToast, setHasShownNoFileToast] = useState(false);
  const [toastId, setToastId] = useState<string | number | null>(null);

  const { uploadFiles, deleteFileByName } = useFileOperations();

  const {
    loading,
    hasData,
    dashboardData,
    fetchDashboardData,
    resetDashboard,
  } = useDashboardStore();

  const { uploading } = useUploadStore();
  const router = useRouter();

  const {
    currentChatMessages,
    currentDashboardData,
    isLoadingHistory,
    addUserMessage,
    addAssistantMessage,
    setSelectedFiles: setStoreSelectedFiles,
    setUploadedFiles: setStoreUploadedFiles,
    setAvailableFiles: setStoreAvailableFiles,
    selectedFiles: storeSelectedFiles,
    uploadedFiles: storeUploadedFiles,
    availableFiles: storeAvailableFiles,
  } = useChatStore();

  // ADD THIS LINE - Get sidebar collapsed state
  const { isCollapsed } = useSidebarStore();

  // Sync with store on mount and when store changes
  useEffect(() => {
    if (storeSelectedFiles) {
      setSelectedFiles(storeSelectedFiles);
    }
    if (storeUploadedFiles) {
      setUploadedFiles(storeUploadedFiles);
    }
    if (storeAvailableFiles) {
      setAvailableFiles(storeAvailableFiles);
    }
  }, [storeSelectedFiles, storeUploadedFiles, storeAvailableFiles]);

  // Helper function to safely format timestamp
  const formatTimeString = (timestamp: any): string => {
    try {
      let dateObj = timestamp;
      if (!(dateObj instanceof Date)) {
        dateObj = new Date(timestamp);
      }
      if (isNaN(dateObj.getTime())) {
        return "Invalid time";
      }
      return dateObj.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid time";
    }
  };

  // Load files on mount
  useEffect(() => {
    loadInitialFiles();
  }, []);

  // ===== CHAT STORE SYNC =====
  useEffect(() => {
    if (currentChatMessages && currentChatMessages.length > 0) {
      const convertedMessages: Message[] = currentChatMessages.map((msg) => {
        let timestamp = msg.timestamp;
        if (!(timestamp instanceof Date)) {
          if (typeof timestamp === "string") {
            timestamp = new Date(timestamp);
          } else if (typeof timestamp === "number") {
            timestamp = new Date(timestamp);
          } else {
            timestamp = new Date();
          }
        }

        return {
          id: msg.id,
          type: msg.role === "user" ? "user" : "bot",
          content: msg.content,
          timestamp: timestamp,
          files: msg.files,
          dashboardData: msg.response,
          visualRendered: msg.role === "assistant" && !!msg.response,
        };
      });

      if (
        JSON.stringify(convertedMessages.map((m) => m.id)) !==
        JSON.stringify(messages.map((m) => m.id))
      ) {
        setMessages(convertedMessages);
      }

      // Set lastQuery from the last user message in this chat
      const lastUserMessage = currentChatMessages
        .filter(msg => msg.role === 'user')
        .pop();
        
      if (lastUserMessage) {
        setLastQuery(lastUserMessage.content);
      }

      if (currentDashboardData) {
      }
    } else {
      setMessages([]);
      // Clear lastQuery when no messages
      setLastQuery('');
    }
  }, [currentChatMessages, currentDashboardData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadInitialFiles = async () => {
    try {
      const files = await loadExistingFiles();

      // Always update state, even if empty
      setUploadedFiles(files);
      setStoreUploadedFiles(files);

      const dbFiles = convertToDatabaseFiles(files);
      setAvailableFiles(dbFiles);
      setStoreAvailableFiles(dbFiles);

      // Clear selected files if no files available
      if (files.length === 0) {
        setSelectedFiles([]);
        setStoreSelectedFiles([]);
      }
    } catch (error) {
      // On error, set empty arrays
      console.error("Error loading files:", error);
      setUploadedFiles([]);
      setStoreUploadedFiles([]);
      setAvailableFiles([]);
      setStoreAvailableFiles([]);
      setSelectedFiles([]);
      setStoreSelectedFiles([]);
    }
  };

  // Handle dashboard data when it's received
  useEffect(() => {
    if (hasData && dashboardData && isLoading && pendingQuery) {
      const now = new Date().getTime();
      const recentBotMessages = messages.filter(
        (msg) => msg.type === "bot" && now - msg.timestamp.getTime() < 30000,
      );

      const hasExistingBotMessage = recentBotMessages.some(
        (msg) =>
          msg.content.includes("Dashboard generated") ||
          msg.content.includes(pendingQuery),
      );

      if (!hasExistingBotMessage) {
        // Use the content from dashboardData if available, otherwise use default message
        const assistantMessage =
          dashboardData.content || "Dashboard generated successfully! ✨";
        addAssistantMessage(assistantMessage, dashboardData);
        setPendingQuery(null);
        setIsLoading(false);

        // Show only one toast
        if (toastId) {
          toast.dismiss(toastId);
        }
        const id = toast.success("Dashboard ready!");
        setToastId(id);

        toastShownRef.current = null;
      } else {
        setPendingQuery(null);
        setIsLoading(false);
      }
    }
  }, [
    hasData,
    dashboardData,
    isLoading,
    pendingQuery,
    addAssistantMessage,
    messages,
    toastId,
  ]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue((prev) => prev + (prev ? " " : "") + transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false);

        if (toastId) {
          toast.dismiss(toastId);
        }
        const id = toast.error("Speech recognition failed. Please try again.");
        setToastId(id);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [toastId]);

  const handleStopRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setPendingQuery(null);

      if (toastId) {
        toast.dismiss(toastId);
      }
      const id = toast.info("Request cancelled");
      setToastId(id);

      toastShownRef.current = null;
    }
  };

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      if (toastId) {
        toast.dismiss(toastId);
      }
      const id = toast.error(
        "Speech recognition is not supported in your browser.",
      );
      setToastId(id);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);

        if (toastId) {
          toast.dismiss(toastId);
        }
        const id = toast.info("Listening... Speak now.");
        setToastId(id);
      } catch (error) {
        if (toastId) {
          toast.dismiss(toastId);
        }
        const id = toast.error("Failed to start speech recognition.");
        setToastId(id);
      }
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!userEmail) {
      if (toastId) {
        toast.dismiss(toastId);
      }
      const id = toast.error("Please login first");
      setToastId(id);
      return;
    }

    try {
      const newFiles = await uploadFiles(userEmail, Array.from(files));
      const updatedFiles = [...uploadedFiles, ...newFiles];
      setUploadedFiles(updatedFiles);
      setStoreUploadedFiles(updatedFiles);

      const newAvailableFiles = convertToDatabaseFiles(newFiles);
      const updatedAvailableFiles = [...availableFiles, ...newAvailableFiles];
      setAvailableFiles(updatedAvailableFiles);
      setStoreAvailableFiles(updatedAvailableFiles);

      setRecentlyUploadedFile(files[0].name);
      setUploadSuccess(true);

      if (toastId) {
        toast.dismiss(toastId);
      }
      const id = toast.success(
        `Uploaded ${files.length} file(s) successfully!`,
      );
      setToastId(id);

      // Don't auto-close, let user select files
      // Just clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      if (toastId) {
        toast.dismiss(toastId);
      }
      const id = toast.error("Upload failed. Please try again.");
      setToastId(id);
    }
  };

  const handleDeleteFile = async (filename: string) => {
    try {
      await deleteFileByName(filename);

      const updatedFiles = uploadedFiles.filter(
        (file) => file.name !== filename,
      );
      setUploadedFiles(updatedFiles);
      setStoreUploadedFiles(updatedFiles);

      const updatedAvailableFiles = availableFiles.filter(
        (file) => file.id !== filename,
      );
      setAvailableFiles(updatedAvailableFiles);
      setStoreAvailableFiles(updatedAvailableFiles);

      setSelectedFiles((prev) => prev.filter((file) => file !== filename));
      setStoreSelectedFiles((prev) => prev.filter((file) => file !== filename));

      if (toastId) {
        toast.dismiss(toastId);
      }
      const id = toast.success(`File "${filename}" deleted successfully!`);
      setToastId(id);
    } catch (error: any) {
      if (toastId) {
        toast.dismiss(toastId);
      }
      const id = toast.error(`Failed to delete file: ${error.message}`);
      setToastId(id);
    }
  };

  const getFileNames = () => {
    if (selectedFiles.length === 0) {
      return "";
    }
    return selectedFiles.join(",");
  };

  const handleQuickQuery = (query: string) => {
    setInputValue(query);

    if (selectedFiles.length === 0) {
      if (!hasShownNoFileToast) {
        if (toastId) {
          toast.dismiss(toastId);
        }
        const id = toast.warning("Please select files before sending a query");
        setToastId(id);
        setHasShownNoFileToast(true);
        setTimeout(() => setHasShownNoFileToast(false), 2000);
      }
      return;
    }

    setTimeout(() => {
      handleSendMessageWithQuery(query);
    }, 100);
  };

  const handleSendMessageWithQuery = async (queryText: string) => {
    if (!queryText.trim()) {
      if (toastId) {
        toast.dismiss(toastId);
      }
      const id = toast.error("Please enter a query");
      setToastId(id);
      return;
    }

    const fileNames = getFileNames();
    if (!fileNames) {
      if (!hasShownNoFileToast) {
        if (toastId) {
          toast.dismiss(toastId);
        }
        const id = toast.warning("Please select files before sending a query");
        setToastId(id);
        setHasShownNoFileToast(true);
        setTimeout(() => setHasShownNoFileToast(false), 2000);
      }
      return;
    }

    const { currentChatId, currentChatMessages } = useChatStore.getState();
    const nextMessageId = Math.ceil(
      (currentChatMessages.length + 1) / 2,
    ).toString();

    if (currentChatId) {
      useDashboardStore.getState().setChatInfo(currentChatId, nextMessageId);
    }

    addUserMessage(queryText.trim(), selectedFiles);

    setLastQuery(queryText.trim());
    setPendingQuery(queryText.trim());
    setIsLoading(true);
    setInputValue("");

    abortControllerRef.current = new AbortController();

    const cleanFileNames = selectedFiles
      .map((file) => file.replace(/\.csv$/i, ""))
      .join(",");

    try {
      await fetchDashboardData(queryText.trim(), cleanFileNames);
    } catch (error) {
      addAssistantMessage(
        "Failed to generate dashboard. Please try again.",
        null,
      );
      setPendingQuery(null);
      setIsLoading(false);

      if (toastId) {
        toast.dismiss(toastId);
      }
      const id = toast.error("Failed to generate dashboard.");
      setToastId(id);

      abortControllerRef.current = null;
      toastShownRef.current = null;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) {
      if (toastId) {
        toast.dismiss(toastId);
      }
      const id = toast.error("Please enter a query");
      setToastId(id);
      return;
    }

    const fileNames = getFileNames();
    if (!fileNames) {
      if (!hasShownNoFileToast) {
        if (toastId) {
          toast.dismiss(toastId);
        }
        const id = toast.warning("Please select files before sending a query");
        setToastId(id);
        setHasShownNoFileToast(true);
        setTimeout(() => setHasShownNoFileToast(false), 2000);
      }
      return;
    }

    addUserMessage(inputValue.trim(), selectedFiles);

    setLastQuery(inputValue.trim());
    setPendingQuery(inputValue.trim());
    setIsLoading(true);
    setInputValue("");

    abortControllerRef.current = new AbortController();

    const cleanFileNames = selectedFiles
      .map((file) => file.replace(/\.csv$/i, ""))
      .join(",");

    try {
      await fetchDashboardData(inputValue.trim(), cleanFileNames);
    } catch (error) {
      addAssistantMessage(
        "Failed to generate dashboard. Please try again.",
        null,
      );
      setPendingQuery(null);
      setIsLoading(false);

      if (toastId) {
        toast.dismiss(toastId);
      }
      const id = toast.error("Failed to generate dashboard.");
      setToastId(id);

      abortControllerRef.current = null;
      toastShownRef.current = null;
    }
  };

  const handleRetry = async () => {
    if (!lastQuery) return;

    if (selectedFiles.length === 0) {
      if (!hasShownNoFileToast) {
        if (toastId) {
          toast.dismiss(toastId);
        }
        const id = toast.warning("Please select files before retrying");
        setToastId(id);
        setHasShownNoFileToast(true);
        setTimeout(() => setHasShownNoFileToast(false), 2000);
      }
      return;
    }

    const { currentChatId, currentChatMessages } = useChatStore.getState();
    const retryMessageId = (
      Math.ceil((currentChatMessages.length + 1) / 2) + 1
    ).toString();

    if (currentChatId) {
      useDashboardStore.getState().setChatInfo(currentChatId, retryMessageId);
    }

    addUserMessage(` ${lastQuery}`, selectedFiles);

    setPendingQuery(lastQuery);
    setIsLoading(true);

    const cleanFileNames = selectedFiles
      .map((file) => file.replace(/\.csv$/i, ""))
      .join(",");

    try {
      await fetchDashboardData(lastQuery, cleanFileNames);
    } catch (error) {
      addAssistantMessage("Retry failed. Please try again.", null);
      setPendingQuery(null);
      setIsLoading(false);

      if (toastId) {
        toast.dismiss(toastId);
      }
      const id = toast.error("Retry failed.");
      setToastId(id);
    }
  };

  const copyToClipboard = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);

    if (toastId) {
      toast.dismiss(toastId);
    }
    const id = toast.success("Copied to clipboard!");
    setToastId(id);
  };

  const toggleFileSelection = (fileName: string) => {
    setSelectedFiles((prev) => {
      const newSelection = prev.includes(fileName)
        ? prev.filter((f) => f !== fileName)
        : [...prev, fileName];

      // Update store
      setStoreSelectedFiles(newSelection);

      return newSelection;
    });
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]);
    setStoreSelectedFiles([]);
  };

  // Process dashboard data to remove empty sections
  const hasValidData = (data: any) => {
    if (!data) return false;
    const hasKPIs =
      data.kpis && Array.isArray(data.kpis) && data.kpis.length > 0;
    const hasCharts =
      data.charts && Array.isArray(data.charts) && data.charts.length > 0;
    const hasContent =
      data.content &&
      typeof data.content === "string" &&
      data.content.trim() !== "";
    const hasTable =
      data.table && Array.isArray(data.table) && data.table.length > 0;
    return hasKPIs || hasCharts || hasContent || hasTable;
  };

  return (
    <div className="h-full flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv,.json"
        onChange={handleFileUpload}
        className="hidden"
        multiple
      />

      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-white via-blue-50/30 to-white">
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-6">
            <div className="mb-8 w-20 h-20 relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 200 200"
                width="100%"
                height="100%"
                className="w-full h-full"
              >
                <g clipPath="url(#cs_clip_1_ellipse-12)">
                  <mask
                    id="cs_mask_1_ellipse-12"
                    style={{ maskType: "alpha" }}
                    width="200"
                    height="200"
                    x="0"
                    y="0"
                    maskUnits="userSpaceOnUse"
                  >
                    <path
                      fill="#fff"
                      fillRule="evenodd"
                      d="M100 150c27.614 0 50-22.386 50-50s-22.386-50-50-50-50 22.386-50 50 22.386 50 50 50zm0 50c55.228 0 100-44.772 100-100S155.228 0 100 0 0 44.772 0 100s44.772 100 100 100z"
                      clipRule="evenodd"
                    ></path>
                  </mask>
                  <g mask="url(#cs_mask_1_ellipse-12)">
                    <path fill="#fff" d="M200 0H0v200h200V0z"></path>
                    <path
                      fill="#0066FF"
                      fillOpacity="0.33"
                      d="M200 0H0v200h200V0z"
                    ></path>
                    <g
                      filter="url(#filter0_f_844_2811)"
                      className="animate-gradient"
                    >
                      <path fill="#0066FF" d="M110 32H18v68h92V32z"></path>
                      <path fill="#0044FF" d="M188-24H15v98h173v-98z"></path>
                      <path fill="#0099FF" d="M175 70H5v156h170V70z"></path>
                      <path fill="#00CCFF" d="M230 51H100v103h130V51z"></path>
                    </g>
                  </g>
                </g>
                <defs>
                  <filter
                    id="filter0_f_844_2811"
                    width="385"
                    height="410"
                    x="-75"
                    y="-104"
                    colorInterpolationFilters="sRGB"
                    filterUnits="userSpaceOnUse"
                  >
                    <feFlood
                      floodOpacity="0"
                      result="BackgroundImageFix"
                    ></feFlood>
                    <feBlend
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                      result="shape"
                    ></feBlend>
                    <feGaussianBlur
                      result="effect1_foregroundBlur_844_2811"
                      stdDeviation="40"
                    ></feGaussianBlur>
                  </filter>
                  <clipPath id="cs_clip_1_ellipse-12">
                    <path fill="#fff" d="M0 0H200V200H0z"></path>
                  </clipPath>
                </defs>
                <g
                  style={{ mixBlendMode: "overlay" }}
                  mask="url(#cs_mask_1_ellipse-12)"
                >
                  <path
                    fill="gray"
                    stroke="transparent"
                    d="M200 0H0v200h200V0z"
                    filter="url(#cs_noise_1_ellipse-12)"
                  ></path>
                </g>
                <defs>
                  <filter
                    id="cs_noise_1_ellipse-12"
                    width="100%"
                    height="100%"
                    x="0%"
                    y="0%"
                    filterUnits="objectBoundingBox"
                  >
                    <feTurbulence
                      baseFrequency="0.6"
                      numOctaves="5"
                      result="out1"
                      seed="4"
                    ></feTurbulence>
                    <feComposite
                      in="out1"
                      in2="SourceGraphic"
                      operator="in"
                      result="out2"
                    ></feComposite>
                    <feBlend
                      in="SourceGraphic"
                      in2="out2"
                      mode="overlay"
                      result="out3"
                    ></feBlend>
                  </filter>
                </defs>
              </svg>
            </div>

            <div className="mb-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 mb-2">
                  Adro is here to assist you
                </h1>
                <p className="text-gray-500 max-w-md">
                  Ask me anything or try one of the suggestions below
                </p>
              </motion.div>
            </div>

            <div className="w-full bg-white border border-white/20 rounded-2xl shadow-2xl overflow-hidden mb-4">
              <div className="p-4 pb-0 relative">
                <Textarea
                  placeholder="Ask me anything..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="w-full text-gray-700 bg-transparent text-base outline-none placeholder:text-gray-400 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                  rows={3}
                />
              </div>

              <div className="px-4 py-3 flex items-center gap-3 border-t border-white/30">
                <Button
                  onClick={() => setShowFileDialog(true)}
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-lg flex-shrink-0"
                  title="Attach files"
                >
                  <Plus className="w-5 h-5" />
                </Button>

                {selectedFiles.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                    {selectedFiles.map((fileId) => {
                      const file = availableFiles.find((f) => f.id === fileId);
                      return (
                        <Badge
                          key={fileId}
                          variant="secondary"
                          className="flex items-center gap-2 py-1 px-2 bg-gray-50/70 border border-gray-200/50 flex-shrink-0"
                        >
                          <span className="text-md">{file?.icon}</span>
                          <span className="text-xs text-gray-700 whitespace-nowrap">
                            {file?.name}
                          </span>
                          <button
                            onClick={() => toggleFileSelection(fileId)}
                            className="text-gray-400 hover:text-gray-600 ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}

                {selectedFiles.length === 0 && <div className="flex-1" />}

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    onClick={toggleSpeechRecognition}
                    variant="ghost"
                    size="icon"
                    className={`rounded-lg transition-colors ${
                      isListening
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                    }`}
                    title={isListening ? "Stop listening" : "Start voice input"}
                  >
                    <Mic className="w-5 h-5" />
                  </Button>

                  {isLoading ? (
                    <Button
                      onClick={handleStopRequest}
                      size="icon"
                      className="w-8 h-8 rounded-full bg-red-600 text-white hover:bg-red-700"
                      title="Stop generation"
                    >
                      <CircleStop className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      size="icon"
                      className={`w-8 h-8 rounded-full transition-colors ${
                        inputValue.trim()
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-100/70 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <QuickQueries onSelectQuery={handleQuickQuery} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 pb-40">
            <div className="max-w-full mx-auto space-y-6">
              {messages.map((message, index) => {
                // Create a truly unique key
                const uniqueKey = `${message.id}-${index}-${message.timestamp.getTime()}`;

                return (
                  <div key={uniqueKey} className="space-y-2 ">
                    {message.type === "user" ? (
                      <>
                        <div className="flex justify-end ">
                          <div className="inline-block max-w-full rounded-2xl px-5 py-3 bg-gray-900 text-white shadow-sm">
                            <p className="text-md leading-relaxed whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 px-2">
                          <div className="flex items-center gap-1">
                            {/* <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span className="text-xs text-slate-500">
                              {formatTimeString(message.timestamp)}
                            </span> */}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-gray-800"
                            onClick={() =>
                              copyToClipboard(message.content, message.id)
                            }
                            title="Copy message"
                          >
                            {copiedMessageId === message.id ? (
                              <Check className="h-3 w-3 text-white" />
                            ) : (
                              <Copy className="h-3 w-3 text-gray-300" />
                            )}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-full rounded-2xl px-5 py-3 bg-gray-100 text-gray-900 shadow-sm">
                          {/* Use ReactMarkdown for content with bold formatting - FIXED VERSION */}
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => (
                                <p className="mb-2 last:mb-0 text-md">
                                  {children}
                                </p>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-bold text-gray-900">
                                  {children}
                                </strong>
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>

                          {message.visualRendered &&
                            message.dashboardData &&
                            hasValidData(message.dashboardData) && (
                              <div className="mt-4 w-full">
                                <DashboardCard
                                  dashboardData={message.dashboardData}
                                  timestamp={message.timestamp}
                                  showLoader={false}
                                />
                              </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 px-2">
                          <div className="flex items-center gap-1">
                            {/* <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span className="text-xs text-slate-500">
                              {formatTimeString(message.timestamp)}
                            </span> */}
                          </div>
                          {/* <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-gray-200"
                            onClick={() =>
                              copyToClipboard(message.content, message.id)
                            }
                            title="Copy message"
                          >
                            {copiedMessageId === message.id ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3 text-gray-500" />
                            )}
                          </Button> */}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && !hasData && <ThinkingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* WITH this div: */}
          <div
            className="fixed bottom-0 z-50 bg-transparent backdrop-blur-sm  transition-all duration-300"
            style={{
              left: isCollapsed ? "4rem" : "18rem",
              right: "2rem",
            }}
          >
            <div className="max-w-3xl mx-auto px-4 py-6 pb-4 pointer-events-auto">
              <MessageInput
                inputValue={inputValue}
                setInputValue={setInputValue}
                selectedFiles={selectedFiles}
                availableFiles={availableFiles}
                isLoading={isLoading}
                isListening={isListening}
                lastQuery={lastQuery}
                onSendMessage={handleSendMessage}
                onStopRequest={handleStopRequest}
                onRetry={handleRetry}
                onToggleSpeech={toggleSpeechRecognition}
                onOpenFileDialog={() => setShowFileDialog(true)}
                onToggleFileSelection={toggleFileSelection}
              />
            </div>
            <div className="px-4 pb-2 text-xs text-gray-600 text-center font-bold border-white/30 pt-2">
              Adro can make mistakes. Check important info.
            </div>
          </div>
        </div>
      )}
      <div className="px-4 pb-2 text-xs text-gray-400 font-bold text-center border-t border-white/30 pt-2">
        Adro can make mistakes. Check important info.
      </div>
      <FileDialogs
        showFileDialog={showFileDialog}
        setShowFileDialog={setShowFileDialog}
        showFileUploadModal={showFileUploadModal}
        setShowFileUploadModal={setShowFileUploadModal}
        availableFiles={availableFiles}
        selectedFiles={selectedFiles}
        toggleFileSelection={toggleFileSelection}
        handleDeleteFile={handleDeleteFile}
        uploadSuccess={uploadSuccess}
        recentlyUploadedFile={recentlyUploadedFile}
        uploading={uploading}
        fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
        onFileUpload={handleFileUpload}
        onClearSelection={clearSelectedFiles}
        onClose={() => {
          setShowFileDialog(false);
          setShowFileUploadModal(false);
          // Reset upload success state when closing
          setUploadSuccess(false);
          setRecentlyUploadedFile(null);
        }}
      />
    </div>
  );
};