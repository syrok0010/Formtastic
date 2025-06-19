import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';
import { QuestionType } from '@/generated/prisma';

interface SubmitRequestBody {
    quizId: number;
    answers: Record<string, any>;
}

export async function POST(req: Request) {
    try {
        const body: SubmitRequestBody = await req.json();
        const { quizId, answers } = body;

        if (!quizId || !answers || Object.keys(answers).length === 0) {
            return NextResponse.json({ error: 'Отсутствуют необходимые данные' }, { status: 400 });
        }

        const questions = await prisma.question.findMany({
            where: { surveyId: quizId },
            select: { id: true, type: true },
        });

        const questionTypeMap = new Map(questions.map(q => [q.id, q.type]));

        const result = await prisma.$transaction(async (tx) => {
            const userResponse = await tx.userResponse.create({
                data: {
                    surveyId: quizId,
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
                    if (!Array.isArray(value)) return;
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

        return NextResponse.json(result, { status: 201 });

    } catch (error) {
        console.error("Ошибка при отправке ответов:", error);
        return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
    }
}