import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { SurveyClientForm } from "@/components/quiz/SurveyClientForm";
import { auth } from "@/auth";

export default async function SurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const surveyId = parseInt(id, 10);
  if (isNaN(surveyId)) {
    notFound();
  }

  const survey = await prisma.survey.findUnique({
    where: {
      id: surveyId,
      status: "PUBLISHED",
    },
    include: {
      questions: {
        include: {
          options: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!survey) {
    notFound();
  }

  const session = await auth();

  if (!survey.isPublic && !session?.user) {
    redirect("/");
  }

  return <SurveyClientForm survey={survey} />;
}
