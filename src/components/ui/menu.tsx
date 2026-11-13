"use client";
import * as Menu from "@radix-ui/react-dropdown-menu";
import { cn } from "~/lib/utils";

export const MenuRaiz = Menu.Root;
export const MenuGatilho = Menu.Trigger;

export function MenuConteudo({ className, ...props }: React.ComponentProps<typeof Menu.Content>) {
  return (
    <Menu.Portal>
      <Menu.Content
        sideOffset={8}
        align="end"
        className={cn(
          "z-50 min-w-60 rounded-[var(--radius)] border border-border bg-card p-1.5 text-foreground shadow-xl",
          "data-[state=open]:animate-[entrar_150ms_ease-out]",
          className,
        )}
        {...props}
      />
    </Menu.Portal>
  );
}

export function MenuItem({ className, ...props }: React.ComponentProps<typeof Menu.Item>) {
  return (
    <Menu.Item
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold outline-none data-[highlighted]:bg-muted [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}

export const MenuSeparador = (p: React.ComponentProps<typeof Menu.Separator>) => (
  <Menu.Separator className="my-1 h-px bg-border" {...p} />
);
export const MenuRotulo = Menu.Label;
