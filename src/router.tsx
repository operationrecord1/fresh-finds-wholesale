import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    basepath: import.meta.env.BASE_URL,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultPendingMs: 150,
    defaultPendingMinMs: 0,
    defaultPendingComponent: () => <div role="status" aria-label="Loading page" className="mx-auto min-h-[300px] max-w-7xl px-4 py-8"><div aria-hidden="true" className="h-8 w-64 rounded bg-muted"/><div aria-hidden="true" className="mt-6 grid grid-cols-2 gap-5">{[0,1,2,3].map(i=><div key={i} className="h-20 rounded bg-muted"/>)}</div><span className="sr-only">Loading page…</span></div>,
  });

  return router;
};
