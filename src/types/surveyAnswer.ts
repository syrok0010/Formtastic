import { Prisma } from "@/generated/prisma";

const userCompletedResponsePayload =
  Prisma.validator<Prisma.UserResponseDefaultArgs>()({
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

export type UserCompletedResponse = Prisma.UserResponseGetPayload<
  typeof userCompletedResponsePayload
>;

const surveyWithResponsesPayload = Prisma.validator<Prisma.SurveyDefaultArgs>()(
  {
    include: {
      questions: {
        include: { options: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
      responses: {
        orderBy: { submittedAt: "desc" },
        include: {
          answers: {
            include: {
              chosenOptions: { select: { optionId: true } },
            },
          },
        },
      },
    },
  },
);

export type SurveyWithResponses = Prisma.SurveyGetPayload<
  typeof surveyWithResponsesPayload
>;

export type FullUserResponse = SurveyWithResponses["responses"][0];

export type FullQuestion = SurveyWithResponses["questions"][0];
