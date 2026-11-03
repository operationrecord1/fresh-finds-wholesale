import { lazy, Suspense } from "react";
import type { ComponentProps } from "react";
import type { QuickView as QuickViewComponent } from "./QuickView";

const Dialog = lazy(() => import("./QuickView").then(module => ({ default: module.QuickView })));

export function QuickView(props: ComponentProps<typeof QuickViewComponent>) {
  if (!props.p) return null;
  return <Suspense fallback={<div className="product-modal-backdrop"><div className="rounded-lg bg-white p-6" role="status">Loading product details... <button className="ml-4 underline" onClick={props.onClose}>Cancel</button></div></div>}>
    <Dialog {...props}/>
  </Suspense>;
}
