import Link from "next/link";
import React from "react";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma";

export default async function Logo() {
  const session = await auth();
  const role = session?.user.role;
  let homeUrl = "/";
  if (role === UserRole.SURVEY_CREATOR) {
    homeUrl = "/admin";
  } else if (role === UserRole.SURVEY_RESPONDENT) {
    homeUrl = "/account";
  }

  return (
    <Link href={homeUrl} className="flex items-center space-x-2 cursor-pointer">
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
      <span className="text-xl font-bold">Formtastic</span>
    </Link>
  );
}
