import React from "react";
import { Feedback } from "../types";

const FeedbackItem: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mt-4">
    <h4 className="font-semibold text-gray-700 text-sm dark:text-gray-300">
      {title}
    </h4>
    <div className="mt-2 text-sm text-gray-600 space-y-2 dark:text-gray-400">
      {children}
    </div>
  </div>
);

const FeedbackCard: React.FC<{ feedback: Feedback }> = ({ feedback }) => {
  return (
    <div className="px-5 pb-5 border-t pt-4 dark:border-gray-700">
      <h3 className="font-bold text-indigo-600 dark:text-indigo-400">
        AIフィードバック
      </h3>

      <FeedbackItem title="Corrected Text">
        <p className="p-2 bg-green-50 rounded-md border border-green-200 font-jp dark:bg-green-900/50 dark:border-green-800 dark:text-green-200">
          {feedback.correctedText}
        </p>
      </FeedbackItem>

      {feedback.grammarFeedback.length > 0 && (
        <FeedbackItem title="Grammar">
          {feedback.grammarFeedback.map((item, index) => (
            <div
              key={index}
              className="p-2 bg-yellow-50 border border-yellow-200 rounded-md dark:bg-yellow-900/50 dark:border-yellow-800"
            >
              <p>
                <span className="font-semibold">Mistake:</span>{" "}
                <span className="text-red-600 font-jp dark:text-red-400">
                  {item.mistake}
                </span>
              </p>
              <p>
                <span className="font-semibold">Correction:</span>{" "}
                <span className="text-green-600 font-jp dark:text-green-400">
                  {item.correction}
                </span>
              </p>
              <p>
                <span className="font-semibold">Explanation:</span>{" "}
                <span className="dark:text-gray-300">{item.explanation}</span>
              </p>
            </div>
          ))}
        </FeedbackItem>
      )}

      {feedback.vocabularyFeedback.length > 0 && (
        <FeedbackItem title="Vocabulary">
          {feedback.vocabularyFeedback.map((item, index) => (
            <div
              key={index}
              className="p-2 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/50 dark:border-blue-800"
            >
              <p>
                <span className="font-semibold">Word:</span>{" "}
                <span className="text-gray-600 font-jp dark:text-gray-400">
                  {item.word}
                </span>
              </p>
              <p>
                <span className="font-semibold">Suggestion:</span>{" "}
                <span className="text-indigo-600 font-jp dark:text-indigo-400">
                  {item.suggestion}
                </span>
              </p>
              <p>
                <span className="font-semibold">Explanation:</span>{" "}
                <span className="dark:text-gray-300">{item.explanation}</span>
              </p>
            </div>
          ))}
        </FeedbackItem>
      )}

      <FeedbackItem title="Overall Comment">
        <p className="p-2 bg-gray-100 rounded-md border border-gray-200 italic dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
          &quot;{feedback.overallComment}&quot;
        </p>
      </FeedbackItem>
    </div>
  );
};

export default FeedbackCard;
