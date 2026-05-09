"use client";

import { useState } from "react";
import { typologyQuizzes, type TypologyQuizDefinition, type TypologyQuizResult } from "@/lib/typology-quiz-data";

type AnswerMap = Record<string, string>;
type ScoreMap = Record<string, number>;

function getQuizById(quizId: string) {
  return typologyQuizzes.find((quiz) => quiz.id === quizId) ?? typologyQuizzes[0];
}

function getInitialScores(quiz: TypologyQuizDefinition) {
  return Object.fromEntries(quiz.results.map((result) => [result.id, 0])) as ScoreMap;
}

function calculateScores(quiz: TypologyQuizDefinition, answers: AnswerMap) {
  const scores = getInitialScores(quiz);

  quiz.questions.forEach((question) => {
    const selectedOption = question.options.find((option) => option.id === answers[question.id]);

    if (!selectedOption) {
      return;
    }

    Object.entries(selectedOption.points).forEach(([resultId, point]) => {
      scores[resultId] = (scores[resultId] ?? 0) + point;
    });
  });

  return scores;
}

function getTopResult(quiz: TypologyQuizDefinition, scores: ScoreMap) {
  return quiz.results.reduce<TypologyQuizResult>((bestResult, result) => {
    return (scores[result.id] ?? 0) > (scores[bestResult.id] ?? 0) ? result : bestResult;
  }, quiz.results[0]);
}

function getSortedResults(quiz: TypologyQuizDefinition, scores: ScoreMap) {
  return [...quiz.results].sort((left, right) => (scores[right.id] ?? 0) - (scores[left.id] ?? 0));
}

function getSelectedOptionLabel(quiz: TypologyQuizDefinition, answers: AnswerMap, questionId: string) {
  const question = quiz.questions.find((item) => item.id === questionId);
  const option = question?.options.find((item) => item.id === answers[questionId]);

  return option?.label ?? "未回答";
}

export function TypologyQuizDeck() {
  const [activeQuizId, setActiveQuizId] = useState(typologyQuizzes[0].id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});

  const activeQuiz = getQuizById(activeQuizId);
  const currentQuestion = activeQuiz.questions[currentIndex];
  const answeredCount = activeQuiz.questions.filter((question) => answers[question.id]).length;
  const isComplete = answeredCount === activeQuiz.questions.length;
  const progressPercent = Math.round((answeredCount / activeQuiz.questions.length) * 100);
  const scores = calculateScores(activeQuiz, answers);
  const topResult = getTopResult(activeQuiz, scores);
  const sortedResults = getSortedResults(activeQuiz, scores);
  const topScore = Math.max(...Object.values(scores), 1);

  function selectQuiz(quizId: string) {
    setActiveQuizId(quizId);
    setCurrentIndex(0);
    setAnswers({});
  }

  function selectOption(questionId: string, optionId: string) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: optionId,
    }));

    if (currentIndex < activeQuiz.questions.length - 1) {
      setCurrentIndex((index) => index + 1);
    }
  }

  function goBack() {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }

  function resetQuiz() {
    setCurrentIndex(0);
    setAnswers({});
  }

  function reviewQuestion(questionIndex: number) {
    const targetQuestion = activeQuiz.questions[questionIndex];

    if (!targetQuestion) {
      return;
    }

    setCurrentIndex(questionIndex);
    setAnswers((currentAnswers) => {
      const remainingAnswers = { ...currentAnswers };
      delete remainingAnswers[targetQuestion.id];

      return remainingAnswers;
    });
  }

  function reviewLastAnswer() {
    reviewQuestion(activeQuiz.questions.length - 1);
  }

  return (
    <section className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-6 shadow-[var(--shadow-card)] sm:px-6">
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.16em] text-[color:var(--color-muted)]">INTERACTIVE TYPOLOGY</p>
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--color-primary)]">
              類型クイズ
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-[color:var(--color-text)]">
              Pew Research Center の類型クイズ形式を参考に、日本の政治、宗教、コミュニティ参加に合わせて作った試作ツールです。回答は端末内で処理され、保存されません。
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="類型クイズを選ぶ">
          {typologyQuizzes.map((quiz) => {
            const isActive = quiz.id === activeQuiz.id;

            return (
              <button
                key={quiz.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => selectQuiz(quiz.id)}
                className={`ui-button h-10 px-4 text-sm ${
                  isActive ? "ui-button-primary" : "ui-button-secondary"
                }`}
              >
                {quiz.label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-5 py-5">
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[color:var(--color-accent-ink)]">{activeQuiz.title}</p>
                <p className="text-sm leading-7 text-[color:var(--color-text)]">{activeQuiz.description}</p>
                <p className="text-xs leading-6 text-[color:var(--color-secondary-ink)]">{activeQuiz.caution}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-xs font-medium text-[color:var(--color-muted)]">
                  <span>
                    {answeredCount} / {activeQuiz.questions.length}
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[color:var(--color-border)]">
                  <div
                    className="h-full rounded-full bg-[color:var(--color-accent)] transition-[width] duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {isComplete ? (
                <div className="space-y-5" aria-live="polite">
                  <div className="rounded-lg border border-[color:var(--color-border)] bg-white px-5 py-5">
                    <p className="text-xs font-semibold tracking-[0.14em] text-[color:var(--color-accent-ink)]">
                      RESULT
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold text-[color:var(--color-primary)]">{topResult.title}</h3>
                    <p className="mt-3 text-base leading-8 text-[color:var(--color-text)]">{topResult.summary}</p>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--color-secondary-ink)]">{topResult.body}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {topResult.traits.map((trait) => (
                        <span
                          key={trait}
                          className="rounded-full border border-[rgba(249,115,22,0.22)] bg-white/70 px-3 py-1 text-xs font-medium text-[color:var(--color-primary)]"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="ui-button ui-button-primary h-10 px-4 text-sm" onClick={resetQuiz}>
                      もう一度やる
                    </button>
                    <button
                      type="button"
                      className="ui-button ui-button-secondary h-10 px-4 text-sm"
                      onClick={reviewLastAnswer}
                    >
                      最後の回答を選び直す
                    </button>
                  </div>

                  <div className="rounded-lg border border-[color:var(--color-border)] bg-white/70 px-4 py-4">
                    <p className="text-sm font-semibold text-[color:var(--color-primary)]">回答を見直す</p>
                    <div className="mt-3 grid gap-2">
                      {activeQuiz.questions.map((question, questionIndex) => (
                        <button
                          key={question.id}
                          type="button"
                          onClick={() => reviewQuestion(questionIndex)}
                          className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 text-left text-xs leading-6 text-[color:var(--color-secondary-ink)] transition hover:border-[color:var(--color-accent)] hover:bg-white"
                        >
                          <span className="font-semibold text-[color:var(--color-primary)]">
                            Q{questionIndex + 1}
                          </span>
                          <span className="ml-2">{getSelectedOptionLabel(activeQuiz, answers, question.id)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold tracking-[0.14em] text-[color:var(--color-muted)]">
                      QUESTION {currentIndex + 1}
                    </p>
                    <h3 className="text-xl font-semibold leading-8 text-[color:var(--color-primary)]">
                      {currentQuestion.prompt}
                    </h3>
                  </div>

                  <div className="grid gap-3">
                    {currentQuestion.options.map((option) => {
                      const isSelected = answers[currentQuestion.id] === option.id;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => selectOption(currentQuestion.id, option.id)}
                          className={`rounded-lg border px-4 py-3 text-left text-sm leading-7 transition ${
                            isSelected
                              ? "border-[color:var(--color-accent)] bg-white text-[color:var(--color-primary)]"
                              : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text)] hover:border-[color:var(--color-accent)] hover:bg-white"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="ui-button ui-button-secondary h-10 px-4 text-sm"
                      onClick={goBack}
                      disabled={currentIndex === 0}
                    >
                      戻る
                    </button>
                    <button type="button" className="ui-button ui-button-secondary h-10 px-4 text-sm" onClick={resetQuiz}>
                      リセット
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-[color:var(--color-muted)]">SCORES</p>
            <h3 className="mt-3 text-xl font-semibold text-[color:var(--color-primary)]">いま近い類型</h3>
            <div className="mt-5 space-y-4" aria-live="polite">
              {sortedResults.map((result) => {
                const score = scores[result.id] ?? 0;
                const width = score > 0 ? Math.max(10, Math.round((score / topScore) * 100)) : 0;

                return (
                  <div key={result.id} className="space-y-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-[color:var(--color-primary)]">{result.title}</span>
                      <span className="text-xs text-[color:var(--color-muted)]">{score}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[color:var(--color-border)]">
                      <div
                        className="h-full rounded-full bg-[color:var(--color-accent)] transition-[width] duration-300 ease-out"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-5 text-xs leading-6 text-[color:var(--color-secondary-ink)]">
              点数はこのページ内だけで計算します。統計的な類型ではなく、調査設計のためのプロトタイプです。
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
