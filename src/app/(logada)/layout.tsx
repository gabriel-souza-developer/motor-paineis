import { Suspense } from "react";
import AreaLogada from "~/telas/_area-logada";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <AreaLogada>{children}</AreaLogada>
    </Suspense>
  );
}
