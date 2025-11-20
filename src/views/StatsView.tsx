import React from "react";
import { useJournal } from "../contexts/JournalContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { JLPTLevel } from "../types";

export const StatsView: React.FC = () => {
  const { entries } = useJournal();

  const totalEntries = entries.length;
  const entriesWithFeedback = entries.filter((e) => e.feedback);
  const averageScore =
    entriesWithFeedback.length > 0
      ? Math.round(
          entriesWithFeedback.reduce(
            (acc, e) => acc + (e.feedback?.overallScore || 0),
            0,
          ) / entriesWithFeedback.length,
        )
      : 0;

  const levelCounts = entries.reduce(
    (acc, e) => {
      acc[e.jlptLevel] = (acc[e.jlptLevel] || 0) + 1;
      return acc;
    },
    {} as Record<JLPTLevel, number>,
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
        Progress
      </h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-indigo-600">
              {totalEntries}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-emerald-600">
              {averageScore}
              <span className="text-lg text-gray-400 font-normal">/100</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Latest Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-amber-600">
              {entries[0]?.jlptLevel || "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribution by Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.values(JLPTLevel).map((level) => {
              const count = levelCounts[level] || 0;
              const percentage =
                totalEntries > 0 ? (count / totalEntries) * 100 : 0;
              return (
                <div key={level} className="flex items-center">
                  <div className="w-12 font-medium text-gray-600 dark:text-gray-400">
                    {level}
                  </div>
                  <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-gray-500 text-sm">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
