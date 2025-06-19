import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma";
import { notFound, redirect } from "next/navigation";
import { TabsNav } from "./tabs-nav";

export default async function SurveyAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.SURVEY_CREATOR) {
    redirect("/api/auth/signin");
  }

  const surveyId = parseInt(params.id, 10);
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
    <div className="container mx-auto py-8 max-w-5xl space-y-6 @5xl:px-0 px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{survey.title}</h1>
        <p className="text-muted-foreground">Панель управления опросом</p>
      </div>
      <TabsNav surveyId={survey.id} />
      <main>{children}</main>
    </div>
  );
}
