"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface TabsNavProps {
  surveyId: number;
}

export function TabsNav({ surveyId }: TabsNavProps) {
  const pathname = usePathname();
  const basePath = `/admin/${surveyId}`;

  const navItems = [
    { href: `${basePath}/edit`, label: "Редактор" },
    { href: `${basePath}/results`, label: "Результаты" },
  ];

  return (
    <div className="border-b">
      <nav className="flex space-x-4" aria-label="Tabs">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2 text-sm font-medium",
              pathname === item.href
                ? "border-sky-500 text-sky-600"
                : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-gray-700",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
