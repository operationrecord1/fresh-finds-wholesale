import { useCallback, useEffect, useRef, useState, useTransition } from "react";

export function useIncrementalProducts(total: number, resultKey: string, batchSize = 24) {
  const [page, setPage] = useState({ key: resultKey, count: batchSize });
  const [pending, startTransition] = useTransition();
  const sentinel = useRef<HTMLDivElement>(null);
  const count = Math.min(total, page.key === resultKey ? page.count : batchSize);
  const hasMore = count < total;
  const loadMore = useCallback(() => {
    startTransition(() => setPage(previous => ({
      key: resultKey,
      count: Math.min(total, (previous.key === resultKey ? previous.count : batchSize) + batchSize),
    })));
  }, [total, resultKey, batchSize]);
  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasMore || pending || typeof IntersectionObserver === "undefined") return;
    let requested = false;
    const observer = new IntersectionObserver(entries => {
      if (!requested && entries.some(entry => entry.isIntersecting)) {
        requested = true;
        observer.disconnect();
        loadMore();
      }
    }, { rootMargin: "400px 0px", threshold: 0 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [count, hasMore, pending, loadMore]);
  return { count, hasMore, pending, sentinel, loadMore };
}
