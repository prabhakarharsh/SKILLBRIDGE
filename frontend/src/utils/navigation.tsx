"use client";

import React from "react";
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { useRouter, useParams as useNextParams, usePathname, useSearchParams as useNextSearchParams } from "next/navigation";

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: string;
  href?: string;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, href, children, className, ...props }, ref) => {
    const targetHref = to || href || "#";
    return (
      <NextLink ref={ref} href={targetHref} className={className} {...props}>
        {children}
      </NextLink>
    );
  }
);

Link.displayName = "Link";

export function useNavigate() {
  const router = useRouter();

  return React.useCallback(
    (to: string | number, options?: { replace?: boolean }) => {
      if (typeof to === "number") {
        if (to === -1) router.back();
        return;
      }
      if (options?.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    },
    [router]
  );
}

export function useParams<T = Record<string, string>>(): T {
  const params = useNextParams();
  return (params || {}) as T;
}

export function useLocation() {
  const pathname = usePathname();
  return { pathname: pathname || "/" };
}

export function useSearchParams() {
  const searchParams = useNextSearchParams();
  return [searchParams || new URLSearchParams()] as const;
}
