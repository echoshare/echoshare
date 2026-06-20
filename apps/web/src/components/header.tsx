import { Link } from "@tanstack/react-router";
import { Cast, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LanguageToggle } from "./language-toggle";
import { ModeToggle } from "./mode-toggle";

interface NavLink {
  to: string;
  label: string;
  exact: boolean;
}

export default function Header() {
  const { t } = useTranslation();

  const links: NavLink[] = [
    { to: "/", label: t("nav.home"), exact: true },
    { to: "/share", label: t("nav.share"), exact: false },
    { to: "/receive", label: t("nav.receive"), exact: false },
    { to: "/history", label: t("nav.history"), exact: false },
    { to: "/webhook", label: t("nav.webhook"), exact: false },
    { to: "/settings", label: t("nav.settings"), exact: false },
  ];

  return (
    <header className="bg-background border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-base font-semibold tracking-tight">
          <Cast className="size-5 shrink-0" />
          <span>{t("app.title")}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.exact }}
              className="text-muted-foreground hover:text-foreground hover:bg-muted [&.active]:text-foreground [&.active]:bg-muted rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <LanguageToggle />
          <ModeToggle />
          <MobileNav links={links} />
        </div>
      </div>
    </header>
  );
}

function MobileNav({ links }: { links: NavLink[] }) {
  const { t } = useTranslation();

  return (
    <div className="md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
          <Menu className="size-5" />
          <span className="sr-only">{t("common.menu")}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {links.map((link) => (
            <DropdownMenuItem
              key={link.to}
              render={
                <Link
                  to={link.to}
                  activeOptions={{ exact: link.exact }}
                  className="[&.active]:text-foreground [&.active]:font-medium"
                />
              }
            >
              {link.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
