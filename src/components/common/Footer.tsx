import Link from "next/link";
import React from "react";
import { Github } from "lucide-react";
import Logo from "@/components/common/Logo";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background py-8 text-foreground">
      <div className="container mx-auto px-4 lg:px-8 flex flex-col gap-y-6 md:flex-row justify-between items-center">
        <div className="flex gap-6 flex-col md:flex-row items-center">
          <Logo />
          <div className="flex flex-col justify-center gap-2 text-center md:text-left max-w-md md:pl-6 text-wrap md:border-l-2 border-stone-200">
            <p className="text-lg text-muted-foreground font-semibold">
              Платформа для создания и проведения опросов и викторин.
            </p>
            <p className="text-muted-foreground">
              © 2025 Formtastic. Все права защищены.
            </p>
          </div>
        </div>
        <Link href="https://github.com/syrok0010/Formtastic">
          <Github className="h-8 w-8 text-muted-foreground hover:text-blue-600 transition-colors duration-300 cursor-pointer" />
        </Link>
      </div>
    </footer>
  );
}
