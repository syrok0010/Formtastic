import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";
import { auth } from "@/auth";

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

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user?.id)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (session.user.role !== "SURVEY_CREATOR")
    return NextResponse.json(
      { message: "Forbidden: Only survey creators can view their surveys." },
      { status: 403 },
    );

  try {
    const surveys = await prisma.survey.findMany({
      where: {
        creatorId: session.user.id,
      },
      select: mySurveysSelect,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(surveys, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch surveys:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
