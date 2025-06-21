import { Bot, Context, session, InlineKeyboard } from "grammy";
import { prisma } from "../src/lib/prisma";
import { Question, AnswerOption, Survey } from "../src/generated/prisma";
import { config } from "dotenv";

config();

interface SessionData {
  currentSurveyId?: number;
  currentQuestionIndex?: number;
  answers: {
    questionId: number;
    textValue?: string;
    numberValue?: number;
    selectedOptionId?: number;
    chosenOptions?: number[];
  }[];
  tempMultipleChoice?: number[];
}

type MyContext = Context & {
  session: SessionData;
};

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN is not defined in .env file");
}
const bot = new Bot<MyContext>(process.env.BOT_TOKEN);

bot.use(
    session({
      initial: (): SessionData => ({
        answers: [],
      }),
    }),
);

bot.command("start", (ctx) => {
  ctx.reply(
      "👋 Добро пожаловать! Я бот для прохождения опросов.\n\n" +
      "Чтобы посмотреть список доступных опросов, используйте команду /surveys.\n" +
      "Чтобы начать конкретный опрос, используйте /start_survey {ID опроса}."
  );
});

bot.command("surveys", async (ctx) => {
  try {
    const surveys = await prisma.survey.findMany({
      where: {
        isPublic: true,
        status: "PUBLISHED",
      },
    });

    if (surveys.length === 0) {
      await ctx.reply("Сейчас нет доступных опросов. Зайдите попозже!");
      return;
    }

    const keyboard = new InlineKeyboard();
    surveys.forEach((survey) => {
      keyboard.text(survey.title, `start_survey_${survey.id}`).row();
    });

    await ctx.reply("Выберите опрос для прохождения:", {
      reply_markup: keyboard,
    });
  } catch (error) {
    console.error("Failed to fetch surveys:", error);
    await ctx.reply("Произошла ошибка при загрузке опросов. Попробуйте снова.");
  }
});

bot.command("start_survey", async (ctx) => {
  const parts = ctx.message!.text.split(' ');
  if (parts.length < 2) {
    await ctx.reply("Пожалуйста, укажите ID опроса. Например: /start_survey 123");
    return;
  }

  const surveyId = parseInt(parts[1], 10);
  if (isNaN(surveyId)) {
    await ctx.reply("ID опроса должен быть числом. Например: /start_survey 123");
    return;
  }

  try {
    const survey = await prisma.survey.findFirst({
      where: {
        id: surveyId,
        isPublic: true,
        status: 'PUBLISHED'
      }
    });

    if (!survey) {
      await ctx.reply("Опрос с таким ID не найден, или он недоступен для прохождения.");
      return;
    }

    await startSurveyFlow(ctx, survey.id);

  } catch (error) {
    console.error("Failed to start survey by ID:", error);
    await ctx.reply("Произошла ошибка при запуске опроса.");
  }
});

async function startSurveyFlow(ctx: MyContext, surveyId: number) {
  ctx.session.currentSurveyId = surveyId;
  ctx.session.currentQuestionIndex = 0;
  ctx.session.answers = [];
  ctx.session.tempMultipleChoice = [];

  await ctx.reply("Отлично! Начинаем опрос...");
  await presentQuestion(ctx);
}

async function presentQuestion(ctx: MyContext) {
  const { currentSurveyId, currentQuestionIndex } = ctx.session;

  if (currentSurveyId === undefined || currentQuestionIndex === undefined) return;

  const survey = await prisma.survey.findUnique({
    where: { id: currentSurveyId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!survey || survey.questions.length <= currentQuestionIndex) {
    await finishSurvey(ctx);
    return;
  }

  const question = survey.questions[currentQuestionIndex];
  let keyboard: InlineKeyboard | undefined;

  switch (question.type) {
    case "SINGLE_CHOICE":
      keyboard = new InlineKeyboard();
      question.options.forEach((option) => {
        keyboard!.text(option.text, `answer_option_${question.id}_${option.id}`).row();
      });
      break;
    case "MULTIPLE_CHOICE":
      ctx.session.tempMultipleChoice = [];
      keyboard = buildMultipleChoiceKeyboard(question, []);
      break;
  }

  if (!question.isRequired) {
    if (!keyboard) {
      keyboard = new InlineKeyboard();
    }
    keyboard.row().text("➡️ Пропустить", `skip_question_${question.id}`);
  }

  await ctx.reply(
      `❓ Вопрос ${currentQuestionIndex + 1}/${survey.questions.length}${!question.isRequired ? " (необязательный)" : ""}:\n\n*${question.text}*`, {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      },
  );
}

bot.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery.data;
  await ctx.answerCallbackQuery();

  if (data.startsWith("start_survey_")) {
    const surveyId = parseInt(data.replace("start_survey_", ""), 10);
    await ctx.deleteMessage();
    await startSurveyFlow(ctx, surveyId);
    return;
  }

  if (data.startsWith("skip_question_")) {
    const [,,questionIdStr] = data.split("_")
    const questionId = parseInt(questionIdStr, 10);
    ctx.session.answers.push({
      questionId,
      textValue: undefined,
      numberValue: undefined,
      selectedOptionId: undefined,
      chosenOptions: undefined});
    ctx.session.currentQuestionIndex!++;
    await ctx.editMessageText("Вопрос пропущен.");
    await presentQuestion(ctx);
    return;
  }

  if (data.startsWith("answer_option_")) {
    const [, , questionIdStr, optionIdStr] = data.split("_");
    const questionId = parseInt(questionIdStr, 10);
    const selectedOptionId = parseInt(optionIdStr, 10);

    ctx.session.answers.push({ questionId, selectedOptionId });
    ctx.session.currentQuestionIndex!++;
    await ctx.editMessageText("Ответ принят!");
    await presentQuestion(ctx);
    return;
  }

  if (data.startsWith("mchoice_done_")) {
    const [, , questionIdStr] = data.split("_");
    const questionId = parseInt(questionIdStr, 10);

    const chosenOptions = ctx.session.tempMultipleChoice || [];
    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (question?.isRequired && chosenOptions.length === 0) {
      await ctx.answerCallbackQuery({
        text: "Это обязательный вопрос, выберите хотя бы один вариант.",
        show_alert: true,
      });
      return;
    }

    ctx.session.answers.push({ questionId, chosenOptions });
    ctx.session.currentQuestionIndex!++;
    ctx.session.tempMultipleChoice = [];
    await ctx.editMessageText("Ответ принят!");
    await presentQuestion(ctx);
    return;
  }

  if (data.startsWith("mchoice_")) {
    const [, questionIdStr, optionIdStr] = data.split("_");
    const questionId = parseInt(questionIdStr, 10);
    const optionId = parseInt(optionIdStr, 10);

    const tempChoices = ctx.session.tempMultipleChoice || [];
    const choiceIndex = tempChoices.indexOf(optionId);
    if (choiceIndex > -1) {
      tempChoices.splice(choiceIndex, 1);
    } else {
      tempChoices.push(optionId);
    }
    ctx.session.tempMultipleChoice = tempChoices;

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { options: { orderBy: { order: "asc" } } },
    });
    if (question) {
      const newKeyboard = buildMultipleChoiceKeyboard(question, tempChoices);
      await ctx.editMessageReplyMarkup({ reply_markup: newKeyboard });
    }
    return;
  }
});



bot.on("message:text", async (ctx) => {
  const { currentSurveyId, currentQuestionIndex } = ctx.session;
  if (currentSurveyId === undefined || currentQuestionIndex === undefined)
    return;

  if (ctx.message.text.toLowerCase() === '/skip') {
    const survey = await prisma.survey.findUnique({
      where: { id: currentSurveyId },
      include: { questions: { select: { id: true, isRequired: true}, orderBy: { order: 'asc'}}}
    });
    const question = survey?.questions[currentQuestionIndex];
    if (question && !question.isRequired) {
      ctx.session.currentQuestionIndex!++;
      await ctx.reply("Вопрос пропущен.");
      await presentQuestion(ctx);
      return;
    }
  }

  const survey = await prisma.survey.findUnique({
    where: { id: currentSurveyId },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!survey || !survey.questions[currentQuestionIndex]) return;

  const question = survey.questions[currentQuestionIndex];
  const text = ctx.message.text;

  if (question.type === "TEXT") {
    ctx.session.answers.push({ questionId: question.id, textValue: text });
  } else if (question.type === "NUMBER") {
    const numberValue = parseFloat(text.replace(",", "."));
    if (isNaN(numberValue)) {
      await ctx.reply("Пожалуйста, введите число.");
      return;
    }
    ctx.session.answers.push({ questionId: question.id, numberValue });
  } else {
    await ctx.reply(
        "Пожалуйста, используйте кнопки для ответа на этот вопрос.",
    );
    return;
  }

  ctx.session.currentQuestionIndex!++;
  await ctx.reply("Ответ принят!");
  await presentQuestion(ctx);
});

function buildMultipleChoiceKeyboard(
    question: Question & { options: AnswerOption[] },
    selectedIds: number[],
): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  question.options.forEach((option) => {
    const isSelected = selectedIds.includes(option.id);
    const text = isSelected ? `✅ ${option.text}` : option.text;
    keyboard.text(text, `mchoice_${question.id}_${option.id}`).row();
  });
  keyboard.text("✔️ Готово", `mchoice_done_${question.id}`);
  return keyboard;
}

async function finishSurvey(ctx: MyContext) {
  const { currentSurveyId, answers } = ctx.session;
  if (!currentSurveyId) return;

  try {
    await prisma.$transaction(async (tx) => {
      const userResponse = await tx.userResponse.create({
        data: {
          surveyId: currentSurveyId,
          userId: null,
        },
      });


      for (const answer of answers) {
        await tx.answer.create({
          data: {
            userResponseId: userResponse.id,
            questionId: answer.questionId,
            textValue: answer.textValue,
            numberValue: answer.numberValue,
            selectedOptionId: answer.selectedOptionId,
            chosenOptions: answer.chosenOptions
                ? {
                  create: answer.chosenOptions.map((optionId) => ({
                    optionId: optionId,
                  })),
                }
                : undefined,
          },
        });
      }
    });

    await ctx.reply("🎉 Спасибо! Ваш опрос завершен, и все ответы сохранены.");
  } catch (error) {
    console.error("Failed to save survey results:", error);
    await ctx.reply(
        "Произошла ошибка при сохранении ваших ответов. Пожалуйста, попробуйте пройти опрос позже.",
    );
  } finally {
    ctx.session.currentSurveyId = undefined;
    ctx.session.currentQuestionIndex = undefined;
    ctx.session.answers = [];
  }
}

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  console.error(e);
});

async function startBot() {
  await prisma.$connect();
  console.log("Prisma Client connected.");

  await bot.start();
  console.log("Bot started!");
}

startBot().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});