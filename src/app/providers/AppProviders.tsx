import type { ReactNode } from "react";
import { SystemNoticeHost } from "@/shared/components/SystemNoticeModal";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <>
      {children}
      <SystemNoticeHost />
    </>
  );
}
