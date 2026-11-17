import { lazy, Suspense } from "react";
import type { ComponentProps } from "react";
import type { QuickView as QuickViewComponent } from "./QuickView";

const Dialog = lazy(() => import("./QuickView").then(module => ({ default: module.QuickView })));

export function QuickView(props: ComponentProps<typeof QuickViewComponent>) {
  if (!props.p) return null;
  return <Suspense fallback={null}>
    <Dialog {...props}/>
  </Suspense>;
}
