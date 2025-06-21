"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Trash2 } from "lucide-react";
import React from "react";
import { deleteSurveyAction } from "@/app/admin/actions";
import { SurveyStatus } from "@/generated/prisma";

type Props = {
  surveyId: number;
  status: SurveyStatus;
};

export function DeleteSurveyMenuItem({ surveyId, status }: Props) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const dis = status !== SurveyStatus.DRAFT;

  return (
    <div onClick={handleClick}>
      <DropdownMenuItem
        disabled={dis}
        className={`text-red-600 focus:text-red-600 p-0 ${dis ? "focus:bg-white" : "focus:bg-red-50"}`}
        onSelect={(e) => e.preventDefault()}
      >
        <form
          action={async () => {
            await deleteSurveyAction(surveyId);
          }}
          className="w-full px-2 py-1.5"
        >
          <button
            disabled={dis}
            className="flex gap-2 items-center disabled:cursor-default cursor-pointer pointer-events-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Удалить
          </button>
        </form>
      </DropdownMenuItem>
    </div>
  );
}
