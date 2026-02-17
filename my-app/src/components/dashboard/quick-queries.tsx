import React from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { TrendingUp, BarChart, FileText, Calendar } from "lucide-react";

interface QuickQueriesProps {
  onSelectQuery: (query: string) => void;
}

export const QuickQueries = ({ onSelectQuery }: QuickQueriesProps) => {
  const quickQueries = [
    {
      icon: <TrendingUp className="w-4 h-4" />,
      text: "Plot a sales Dashboard",
      description: "Visualize sales trends and performance",
    },
    {
      icon: <BarChart className="w-4 h-4" />,
      text: "Show me product performance",
      description: "Analyze top products and categories",
    },
    {
      icon: <FileText className="w-4 h-4" />,
      text: "Analyze branch sales",
      description: "Compare sales across different branches",
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      text: "Monthly revenue analysis",
      description: "View revenue trends by month",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mt-6 max-w-3xl mx-auto">
      {quickQueries.map((query, index) => (
        <motion.div
          key={`query-${index}-${query.text.substring(0, 10)}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Button
            variant="outline"
            onClick={() => onSelectQuery(query.text)}
            className="w-full h-auto p-4 flex items-start gap-3 bg-white/70 border-white/20 hover:bg-white/90 hover:border-indigo-200 shadow-sm hover:shadow-md"
          >
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors flex-shrink-0">
              {query.icon}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-slate-800">{query.text}</p>
              <p className="text-xs text-slate-500 mt-0.5">{query.description}</p>
            </div>
          </Button>
        </motion.div>
      ))}
    </div>
  );
};