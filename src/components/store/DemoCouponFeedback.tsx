import { INVALID_COUPON_MESSAGE } from "@/lib/demo-coupon";

/** Fixed-height demo feedback slot prevents a coupon message from moving the next field. */
export function DemoCouponFeedback({ message }: { message: string }) {
  const invalid = message === INVALID_COUPON_MESSAGE;
  return (
    <div className="flex h-[52px] min-w-0 items-center" data-testid="coupon-feedback-slot">
      {message && (
        <p
          role={invalid ? "alert" : "status"}
          className={`m-0 w-full py-[2.5px] text-[10px] leading-[15px] ${invalid ? "text-red-600" : "text-primary"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
