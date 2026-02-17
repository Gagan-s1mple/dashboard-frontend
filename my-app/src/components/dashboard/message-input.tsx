import React, { useRef } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Plus, Mic, ArrowUp, CircleStop, RotateCcw, X } from "lucide-react";
import { DatabaseFile } from "@/src/services/utils/file-handling";
import { Badge } from "../ui/badge";

interface MessageInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  selectedFiles: string[];
  availableFiles: DatabaseFile[];
  isLoading: boolean;
  isListening: boolean;
  lastQuery: string;
  onSendMessage: () => void;
  onStopRequest: () => void;
  onRetry: () => void;
  onToggleSpeech: () => void;
  onOpenFileDialog: () => void;
  onToggleFileSelection: (fileName: string) => void;
}

export const MessageInput = ({
  inputValue,
  setInputValue,
  selectedFiles,
  availableFiles,
  isLoading,
  isListening,
  lastQuery,
  onSendMessage,
  onStopRequest,
  onRetry,
  onToggleSpeech,
  onOpenFileDialog,
  onToggleFileSelection,
}: MessageInputProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="backdrop-blur-xl bg-transparent border border-white/20 rounded-2xl shadow-2xl overflow-hidden max-w-3xl flex flex-col flex-items-center mx-auto">
      <div className="p-4 pb-0 relative">
        <Textarea
          ref={inputRef}
          placeholder="Ask me anything..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full text-gray-700 bg-transparent text-base outline-none placeholder:text-gray-400 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          rows={2}
        />
      </div>

      <div className="px-4 py-3 flex items-center gap-3 border-t border-white/30">
        <Button
          onClick={onOpenFileDialog}
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
                    onClick={() => onToggleFileSelection(fileId)}
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
            onClick={onToggleSpeech}
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
          
          {!isLoading && lastQuery && (
            <Button
              onClick={onRetry}
              variant="ghost"
              className="flex items-center gap-1.5 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              title="Retry last query"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm font-medium">Retry</span>
            </Button>
          )}
          
          {isLoading ? (
            <Button
              onClick={onStopRequest}
              size="icon"
              className="w-8 h-8 rounded-full bg-red-600 text-white hover:bg-red-700"
              title="Stop generation"
            >
              <CircleStop className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={onSendMessage}
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
  );
};