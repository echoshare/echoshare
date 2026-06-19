import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { LanguageToggle } from "./language-toggle";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
  const { t } = useTranslation();

  const links = [
    { to: "/", label: t("nav.home"), exact: true },
    { to: "/share", label: t("nav.share"), exact: false },
    { to: "/receive", label: t("nav.receive"), exact: false },
    { to: "/history", label: t("nav.history"), exact: false },
    { to: "/webhook", label: t("nav.webhook"), exact: false },
    { to: "/settings", label: t("nav.settings"), exact: false },
  ] as const;

  return (
    <header className="border-b">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-semibold">
            {t("app.title")}
          </Link>
          <nav className="text-muted-foreground flex flex-wrap gap-3 text-xs">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: link.exact }}
                className="hover:text-foreground [&.active]:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
