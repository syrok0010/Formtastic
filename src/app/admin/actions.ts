"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { QuestionType, SurveyStatus, UserRole } from "@/generated/prisma";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";

const OptionSchema = z.object({
  text: z.string().min(1, "Текст варианта не может быть пустым"),
  order: z.number().int(),
});

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

const QuestionSchema = z.object({
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
    // В Server Action мы не можем напрямую редиректить в середине выполнения,
    // но можем вернуть ошибку. Редирект лучше делать на клиенте, если нужно.
    // Либо, если это критическая ошибка, можно вызвать `redirect()`.
    redirect("/api/auth/signin"); // Например, на страницу входа
  }

  const rawData = JSON.parse(formData.get("surveyData") as string);
  const validationResult = SurveyUpdateSchema.safeParse(rawData);

  if (!validationResult.success) {
    console.error(
      "Validation failed:",
      validationResult.error.flatten().fieldErrors,
    );
    return {
      success: false,
      message: "Ошибка валидации. Проверьте введенные данные.",
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  const surveyData = validationResult.data;
  const surveyId = surveyData.id;

  try {
    const existingSurvey = await prisma.survey.findUnique({
      where: { id: surveyId },
      select: { creatorId: true },
    });

    if (!existingSurvey) {
      return { success: false, message: "Опрос не найден." };
    }
    if (existingSurvey.creatorId !== session.user.id) {
      return {
        success: false,
        message: "У вас нет прав на редактирование этого опроса.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.survey.update({
        where: { id: surveyId },
        data: {
          title: surveyData.title,
          description: surveyData.description,
          status: surveyData.status,
          isPublic: surveyData.isPublic,
        },
      });

      await tx.question.deleteMany({ where: { surveyId: surveyId } });

      if (surveyData.questions && surveyData.questions.length > 0) {
        for (const q of surveyData.questions) {
          await tx.question.create({
            data: {
              surveyId: surveyId,
              text: q.text,
              type: q.type,
              isRequired: q.isRequired,
              order: q.order,
              options: {
                create: q.options.map((opt) => ({
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
    return {
      success: false,
      message: "Внутренняя ошибка сервера. Не удалось сохранить опрос.",
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
