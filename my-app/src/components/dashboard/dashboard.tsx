
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import React, { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Toaster } from "../ui/sonner";
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
  Globe,
  X,
  File,
  User,
  Settings,
  LogOut,
  Trash2,
  Plus,
  Check,
  Database,
  ChevronDown,
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

import { motion, AnimatePresence } from "framer-motion";

import { useDashboardStore } from "@/src/services/api/dashboard/dashboard-api-store";
import { useRouter } from "next/navigation";

import { fetchDataSources } from "@/src/services/api/dashboard/data-source";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "../ui/table";
import { ScrollArea } from "../ui/scroll-area";

// ==================== IMPORTED COMPONENTS ====================
import { ChatSidebar } from "@/src/components/chat/ChatSidebar";
import { useChatStore } from "@/src/services/api/chat/chat-store";
import { NavigationBar } from "./navigation-bar";
import { DashboardCard } from "./dashboard-card";
import { QuickQueries } from "./quick-queries";
import { MessageInput } from "./message-input";
import { FileDialogs } from "./file-dialogs";
import { ThinkingIndicator } from "./loaders";
import { 
  UploadedFile, 
  DatabaseFile, 
  getFileTypeFromName, 
  formatFileSize, 
  getFileIcon,
  loadExistingFiles,
  convertToDatabaseFiles,
  useFileOperations 
} from "@/src/services/utils/file-handling";
import { useUploadStore } from "@/src/services/api/dashboard/upload-store";

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

// ==================== MAIN DASHBOARD CONTENT ====================
const DashboardContent = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const toastShownRef = useRef<string | null>(null);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [recentlyUploadedFile, setRecentlyUploadedFile] = useState<string | null>(null);
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
  } = useChatStore();

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
      console.error("Error formatting timestamp:", error);
      return "Invalid time";
    }
  };

  // ==================== PERSISTENCE ====================
  useEffect(() => {
    const stateToSave = {
      uploadedFiles,
      selectedFiles,
      availableFiles,
      inputValue,
      lastQuery,
    };
    localStorage.setItem('dashboard_persisted_state', JSON.stringify(stateToSave));
  }, [uploadedFiles, selectedFiles, availableFiles, inputValue, lastQuery]);

  useEffect(() => {
    const savedState = localStorage.getItem('dashboard_persisted_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        
        if (Array.isArray(parsed.uploadedFiles)) {
          const restoredUploadedFiles = parsed.uploadedFiles.map((file: any) => ({
            ...file,
            uploadedAt: new Date(file.uploadedAt)
          }));
          setUploadedFiles(restoredUploadedFiles);
        }
        
        if (Array.isArray(parsed.selectedFiles)) {
          setSelectedFiles(parsed.selectedFiles);
        }
        
        if (Array.isArray(parsed.availableFiles)) {
          setAvailableFiles(parsed.availableFiles);
        }
        
        if (typeof parsed.inputValue === 'string') {
          setInputValue(parsed.inputValue);
        }
        
        if (typeof parsed.lastQuery === 'string') {
          setLastQuery(parsed.lastQuery);
        }
      } catch (error) {
        console.error('Failed to restore persisted state:', error);
      }
    }
  }, []);

  useEffect(() => {
    try {
      if (messages.length > 0) {
        const messagesToSave = messages.map(msg => {
          let timestamp = msg.timestamp;
          if (!(timestamp instanceof Date)) {
            timestamp = new Date(timestamp);
          }
          
          return {
            ...msg,
            timestamp: timestamp.toISOString()
          };
        });
        localStorage.setItem('dashboard_messages', JSON.stringify(messagesToSave));
      }
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  }, [messages]);

  useEffect(() => {
    const savedMessages = localStorage.getItem('dashboard_messages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed)) {
          const restoredMessages = parsed.map((msg: any) => {
            let timestamp;
            if (msg.timestamp) {
              if (typeof msg.timestamp === 'string') {
                timestamp = new Date(msg.timestamp);
              } else if (typeof msg.timestamp === 'number') {
                timestamp = new Date(msg.timestamp);
              } else {
                timestamp = new Date();
              }
            } else {
              timestamp = new Date();
            }
            
            return {
              ...msg,
              timestamp: timestamp,
              id: msg.id || `msg-${Date.now()}-${Math.random()}`,
              type: msg.type || 'bot',
              content: msg.content || '',
            };
          });
          setMessages(restoredMessages);
        }
      } catch (error) {
        console.error('Failed to restore messages:', error);
        localStorage.removeItem('dashboard_messages');
      }
    }
  }, []);

  // ===== CHAT STORE SYNC =====
  useEffect(() => {
    if (currentChatMessages && currentChatMessages.length > 0) {
      const convertedMessages: Message[] = currentChatMessages.map((msg) => {
        let timestamp = msg.timestamp;
        if (!(timestamp instanceof Date)) {
          if (typeof timestamp === 'string') {
            timestamp = new Date(timestamp);
          } else if (typeof timestamp === 'number') {
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
      
      if (JSON.stringify(convertedMessages.map(m => m.id)) !== JSON.stringify(messages.map(m => m.id))) {
        setMessages(convertedMessages);
      }
      
      if (currentDashboardData) {
        console.log("📊 Loaded dashboard data from chat history");
      }
    } else {
      setMessages([]);
    }
  }, [currentChatMessages, currentDashboardData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const email = localStorage.getItem("user_email") || "";
    setUserEmail(email);
    loadInitialFiles();
  }, []);

  const loadInitialFiles = async () => {
    const files = await loadExistingFiles();
    setUploadedFiles(files);
    setAvailableFiles(convertToDatabaseFiles(files));
  };

  useEffect(() => {
    if (hasData && dashboardData && isLoading && pendingQuery) {
      const now = new Date().getTime();
      const recentBotMessages = messages.filter(
        msg => msg.type === "bot" && 
        (now - msg.timestamp.getTime()) < 30000
      );
      
      const hasExistingBotMessage = recentBotMessages.some(
        msg => msg.content.includes("Dashboard generated") || 
               msg.content.includes(pendingQuery)
      );

      if (!hasExistingBotMessage) {
        addAssistantMessage(
          "Dashboard generated successfully! ✨",
          dashboardData,
        );
        setPendingQuery(null);
        setIsLoading(false);
        toast.success("Dashboard ready!");
        toastShownRef.current = null;
      } else {
        setPendingQuery(null);
        setIsLoading(false);
      }
    }
  }, [hasData, dashboardData, isLoading, pendingQuery, addAssistantMessage, messages]);

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
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        toast.error("Speech recognition failed. Please try again.");
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
  }, []);

  const [userEmail, setUserEmail] = useState<string>("");

  const handleLogout = () => {
    localStorage.removeItem("user_email");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("token_type");
    router.push("/");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const handleStopRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setPendingQuery(null);
      toast.info("Request cancelled");
      toastShownRef.current = null;
    }
  };

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info("Listening... Speak now.");
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast.error("Failed to start speech recognition.");
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const userEmail = localStorage.getItem("user_email");
    if (!userEmail) {
      toast.error("Please login first");
      return;
    }

    try {
      const newFiles = await uploadFiles(userEmail, Array.from(files));
      setUploadedFiles((prev) => [...prev, ...newFiles]);

      const newAvailableFiles = convertToDatabaseFiles(newFiles);
      setAvailableFiles((prev) => [...prev, ...newAvailableFiles]);

      const fileNames = newFiles.map((f) => f.name);
      setSelectedFiles((prev) => [...prev, ...fileNames]);

      setRecentlyUploadedFile(files[0].name);
      setUploadSuccess(true);
      toast.success(`Uploaded ${files.length} file(s) successfully!`);

      setTimeout(() => {
        setShowFileUploadModal(false);
        setRecentlyUploadedFile(null);
        setUploadSuccess(false);
      }, 3000);
    } catch (error) {
      toast.error("Upload failed. Please try again.");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteFile = async (filename: string) => {
    try {
      await deleteFileByName(filename);
      setUploadedFiles((prev) => prev.filter((file) => file.name !== filename));
      setAvailableFiles((prev) => prev.filter((file) => file.id !== filename));
      setSelectedFiles((prev) => prev.filter((file) => file !== filename));
      toast.success(`File "${filename}" deleted successfully!`);
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(`Failed to delete file: ${error.message}`);
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
        toast.warning("Please select files before sending a query");
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
      toast.error("Please enter a query");
      return;
    }

    const fileNames = getFileNames();
    if (!fileNames) {
      if (!hasShownNoFileToast) {
        toast.warning("Please select files before sending a query");
        setHasShownNoFileToast(true);
        setTimeout(() => setHasShownNoFileToast(false), 2000);
      }
      return;
    }

    const { currentChatId, currentChatMessages } = useChatStore.getState();
    const nextMessageId = (Math.ceil((currentChatMessages.length + 1) / 2)).toString();

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
      console.error("Error fetching dashboard:", error);
      addAssistantMessage("Failed to generate dashboard. Please try again.", null);
      setPendingQuery(null);
      setIsLoading(false);
      toast.error("Failed to generate dashboard.");
      abortControllerRef.current = null;
      toastShownRef.current = null;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) {
      toast.error("Please enter a query");
      return;
    }

    const fileNames = getFileNames();
    if (!fileNames) {
      if (!hasShownNoFileToast) {
        toast.warning("Please select files before sending a query");
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
      console.error("Error fetching dashboard:", error);
      addAssistantMessage("Failed to generate dashboard. Please try again.", null);
      setPendingQuery(null);
      setIsLoading(false);
      toast.error("Failed to generate dashboard.");
      abortControllerRef.current = null;
      toastShownRef.current = null;
    }
  };

  const handleRetry = async () => {
    if (!lastQuery) return;
    
    if (selectedFiles.length === 0) {
      if (!hasShownNoFileToast) {
        toast.warning("Please select files before retrying");
        setHasShownNoFileToast(true);
        setTimeout(() => setHasShownNoFileToast(false), 2000);
      }
      return;
    }

    const { currentChatId, currentChatMessages } = useChatStore.getState();
    const retryMessageId = (Math.ceil((currentChatMessages.length + 1) / 2) + 1).toString();
    
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
      console.error("Error retrying dashboard:", error);
      addAssistantMessage("Retry failed. Please try again.", null);
      setPendingQuery(null);
      setIsLoading(false);
      toast.error("Retry failed.");
    }
  };

  const copyToClipboard = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const toggleFileSelection = (fileName: string) => {
    setSelectedFiles((prev) => {
      if (prev.includes(fileName)) {
        return prev.filter((f) => f !== fileName);
      } else {
        return [...prev, fileName];
      }
    });
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]);
  };

  return (
    <div className="h-full flex flex-col bg-white">
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

            <div className="w-full backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-2xl overflow-hidden mb-4">
              <div className="p-4 pb-0 relative">
                <textarea
                  ref={fileInputRef}
                  placeholder="Ask me anything..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="w-full text-gray-700 bg-transparent text-base outline-none placeholder:text-gray-400 pr-20 resize-none"
                  rows={3}
                />
              </div>

              <div className="px-4 py-3 flex items-center gap-3 border-t border-white/30">
                <button
                  onClick={() => setShowFileDialog(true)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-lg transition-colors flex-shrink-0"
                  title="Attach files"
                >
                  <Plus className="w-5 h-5" />
                </button>

                {selectedFiles.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                    {selectedFiles.map((fileId) => {
                      const file = availableFiles.find((f) => f.id === fileId);
                      return (
                        <div
                          key={fileId}
                          className="flex items-center gap-2 bg-gray-50/70 py-1 px-2 rounded-md border border-gray-200/50 flex-shrink-0"
                        >
                          <span className="text-md">{file?.icon}</span>
                          <span className="text-xs text-gray-700 whitespace-nowrap">
                            {file?.name}
                          </span>
                          <button
                            onClick={() => toggleFileSelection(fileId)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedFiles.length === 0 && <div className="flex-1" />}

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={toggleSpeechRecognition}
                    className={`p-2 rounded-lg transition-colors ${
                      isListening
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                    }`}
                    title={isListening ? "Stop listening" : "Start voice input"}
                  >
                    <Mic className="w-5 h-5" />
                  </button>

                  {isLoading ? (
                    <button
                      onClick={handleStopRequest}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                      title="Stop generation"
                    >
                      <CircleStop className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                        inputValue.trim()
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-100/70 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <QuickQueries onSelectQuery={handleQuickQuery} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="max-w-full mx-auto space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  {message.type === "user" ? (
                    <>
                      <div className="flex justify-end">
                        <div className="inline-block max-w-[80%] rounded-2xl px-5 py-3 bg-gray-900 text-white shadow-sm">
                          <p className="text-md leading-relaxed whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-3 px-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="text-xs text-slate-500">
                            {formatTimeString(message.timestamp)}
                          </span>
                        </div>
                        <button
                          className="h-6 w-6 hover:bg-gray-800 rounded flex items-center justify-center"
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
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-full rounded-2xl px-5 py-3 bg-gray-100 text-gray-900 shadow-sm">
                        <p className="text-md">{message.content}</p>

                        {message.visualRendered && message.dashboardData && (
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
                          <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="text-xs text-slate-500">
                            {formatTimeString(message.timestamp)}
                          </span>
                        </div>
                        <button
                          className="h-6 w-6 hover:bg-gray-200 rounded flex items-center justify-center"
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
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && !hasData && <ThinkingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="bg-transparent sticky bottom-0 mt-auto">
            <div className="w-full mx-auto px-6 py-3 backdrop-blur-sm bg-transparent">
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
          </div>
        </div>
      )}

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
        fileInputRef={fileInputRef}
        onFileUpload={handleFileUpload}
        onClearSelection={clearSelectedFiles}
        onClose={() => {
          setShowFileDialog(false);
          setShowFileUploadModal(false);
        }}
      />
    </div>
  );
};

// ==================== MAIN EXPORT ====================
export function SalesDashboard() {
  const [userEmail, setUserEmail] = useState<string>("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem("user_email") || "";
    setUserEmail(email);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_email");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("token_type");
    router.push("/");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <Toaster />

      <NavigationBar
        userEmail={userEmail}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        handleLogout={handleLogout}
        handleSettings={handleSettings}
      />

      <div className="flex-1 flex min-h-0">
        <ChatSidebar />
        <div className="flex-1 overflow-y-auto">
          <DashboardContent />
        </div>
      </div>
    </div>
  );
}