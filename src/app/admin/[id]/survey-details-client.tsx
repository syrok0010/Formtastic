"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { SurveyDetailPayload } from "./page";
import { QuestionType, SurveyStatus } from "@/generated/prisma";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";
import { updateSurveyAction } from "@/app/admin/actions";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableQuestionItem } from "./sortable-question-item";

interface SurveyDetailsClientProps {
  initialSurvey: SurveyDetailPayload;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Сохранить изменения
    </Button>
  );
}

export function SurveyDetailsClient({
  initialSurvey,
}: SurveyDetailsClientProps) {
  const [survey, setSurvey] = useState(initialSurvey);

  const initialState = { message: "", success: false, errors: undefined };
  const [formState, formAction] = useActionState(
    updateSurveyAction,
    initialState,
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSurvey((prev) => {
        const oldIndex = prev.questions.findIndex((q) => q.id === active.id);
        const newIndex = prev.questions.findIndex((q) => q.id === over.id);

        const newQuestions = arrayMove(prev.questions, oldIndex, newIndex);

        const reorderedQuestions = newQuestions.map((q, index) => ({
          ...q,
          order: index,
        }));

        return {
          ...prev,
          questions: reorderedQuestions as any,
        };
      });
    }
  }

  const handleValueChange = (name: string, value: string | boolean) => {
    setSurvey((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionValueChange = (
    qIndex: number,
    name: string,
    value: string | boolean,
  ) => {
    const updatedQuestions = [...survey.questions];
    (updatedQuestions[qIndex] as any)[name] = value;

    if (
      name === "type" &&
      (value === QuestionType.TEXT || value === QuestionType.NUMBER)
    ) {
      updatedQuestions[qIndex].options = [];
    }
    setSurvey((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const handleOptionTextChange = (
    qIndex: number,
    optIndex: number,
    value: string,
  ) => {
    const updatedQuestions = [...survey.questions];
    updatedQuestions[qIndex].options[optIndex].text = value;
    setSurvey((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const addQuestion = () => {
    const newQuestion = {
      id: -1 * (Date.now() + survey.questions.length),
      text: "",
      type: QuestionType.TEXT,
      isRequired: true,
      order: survey.questions.length,
      options: [],
    };

    setSurvey((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion] as any,
    }));
  };

  const removeQuestion = (qIndex: number) => {
    const updatedQuestions = survey.questions
      .filter((_, index) => index !== qIndex)
      .map((q, index) => ({ ...q, order: index }));
    setSurvey((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const addOption = (qIndex: number) => {
    const newOption = {
      id: -1 * (Date.now() + survey.questions[qIndex].options.length),
      text: "",
      order: survey.questions[qIndex].options.length,
    };
    const updatedQuestions = [...survey.questions];
    updatedQuestions[qIndex].options.push(newOption as any);
    setSurvey((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const updatedQuestions = [...survey.questions];
    updatedQuestions[qIndex].options = updatedQuestions[qIndex].options
      .filter((_, index) => index !== optIndex)
      .map((opt, index) => ({ ...opt, order: index }));
    setSurvey((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  return (
    <form
      action={formAction}
      className="container mx-auto py-8 max-w-4xl space-y-8"
    >
      <input type="hidden" name="surveyData" value={JSON.stringify(survey)} />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Редактирование опроса
        </h1>
        <SubmitButton />
      </div>

      {formState?.message && (
        <Alert variant={formState.success ? "default" : "destructive"}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{formState.success ? "Успех!" : "Ошибка"}</AlertTitle>
          <AlertDescription>{formState.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Основные настройки</CardTitle>
          <CardDescription>
            Название, описание и статус вашего опроса.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название</Label>
            <Input
              id="title"
              value={survey.title}
              onChange={(e) => handleValueChange("title", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Описание (необязательно)</Label>
            <Textarea
              id="description"
              value={survey.description || ""}
              onChange={(e) => handleValueChange("description", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select
                value={survey.status}
                onValueChange={(value) => handleValueChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(SurveyStatus).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={survey.isPublic}
                onCheckedChange={(checked) =>
                  handleValueChange("isPublic", !!checked)
                }
              />
              <Label htmlFor="isPublic" className="cursor-pointer">
                Публичный опрос
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">Вопросы</h2>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={survey.questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            {survey.questions.map((question, qIndex) => (
              <SortableQuestionItem key={question.id} id={question.id}>
                <Card key={question.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Вопрос {qIndex + 1}</CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(qIndex)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <Label>Текст вопроса</Label>
                        <Input
                          value={question.text}
                          onChange={(e) =>
                            handleQuestionValueChange(
                              qIndex,
                              "text",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Тип вопроса</Label>
                        <Select
                          value={question.type}
                          onValueChange={(value) =>
                            handleQuestionValueChange(qIndex, "type", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(QuestionType).map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`isRequired-${qIndex}`}
                        checked={question.isRequired}
                        onCheckedChange={(checked) =>
                          handleQuestionValueChange(
                            qIndex,
                            "isRequired",
                            !!checked,
                          )
                        }
                      />
                      <Label
                        htmlFor={`isRequired-${qIndex}`}
                        className="cursor-pointer"
                      >
                        Обязательный вопрос
                      </Label>
                    </div>

                    {(question.type === QuestionType.SINGLE_CHOICE ||
                      question.type === QuestionType.MULTIPLE_CHOICE) && (
                      <div className="pt-4 border-t space-y-3">
                        <h4 className="text-sm font-medium">Варианты ответа</h4>
                        {question.options.map((option, optIndex) => (
                          <div
                            key={option.id}
                            className="flex items-center gap-2"
                          >
                            <Input
                              value={option.text}
                              onChange={(e) =>
                                handleOptionTextChange(
                                  qIndex,
                                  optIndex,
                                  e.target.value,
                                )
                              }
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeOption(qIndex, optIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(qIndex)}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Добавить вариант
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </SortableQuestionItem>
            ))}
          </SortableContext>
        </DndContext>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={addQuestion}
        >
          <Plus className="mr-2 h-4 w-4" />
          Добавить вопрос
        </Button>
      </div>
    </form>
  );
}
