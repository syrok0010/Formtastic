import { QuestionType, SurveyStatus } from "@/generated/prisma";

export const localizedQuestionTypes: Record<QuestionType, string> = {
    [QuestionType.TEXT]: "Текстовый ответ",
    [QuestionType.NUMBER]: "Числовой ответ",
    [QuestionType.SINGLE_CHOICE]: "Один из списка",
    [QuestionType.MULTIPLE_CHOICE]: "Несколько из списка",
};

export const localizedSurveyStatuses: Record<SurveyStatus, string> = {
    [SurveyStatus.DRAFT]: "Черновик",
    [SurveyStatus.PUBLISHED]: "Опубликован",
    [SurveyStatus.CLOSED]: "Закрыт",
};