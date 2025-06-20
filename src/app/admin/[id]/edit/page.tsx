import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import { notFound } from "next/navigation";
import { SurveyDetailsClient } from "@/app/admin/[id]/edit/survey-details-client";

const surveyDetailSelect = {
  id: true,
  title: true,
  description: true,
  isPublic: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  creatorId: true,
  creator: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  questions: {
    select: {
      id: true,
      text: true,
      type: true,
      isRequired: true,
      order: true,
      options: {
        select: {
          id: true,
          text: true,
          order: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  },
  _count: {
    select: {
      questions: true,
      responses: true,
    },
  },
} satisfies Prisma.SurveySelect;

export type SurveyDetailPayload = Prisma.SurveyGetPayload<{
  select: typeof surveyDetailSelect;
}>;

export default async function SurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const surveyId = parseInt((await params).id, 10);
  if (isNaN(surveyId)) notFound();

  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    select: surveyDetailSelect,
  });

  if (!survey) notFound();

  return <SurveyDetailsClient initialSurvey={survey} />;
}
