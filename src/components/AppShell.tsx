import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Painel" },
  { to: "/participantes", label: "Participantes" },
  { to: "/canteiros", label: "Canteiros" },
  { to: "/culturas", label: "Culturas" },
  { to: "/plantios", label: "Plantios" },
  { to: "/atividades", label: "Atividades" },
  { to: "/colheitas", label: "Colheitas" },
  { to: "/destinacoes", label: "Destinações" },
  { to: "/historico", label: "Histórico" },
] as const;

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-deep text-deep-foreground shadow-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <button
            className="rounded-md p-1.5 hover:bg-sidebar-accent md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-leaf text-leaf-foreground">
              <Sprout className="size-5" />
            </span>
            <span className="text-lg font-bold tracking-tight">Horta Comunitária</span>
          </Link>
          <span className="ml-auto hidden text-xs uppercase tracking-widest opacity-70 sm:block">
            AEP 2026.2
          </span>
        </div>
        <nav
          className={cn(
            "mx-auto max-w-6xl gap-1 overflow-x-auto px-2 pb-2 md:flex",
            open ? "flex flex-col" : "hidden md:flex",
          )}
        >
          {nav.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-leaf text-leaf-foreground"
                    : "text-deep-foreground/75 hover:bg-sidebar-accent hover:text-deep-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle ? (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {children}
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Sistema de Gestão de Hortas Comunitárias · ODS 2, 11 e 12
      </footer>
    </div>
  );
}
