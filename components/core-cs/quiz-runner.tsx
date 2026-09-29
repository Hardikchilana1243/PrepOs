'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { submitQuizAction } from '@/app/dashboard/actions';
import { QuizSubmissionResult } from '@/lib/services/progress';
import { ClientQuiz } from '@/lib/services/core-cs';
import { QuizHeader } from './quiz-header';
import { QuizProgress } from './quiz-progress';
import { QuestionCard } from './question-card';
import { QuestionNavigation } from './question-navigation';
import { QuizResults } from './quiz-results';
import { Modal, Button } from '@/components/ui/student-os';
import { AlertCircle } from 'lucide-react';

interface QuizRunnerProps {
  quiz: ClientQuiz;
  onExit: () => void;
}

export function QuizRunner({ quiz, onExit }: QuizRunnerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.durationMin * 60);
  const [isSubmitting, startTransition] = useTransition();
  const [result, setResult] = useState<QuizSubmissionResult | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Live countdown timer
  useEffect(() => {
    if (result) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerSubmission();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [result]);

  const currentQ = quiz.questions[currentIdx];
  const questionIds = quiz.questions.map((q) => q.id);
  const answeredCount = Object.keys(selectedAnswers).length;
  const totalCount = quiz.questions.length;
  const unansweredCount = totalCount - answeredCount;

  const handleSelectOption = (optionId: string) => {
    if (result || isSubmitting) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  const triggerSubmission = () => {
    setShowSubmitModal(false);
    startTransition(async () => {
      const timeSpent = Math.max(1, quiz.durationMin * 60 - timeLeft);
      const res = await submitQuizAction(quiz.id, selectedAnswers, timeSpent);
      setResult(res);
    });
  };

  const handleRetake = () => {
    setResult(null);
    setSelectedAnswers({});
    setTimeLeft(quiz.durationMin * 60);
    setCurrentIdx(0);
  };

  // If evaluated, show results
  if (result) {
    return (
      <QuizResults
        result={result}
        onExit={onExit}
        onRetake={handleRetake}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* 1. Header & Live Countdown Timer */}
      <QuizHeader
        quizTitle={quiz.title}
        subjectTitle={quiz.subjectTitle}
        timeLeft={timeLeft}
        currentIdx={currentIdx}
        totalCount={totalCount}
        answeredCount={answeredCount}
        onExit={() => setShowExitModal(true)}
      />

      {/* 2. Question Number Navigator */}
      <QuizProgress
        totalQuestions={totalCount}
        currentIndex={currentIdx}
        selectedAnswers={selectedAnswers}
        questionIds={questionIds}
        onSelectQuestion={(idx) => setCurrentIdx(idx)}
      />

      {/* 3. Question Card */}
      {currentQ && (
        <QuestionCard
          question={currentQ}
          questionNumber={currentIdx + 1}
          totalQuestions={totalCount}
          selectedOptionId={selectedAnswers[currentQ.id] || null}
          onSelectOption={handleSelectOption}
          disabled={isSubmitting}
        />
      )}

      {/* 4. Previous / Next Navigation Controls */}
      <QuestionNavigation
        currentIndex={currentIdx}
        totalQuestions={totalCount}
        isSubmitting={isSubmitting}
        onPrevious={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
        onNext={() => setCurrentIdx((prev) => Math.min(totalCount - 1, prev + 1))}
        onSubmit={() => setShowSubmitModal(true)}
      />

      {/* Exit Confirmation Modal */}
      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="Exit Diagnostic Drill?"
        description="Are you sure you want to exit? Your current selections will not be submitted for grading."
        maxWidth="sm"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExitModal(false)}
            >
              Resume Drill
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={onExit}
            >
              Exit to Hub
            </Button>
          </>
        }
      >
        <div className="text-xs text-slate-600">
          You have answered {answeredCount} of {totalCount} questions. Unsubmitted progress will be discarded.
        </div>
      </Modal>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Technical Diagnostic?"
        description={`You have answered ${answeredCount} of ${totalCount} questions.`}
        maxWidth="sm"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSubmitModal(false)}
            >
              Keep Answering
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={triggerSubmission}
              isLoading={isSubmitting}
            >
              Confirm & Submit
            </Button>
          </>
        }
      >
        {unansweredCount > 0 ? (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Attention: </span>
              <span>
                You have {unansweredCount} unanswered {unansweredCount === 1 ? 'question' : 'questions'}. They will be evaluated as incorrect.
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-600">
            All questions answered. Submit to record your score and calibrate your Core CS Readiness Index.
          </div>
        )}
      </Modal>
    </div>
  );
}
