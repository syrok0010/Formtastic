"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { QuestionType, SurveyStatus, UserRole } from "@/generated/prisma";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";

const mySurveysSelect = {
  id: true,
  title: true,
  status: true,
  isPublic: true,
  createdAt: true,
  _count: {
    select: {
      questions: true,
      responses: true,
    },
  },
} satisfies Prisma.SurveySelect;

type MySurveyListItemPayload = Prisma.SurveyGetPayload<{
  select: typeof mySurveysSelect;
}>;

export type MySurveysApiResponse = MySurveyListItemPayload[];

export type MySurveyListItem = MySurveyListItemPayload;

const OptionSchema = z.object({
  id: z.number().int().optional(),
  text: z.string().min(1, "Текст варианта не может быть пустым"),
  order: z.number().int(),
});

const QuestionSchema = z.object({
  id: z.number().int().optional(),
  text: z.string().min(1, "Текст вопроса не может быть пустым"),
  type: z.nativeEnum(QuestionType),
  isRequired: z.boolean(),
  order: z.number().int(),
  options: z.array(OptionSchema),
});

const SurveyUpdateSchema = z.object({
  id: z.number().int(),
  title: z.string().min(1, "Название опроса не может быть пустым"),
  description: z.string().nullable(),
  status: z.nativeEnum(SurveyStatus),
  isPublic: z.boolean(),
  questions: z.array(QuestionSchema),
});

type FormState = {
  message: string;
  success: boolean;
  errors?: Record<string, string[] | undefined>;
};

export async function updateSurveyAction(
    prevState: FormState,
    formData: FormData,
): Promise<FormState> {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== UserRole.SURVEY_CREATOR) {
    redirect("/api/auth/signin");
  }

  const rawData = JSON.parse(formData.get("surveyData") as string);
  const validationResult = SurveyUpdateSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      success: false,
      message: "Ошибка валидации. Проверьте введенные данные.",
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  const surveyData = validationResult.data;
  const surveyId = surveyData.id;
  const userId = session.user.id;

  try {
    await prisma.$transaction(async (tx) => {
      const existingSurvey = await tx.survey.findUnique({
        where: { id: surveyId },
        include: {
          questions: {
            include: {
              options: true,
              _count: { select: { answers: true } },
            },
          },
        },
      });

      if (!existingSurvey) {
        throw new Error("Опрос не найден.");
      }
      if (existingSurvey.creatorId !== userId) {
        throw new Error("У вас нет прав на редактирование этого опроса.");
      }

      await tx.survey.update({
        where: { id: surveyId },
        data: {
          title: surveyData.title,
          description: surveyData.description,
          status: surveyData.status,
          isPublic: surveyData.isPublic,
        },
      });

      const existingQuestions = existingSurvey.questions;
      const submittedQuestions = surveyData.questions;

      const submittedQuestionIds = submittedQuestions
          .map((q) => q.id)
          .filter((id): id is number => id !== undefined);

      const questionsToDelete = existingQuestions.filter(
          (q) => !submittedQuestionIds.includes(q.id),
      );

      for (const q of questionsToDelete) {
        if (q._count.answers > 0) {
          throw new Error(
              `Нельзя удалить вопрос "${q.text}", так как на него уже есть ответы.`,
          );
        }
        await tx.question.delete({ where: { id: q.id } });
      }

      for (const submittedQ of submittedQuestions) {
        const questionInDb = existingQuestions.find((q) => q.id === submittedQ.id);

        if (submittedQ.id && questionInDb) {
          await tx.question.update({
            where: { id: submittedQ.id },
            data: {
              text: submittedQ.text,
              type: submittedQ.type,
              isRequired: submittedQ.isRequired,
              order: submittedQ.order,
            },
          });

          const existingOptions = questionInDb.options;
          const submittedOptions = submittedQ.options;
          const submittedOptionIds = submittedOptions
              .map((opt) => opt.id)
              .filter((id): id is number => id !== undefined);

          const optionsToDelete = existingOptions.filter(
              (opt) => !submittedOptionIds.includes(opt.id),
          );

          if (optionsToDelete.length > 0) {
            if (questionInDb._count.answers > 0) {
              throw new Error(
                  `Нельзя удалять варианты у вопроса "${submittedQ.text}", так как на него уже есть ответы. Это может повредить данные.`,
              );
            }
            await tx.answerOption.deleteMany({
              where: { id: { in: optionsToDelete.map((opt) => opt.id) } },
            });
          }

          for (const opt of submittedOptions) {
            if (opt.id) {
              await tx.answerOption.update({
                where: { id: opt.id },
                data: { text: opt.text, order: opt.order },
              });
            } else {
              await tx.answerOption.create({
                data: {
                  questionId: submittedQ.id,
                  text: opt.text,
                  order: opt.order,
                },
              });
            }
          }
        } else {
          await tx.question.create({
            data: {
              surveyId: surveyId,
              text: submittedQ.text,
              type: submittedQ.type,
              isRequired: submittedQ.isRequired,
              order: submittedQ.order,
              options: {
                create: submittedQ.options.map((opt) => ({
                  text: opt.text,
                  order: opt.order,
                })),
              },
            },
          });
        }
      }
    });

    revalidatePath(`/admin/${surveyId}/edit`);
    revalidatePath(`/admin/${surveyId}/results`);

    return { success: true, message: "Опрос успешно сохранен!" };

  } catch (error) {
    console.error("Failed to update survey:", error);
    const errorMessage =
        error instanceof Error
            ? error.message
            : "Внутренняя ошибка сервера. Не удалось сохранить опрос.";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function createSurveyAction(title: string) {
  const session = await auth();
  if (!title || title.trim().length < 3)
    return {
      error: "Название опроса должно содержать минимум 3 символа.",
    };

  if (!session?.user?.id)
    return {
      error: "Пользователь не авторизован.",
    };

  try {
    const newSurvey = await prisma.survey.create({
      data: {
        title: title.trim(),
        creatorId: session.user.id,
        status: SurveyStatus.DRAFT,
      },
    });

    revalidatePath("/surveys");
    return { success: true, surveyId: newSurvey.id };
  } catch (e) {
    return {
      error: "Не удалось создать опрос. Пожалуйста, попробуйте снова.",
    };
  }
}

export async function getSurveysByCreatorId(
  creatorId: string,
): Promise<MySurveysApiResponse> {
  try {
    return await prisma.survey.findMany({
      where: {
        creatorId: creatorId,
      },
      select: mySurveysSelect,
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Failed to fetch surveys:", error);
    throw new Error("Failed to fetch surveys.");
  }
}

export async function deleteSurveyAction(surveyId: number) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== UserRole.SURVEY_CREATOR) {
    return {
      success: false,
      message: "У вас нет прав для выполнения этого действия.",
    };
  }
  const userId = session.user.id;

  try {
    const survey = await prisma.survey.findUnique({
      where: {
        id: surveyId,
      },
    });

    if (!survey) {
      return { success: false, message: "Опрос не найден." };
    }

    if (survey.creatorId !== userId) {
      return {
        success: false,
        message: "Вы не можете удалить чужой опрос.",
      };
    }

    if (survey.status !== SurveyStatus.DRAFT) {
      return {
        success: false,
        message: "Удалить можно только опросы со статусом 'Черновик'.",
      };
    }

    await prisma.survey.delete({
      where: {
        id: surveyId,
      },
    });

  } catch (error) {
    console.error("Failed to delete survey:", error);
    return {
      success: false,
      message: "Произошла ошибка при удалении опроса.",
    };
  }

  revalidatePath("/admin");
  redirect("/admin");
}
