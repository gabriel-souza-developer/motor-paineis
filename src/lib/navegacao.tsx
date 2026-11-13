"use client";
// Ponte de navegação sobre o Next.js (App Router).
// Mantém uma API simples para as telas: Link com `to`, useNavigate, useSearchParams, useLocation.
import NextLink from "next/link";
import { usePathname, useRouter, useSearchParams as useNextSearchParams } from "next/navigation";
import { useCallback } from "react";

type LinkProps = Omit<React.ComponentProps<typeof NextLink>, "href"> & { to: string };

export function Link({ to, ...props }: LinkProps) {
  return <NextLink href={to} {...props} />;
}

export function useNavigate() {
  const router = useRouter();
  return useCallback(
    (para: string, opcoes?: { replace?: boolean }) => (opcoes?.replace ? router.replace(para) : router.push(para)),
    [router],
  );
}

export function useSearchParams(): [URLSearchParams] {
  const p = useNextSearchParams();
  return [new URLSearchParams(p?.toString() ?? "")];
}

export function useLocation() {
  const pathname = usePathname() ?? "/";
  const p = useNextSearchParams();
  const busca = p?.toString();
  return { pathname, search: busca ? `?${busca}` : "" };
}
