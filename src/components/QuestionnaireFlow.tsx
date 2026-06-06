'use client'

/**
 * QuestionnaireFlow — composant générique partagé entre Padel et Badminton.
 * Gère le questionnaire pas-à-pas, la barre de progression et l'appel au moteur.
 */
import React, { useState } from 'react';

export interface Option {
  id: string;
  label: string;
  effects: Record<string, unknown>;
}

export interface Question {
  id: string;
  required: boolean;
  label: string;
  options: Option[];
}

export interface QuestionnaireData {
  questions: Question[];
}

export type Answers = Record<string, string>;

interface Props {
  questionnaire: QuestionnaireData;
  onComplete: (answers: Answers) => void;
  sport: string; // ex: "padel" | "badminton"
  accentColor?: string; // classe Tailwind, ex: "bg-orange-500"
}

const QuestionnaireFlow: React.FC<Props> = ({
  questionnaire,
  onComplete,
  sport,
  accentColor = 'bg-orange-500',
}) => {
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  const questions = questionnaire.questions;
  const currentQ = questions[step];
  const progress = Math.round(((step + 1) / questions.length) * 100);

  function advance(currentAnswers: Answers) {
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      if (step === questions.length - 1) {
        onComplete(currentAnswers);
      } else {
        setStep(s => s + 1);
      }
    }, 180);
  }

  function handleSelect(questionId: string, optionId: string) {
    const newAnswers = { ...answers, [questionId]: optionId };
    setAnswers(newAnswers);
    advance(newAnswers);
  }

  function handleSkip() {
    advance(answers);
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <h2 className="text-3xl font-black uppercase text-black tracking-tight mb-1">
        Trouve ta <span className="text-orange-500">raquette</span> {sport}
      </h2>
      <p className="text-gray-500 text-sm mb-10">
        {questions.length} questions · Recommandation personnalisée en 2 minutes
      </p>

      {/* Barre de progression */}
      <div
        className="mb-8"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progression du questionnaire"
      >
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Question {step + 1} / {questions.length}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className={`${accentColor} h-1.5 rounded-full transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Carte question avec transition fade */}
      <div
        className={`bg-white border border-gray-200 rounded-2xl p-6 shadow-sm transition-opacity duration-150 ${
          animating ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <p className="text-lg font-bold text-black mb-5" id={`question-${currentQ.id}`}>
          {currentQ.label}
        </p>
        <div
          role="group"
          aria-labelledby={`question-${currentQ.id}`}
          className="flex flex-col gap-3"
        >
          {currentQ.options.map(opt => (
            <button
              key={opt.id}
              onClick={() => handleSelect(currentQ.id, opt.id)}
              className="w-full text-left px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 text-gray-700 font-medium transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1"
            >
              {opt.label}
            </button>
          ))}
        </div>

        {!currentQ.required && (
          <button
            onClick={handleSkip}
            className="mt-5 w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
          >
            Passer cette question →
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionnaireFlow;
