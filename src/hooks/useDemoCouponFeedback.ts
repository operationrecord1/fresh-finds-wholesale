import { useCallback, useEffect, useRef, useState } from "react";
import { isValidDemoCoupon, INVALID_COUPON_MESSAGE, DEMO_COUPON_SUCCESS_MESSAGE } from "@/lib/demo-coupon";

export const COUPON_ERROR_DURATION_MS = 20_000;

/** One applied result and one cancellable timer per coupon field. */
export function useDemoCouponFeedback() {
  const [message, setMessage] = useState("");
  const timer = useRef<number | null>(null);
  const generation = useRef(0);

  const cancelPending = useCallback(() => {
    generation.current += 1;
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => cancelPending, [cancelPending]);

  const applyCoupon = useCallback((code: string) => {
    cancelPending();
    const valid = isValidDemoCoupon(code);
    setMessage(valid ? DEMO_COUPON_SUCCESS_MESSAGE : INVALID_COUPON_MESSAGE);
    if (!valid) {
      const appliedGeneration = generation.current;
      timer.current = window.setTimeout(() => {
        // A cancelled callback already queued by the browser cannot clear a newer result.
        if (generation.current !== appliedGeneration) return;
        timer.current = null;
        setMessage("");
      }, COUPON_ERROR_DURATION_MS);
    }
    return valid;
  }, [cancelPending]);

  return { message, applyCoupon };
}
