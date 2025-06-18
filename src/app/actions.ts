"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { $Enums } from "@/generated/prisma";
import SurveyStatus = $Enums.SurveyStatus;

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
