import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma";
import { notFound, redirect } from "next/navigation";
import { TabsNav } from "./tabs-nav";
import React from "react";

export default async function SurveyAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.SURVEY_CREATOR) {
    redirect("/api/auth/signin");
  }

  const surveyId = parseInt((await params).id, 10);
  if (isNaN(surveyId)) {
    notFound();
  }

  const survey = await prisma.survey.findUnique({
    where: { id: surveyId, creatorId: session.user.id },
    select: { id: true, title: true },
  });

  if (!survey) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{survey.title}</h1>
      <TabsNav surveyId={survey.id} />
      <main>{children}</main>
    </div>
  );
}
