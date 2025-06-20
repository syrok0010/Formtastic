import { PrismaClient, QuestionType } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
    console.log('Начинаем заполнение базы данных...');

    const creator = await prisma.user.findFirst({
        where: { email: process.env.EMAIL },
    });

    console.log(`Создан или найден пользователь: ${creator!.name}`);

    const oldSurvey = await prisma.survey.findFirst({
        where: { title: 'Тестовый опрос по технологиям' }
    });
    if (oldSurvey) {
        await prisma.survey.delete({ where: { id: oldSurvey.id } });
        console.log('Старый тестовый опрос удален.');
    }

    const survey = await prisma.survey.create({
        data: {
            title: 'Тестовый опрос по технологиям',
            description: 'Проверьте свои знания в популярных фреймворках и языках.',
            status: 'PUBLISHED',
            creatorId: creator!.id,
            questions: {
                create: [
                    {
                        text: 'Какой фреймворк был разработан Google?',
                        type: QuestionType.SINGLE_CHOICE,
                        order: 1,
                        isRequired: true,
                        options: {
                            create: [
                                { text: 'React', order: 1 },
                                { text: 'Angular', order: 2 },
                                { text: 'Vue', order: 3 },
                                { text: 'Svelte', order: 4 },
                            ],
                        },
                    },
                    {
                        text: 'Какие из перечисленных языков являются статически типизированными?',
                        type: QuestionType.MULTIPLE_CHOICE,
                        order: 2,
                        isRequired: true,
                        options: {
                            create: [
                                { text: 'TypeScript', order: 1 },
                                { text: 'JavaScript', order: 2 },
                                { text: 'Python', order: 3 },
                                { text: 'Java', order: 4 },
                            ],
                        },
                    },
                    {
                        text: 'Опишите ваш опыт работы с Next.js в нескольких словах.',
                        type: QuestionType.TEXT,
                        order: 3,
                        isRequired: false,
                    },
                    {
                        text: 'Сколько лет вы занимаетесь программированием?',
                        type: QuestionType.NUMBER,
                        order: 4,
                        isRequired: true,
                    },
                ],
            },
        },
        include: {
            questions: true,
        }
    });

    console.log(`🎉 Успешно создан опрос: "${survey.title}" (ID: ${survey.id})`);
    console.log(`Количество созданных вопросов: ${survey.questions.length}`);
}

main()
    .catch((e) => {
        console.error('Ошибка при заполнении базы данных:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });