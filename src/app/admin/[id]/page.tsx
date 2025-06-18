import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, UserRole } from "@/generated/prisma";
import { forbidden, notFound, redirect } from "next/navigation";

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
  params: { id: string };
}) {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  if (session.user.role !== UserRole.SURVEY_CREATOR) forbidden();

  const surveyId = parseInt((await params).id, 10);

  if (isNaN(surveyId)) notFound();

  const survey = await prisma.survey.findUnique({
    where: {
      id: surveyId,
    },
    select: surveyDetailSelect,
  });

  if (!survey || survey.creatorId !== session.user.id) notFound();

  return <div>{survey.title}</div>;
}
