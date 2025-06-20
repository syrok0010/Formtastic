import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { UserCompletedResponse } from "@/types/surveyAnswer";
import { UserResponseCard } from "@/components/common/user-response-card";

export default async function CompletedSurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const userResponseId = parseInt((await params).id, 10);
  if (isNaN(userResponseId)) {
    notFound();
  }

  const userResponse: UserCompletedResponse | null =
    await prisma.userResponse.findUnique({
      where: {
        id: userResponseId,
        userId: session.user.id,
      },
      include: {
        survey: {
          include: {
            questions: {
              include: { options: { orderBy: { order: "asc" } } },
              orderBy: { order: "asc" },
            },
          },
        },
        answers: {
          include: {
            chosenOptions: { select: { optionId: true } },
          },
        },
      },
    });

  if (!userResponse) {
    notFound();
  }

  return (
    <>
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link href="/account">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к моим опросам
          </Link>
        </Button>
      </div>

      <UserResponseCard
        response={userResponse}
        questions={userResponse.survey.questions}
        cardTitle={userResponse.survey.title}
        cardDescription={userResponse.survey.description || undefined}
      />
    </>
  );
}
