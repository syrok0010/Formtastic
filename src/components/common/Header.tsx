import React from "react";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import Logo from "@/components/common/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GalleryVerticalEnd, Menu, LogOut } from "lucide-react";
import { UserRole } from "@/generated/prisma";

export default async function Header() {
  const session = await auth();
  const role = session?.user.role;
  let surveysUrl = "/";
  let navWord = "Опросы";
  if (role === UserRole.SURVEY_CREATOR) {
    surveysUrl = "/admin";
  } else if (role === UserRole.SURVEY_RESPONDENT) {
    surveysUrl = "/account";
    navWord = "Пройденные опросы";
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">
          <Logo />

          {!!session && (
            <>
              <nav className="hidden md:flex items-center space-x-8 absolute left-1/2 -translate-x-1/2">
                <Link
                  href={surveysUrl}
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 text-base font-medium transition-colors duration-300"
                >
                  {navWord}
                </Link>
              </nav>

              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
                className="hidden md:block"
              >
                <Button type="submit">Выйти</Button>
              </form>
            </>
          )}

          <div className={!role ? "hidden" : "md:hidden"}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button>
                  <Menu className="h-6 w-6 cursor-pointer text-gray-400 hover:text-gray-500" />
                  <span className="sr-only">Открыть меню</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Страницы</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href={surveysUrl} passHref>
                  <DropdownMenuItem>
                    <GalleryVerticalEnd className="mr-2 h-4 w-4" />
                    {navWord}
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem>
                  <form
                    action={async () => {
                      "use server";
                      await signOut();
                    }}
                    className="flex gap-2 items-center"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <button>Выйти</button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
