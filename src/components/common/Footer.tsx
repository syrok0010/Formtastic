import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background py-8 text-foreground">
      <div className="container mx-auto flex flex-col md:flex-row justify-between gap-8 md:gap-16 px-4">
        <div>
          <h2 className="font-bold text-lg mb-2">Formtastic</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Платформа для создания и проведения опросов и викторин.
          </p>
        </div>
        <div className="flex flex-col gap-6 md:gap-12 md:flex-row">
          <div>
            <h3 className="font-semibold mb-2">Платформа</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/features" className="hover:underline">
                  Возможности
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:underline">
                  Блог
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:underline">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="container mx-auto mt-8 px-4 text-xs text-muted-foreground text-center">
        © 2025 Formtastic. Все права защищены.
      </div>
    </footer>
  );
}
