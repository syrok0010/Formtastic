import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Inbox} from "lucide-react";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const userResponses = await prisma.userResponse.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      survey: {
        select: {
          id: true,
          title: true,
          description: true,
          _count: {
            select: { questions: true },
          },
        },
      },
    },
    orderBy: {
      submittedAt: "desc",
    },
  });

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Мои пройденные опросы
        </h1>
      </div>

      {userResponses.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {userResponses.map((response) => (
            <Link href={`/account/${response.id}`} key={response.id} passHref>
              <Card className="flex flex-col h-full cursor-pointer transition-all hover:shadow-lg">
                <CardHeader>
                  <CardTitle>{response.survey.title}</CardTitle>
                  {response.survey.description && (
                    <CardDescription className="line-clamp-3 pt-1">
                      {response.survey.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="mt-auto text-sm text-muted-foreground">
                  <p>Вопросов: {response.survey._count.questions}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center col-span-2">
          <Inbox className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Опросов пока нет</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Как только вы пройдете свой первый опрос, он появится здесь.
          </p>
        </div>
      )}
    </>
  );
}
