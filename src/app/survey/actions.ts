'use server';

import { prisma } from '@/lib/prisma';
import { QuestionType } from '@/generated/prisma';
import { revalidatePath } from 'next/cache';

interface ActionResult {
    success: boolean;
    error?: string;
    userResponseId?: number;
}

type Answers = Record<string, any>;

export async function submitSurvey(surveyId: number, answers: Answers): Promise<ActionResult> {
    if (!surveyId || !answers || Object.keys(answers).length === 0) {
        return { success: false, error: 'Отсутствуют необходимые данные' };
    }

    try {
        const questions = await prisma.question.findMany({
            where: { surveyId: surveyId },
            select: { id: true, type: true },
        });

        const questionTypeMap = new Map(questions.map(q => [q.id, q.type]));

        const result = await prisma.$transaction(async (tx) => {
            const userResponse = await tx.userResponse.create({
                data: {
                    surveyId: surveyId,
                },
            });

            const answerCreationPromises = Object.entries(answers).map(async ([questionIdStr, value]) => {
                const questionId = parseInt(questionIdStr, 10);
                const questionType = questionTypeMap.get(questionId);

                if (!questionType) {
                    console.warn(`Вопрос с ID ${questionId} не найден в опросе. Пропускаем.`);
                    return;
                }

                if (questionType === QuestionType.MULTIPLE_CHOICE) {
                    if (!Array.isArray(value)) value = [];
                    const answerRecord = await tx.answer.create({
                        data: {
                            userResponseId: userResponse.id,
                            questionId: questionId,
                        }
                    });
                    await tx.answerSelectedOption.createMany({
                        data: value.map((optionId: number) => ({
                            answerId: answerRecord.id,
                            optionId: optionId,
                        })),
                    });
                } else {
                    await tx.answer.create({
                        data: {
                            userResponseId: userResponse.id,
                            questionId: questionId,
                            textValue: questionType === QuestionType.TEXT ? String(value) : undefined,
                            numberValue: questionType === QuestionType.NUMBER ? Number(value) : undefined,
                            selectedOptionId: questionType === QuestionType.SINGLE_CHOICE ? Number(value) : undefined,
                        },
                    });
                }
            });

            await Promise.all(answerCreationPromises);

            return { userResponseId: userResponse.id };
        });

        revalidatePath(`/survey/${surveyId}`);

        return { success: true, userResponseId: result.userResponseId };

    } catch (error) {
        console.error("Ошибка при отправке ответов (Server Action):", error);
        return { success: false, error: 'Внутренняя ошибка сервера. Пожалуйста, попробуйте еще раз.' };
    }
}