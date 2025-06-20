import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { SurveyClientForm } from "@/components/quiz/SurveyClientForm";
import { auth } from "@/auth";

export default async function SurveyPage({
  params,
}: {
  params: { id: string };
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto py-8 px-4">
        <SurveyClientForm survey={survey} />
      </main>
      <Footer />
    </div>
  );
}
