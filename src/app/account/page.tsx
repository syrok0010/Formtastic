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
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Мои пройденные опросы
        </h1>
        <p className="text-muted-foreground mt-1">
          Здесь отображаются все опросы, в которых вы приняли участие.
        </p>
      </div>

      {userResponses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userResponses.map((response) => (
            <Link href={`/account/${response.id}`} key={response.id} passHref>
              <Card className="flex flex-col h-full hover:border-primary hover:shadow-lg transition-all duration-200 cursor-pointer">
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
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/50 py-20 text-center">
          <h2 className="text-xl font-semibold">Опросов пока нет</h2>
          <p className="text-muted-foreground mt-2 max-w-xs">
            Как только вы пройдете свой первый опрос, он появится здесь.
          </p>
        </div>
      )}
    </div>
  );
}
