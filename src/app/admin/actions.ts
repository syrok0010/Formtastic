import {prisma} from "@/lib/prisma";
import {Prisma} from "@/generated/prisma";

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

export async function getSurveysByCreatorId(creatorId: string) : Promise<MySurveysApiResponse> {
    try {
        return await prisma.survey.findMany({
            where: {
                creatorId: creatorId,
            },
            select: mySurveysSelect,
            orderBy: {
                createdAt: "desc",
            },
        });
    } catch (error) {
        console.error("Failed to fetch surveys:", error);
        throw new Error("Failed to fetch surveys.");
    }
}