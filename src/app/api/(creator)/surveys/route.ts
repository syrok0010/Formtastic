import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {getSurveysByCreatorId} from "@/app/admin/actions";

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
    const surveys = await getSurveysByCreatorId(session.user.id);
    return NextResponse.json(surveys, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch surveys:", error);
    return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 },
    );
  }
}