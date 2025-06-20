import Link from 'next/link';
import React from "react";
import {Github} from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background py-8 text-foreground">
      <div className="container mx-auto px-4 lg:px-8 flex flex-col gap-y-6 md:flex-row justify-between items-center">
        <div className="flex gap-6 flex-col md:flex-row items-center">
          <Link href="/" className="flex items-center space-x-2 cursor-pointer">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Formtastic</span>
          </Link>
          <div className="flex flex-col justify-center gap-2 text-center md:text-left max-w-md md:pl-6 text-wrap md:border-l-2 border-gray-200">
            <p className="text-lg">
              Платформа для создания и проведения опросов и викторин.
            </p>
            <p className="text-muted-foreground">
              © 2025 Formtastic. Все права защищены.
            </p>
          </div>
        </div>
          <Link href="https://github.com/syrok0010/Formtastic">
            <Github className="h-8 w-8 text-muted-foreground cursor-pointer"/>
          </Link>
      </div>
    </footer>
  );
}
