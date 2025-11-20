import React from "react";
import { JournalEntry } from "../types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "./ui/Card";
import { Button } from "./ui/Button";
import { LoaderIcon, TrashIcon } from "./ui/Icons";

interface JournalEntryCardProps {
  entry: JournalEntry;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
}

export const JournalEntryCard: React.FC<JournalEntryCardProps> = ({
  entry,
  onDelete,
  onClick,
}) => {
  const date = new Date(entry.date).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md dark:hover:border-gray-700 group"
      onClick={() => onClick(entry.id)}
    >
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {date}
          </span>
          <CardTitle className="text-lg line-clamp-1 text-gray-900 dark:text-gray-50">
            {entry.originalText.split("\n")[0] || "Untitled Entry"}
          </CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          {entry.isLoading && (
            <LoaderIcon className="h-4 w-4 animate-spin text-indigo-500" />
          )}
          {entry.feedback?.overallScore !== undefined && (
            <span
              className={`text-xs font-bold px-2 py-1 rounded-full ${
                entry.feedback.overallScore >= 80
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : entry.feedback.overallScore >= 60
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {entry.feedback.overallScore}/100
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 whitespace-pre-wrap font-serif leading-relaxed">
          {entry.originalText}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs font-mono">
            {entry.jlptLevel}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-900/20 h-8 w-8 p-0 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm("Are you sure you want to delete this entry?")) {
              onDelete(entry.id);
            }
          }}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
