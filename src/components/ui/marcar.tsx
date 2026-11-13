"use client";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { useId } from "react";

export function Marcar({ rotulo, ...props }: { rotulo: string } & React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  const id = useId();
  return (
    <div className="flex items-center gap-2.5">
      <CheckboxPrimitive.Root
        id={id}
        className="peer grid size-[18px] place-items-center rounded-full border border-input bg-card outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/30 data-[state=checked]:border-[var(--primary-texto)] data-[state=checked]:bg-primary"
        {...props}
      >
        <CheckboxPrimitive.Indicator>
          <Check className="size-3 text-primary-foreground" strokeWidth={3} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <label htmlFor={id} className="text-xs font-medium text-foreground/80 select-none">
        {rotulo}
      </label>
    </div>
  );
}
