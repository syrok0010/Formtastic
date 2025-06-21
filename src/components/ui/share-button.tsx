"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Copy, Check } from "lucide-react";

export function ShareButton({
  surveyId,
  appUrl,
}: {
  surveyId: number;
  appUrl: string;
}) {
  const [isCopied, setIsCopied] = useState(false);

  const publicUrl = `${appUrl}/survey/${surveyId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Не удалось скопировать ссылку: ", err);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="lg">
          <Share2 className="mr-2 h-4 w-4" />
          Поделиться
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96">
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <h3 className="text-lg font-semibold">Поделиться опросом</h3>
          <p className="text-sm text-muted-foreground">
            По этой ссылке можно будет оставить свой ответ на опрос.
          </p>
        </div>
        <div className="flex items-center space-x-2 pt-4">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Ссылка
            </Label>
            <Input
              id="link"
              defaultValue={publicUrl}
              readOnly
              className="h-9"
            />
          </div>
          <Button onClick={handleCopy} size="sm" className="px-3">
            <span className="sr-only">Копировать</span>
            {isCopied ? (
              <Check className="h-4 w-4 text-white" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
