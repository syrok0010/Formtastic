// Базовые типы для опросов и викторин

export interface User {
  id: string;
  email?: string;
  name?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
  type: SurveyType;
  status: SurveyStatus;
  isAnonymous: boolean;
  allowMultipleResponses: boolean;
  requireAuth: boolean;
  timeLimit?: number; // в минутах
  maxResponses?: number;
  startDate?: Date;
  endDate?: Date;
  isPublic: boolean;
  showResults: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  questions: Question[];
  responses: Response[];
  _count?: {
    responses: number;
    questions: number;
  };
}

export enum SurveyType {
  SURVEY = 'SURVEY',
  QUIZ = 'QUIZ',
  POLL = 'POLL',
  FORM = 'FORM'
}

export enum SurveyStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED'
}

export interface Question {
  id: string;
  surveyId: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  settings: QuestionSettings;
  options: QuestionOption[];
  answers: Answer[];
}

export enum QuestionType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  NUMBER = 'NUMBER',
  RATING = 'RATING',
  SCALE = 'SCALE',
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  EMAIL = 'EMAIL'
}

export interface QuestionSettings {
  maxRating?: number;
  minValue?: number;
  maxValue?: number;
  step?: number;
  placeholder?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface QuestionOption {
  id: string;
  questionId: string;
  text: string;
  value?: string;
  order: number;
  isCorrect?: boolean; // для викторин
  points?: number; // баллы за правильный ответ
}

export interface Response {
  id: string;
  surveyId: string;
  userId?: string;
  sessionId?: string;
  isCompleted: boolean;
  completedAt?: Date;
  timeSpent?: number; // в секундах
  ipAddress?: string;
  userAgent?: string;
  score?: number; // для викторин
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  answers: Answer[];
}

export interface Answer {
  id: string;
  responseId: string;
  questionId: string;
  value: any; // JSON значение ответа
  textValue?: string;
  numberValue?: number;
  booleanValue?: boolean;
  dateValue?: Date;
  selectedOptions?: string[]; // IDs выбранных опций
  isCorrect?: boolean; // для викторин
  points?: number; // заработанные баллы
  createdAt: Date;
  question: Question;
}

// API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface CreateSurveyRequest {
  title: string;
  description?: string;
  type: SurveyType;
  isAnonymous?: boolean;
  allowMultipleResponses?: boolean;
  requireAuth?: boolean;
  timeLimit?: number;
  maxResponses?: number;
  startDate?: string;
  endDate?: string;
  isPublic?: boolean;
  showResults?: boolean;
  questions: CreateQuestionRequest[];
}

export interface CreateQuestionRequest {
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  settings?: QuestionSettings;
  options?: CreateQuestionOptionRequest[];
}

export interface CreateQuestionOptionRequest {
  text: string;
  value?: string;
  order: number;
  isCorrect?: boolean;
  points?: number;
}

export interface SubmitResponseRequest {
  surveyId: string;
  answers: SubmitAnswerRequest[];
  timeSpent?: number;
}

export interface SubmitAnswerRequest {
  questionId: string;
  value?: any;
  textValue?: string;
  numberValue?: number;
  booleanValue?: boolean;
  dateValue?: string;
  selectedOptions?: string[];
}

// Statistics Types
export interface SurveyStatistics {
  totalResponses: number;
  completionRate: number;
  averageTime: number;
  averageScore?: number;
  responsesByDate: Array<{
    date: string;
    count: number;
  }>;
  questionStatistics: QuestionStatistics[];
}

export interface QuestionStatistics {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  totalAnswers: number;
  optionCounts?: Record<string, number>;
  averageRating?: number;
  textAnswers?: string[];
  commonAnswers?: Array<{
    value: string;
    count: number;
  }>;
}

// UI State Types
export interface QuizState {
  currentQuestionIndex: number;
  answers: Record<string, any>;
  isSubmitting: boolean;
  timeLeft?: number;
  error?: string;
}

export interface ResultsState {
  personalResult?: Response;
  publicStats?: SurveyStatistics;
  loading: boolean;
  error?: string;
}
