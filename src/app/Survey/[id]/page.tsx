import {prisma} from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Header } from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { QuizClientForm } from '@/components/quiz/QuizClientForm';

export default async function QuizPage({ params }: { params: { id: string } }) {
    const surveyId = parseInt(params.id, 10);
    if (isNaN(surveyId)) {
        notFound();
    }

    const survey = await prisma.survey.findUnique({
        where: {
            id: surveyId,
            status: 'PUBLISHED'
        },
        include: {
            questions: {
                include: {
                    options: {
                        orderBy: { order: 'asc' },
                    },
                },
                orderBy: { order: 'asc' },
            },
        },
    });

    if (!survey) {
        notFound();
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow container mx-auto py-8 px-4">
                <QuizClientForm survey={survey} />
            </main>
            <Footer />
        </div>
    );
}