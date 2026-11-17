import { INVALID_COUPON_MESSAGE } from "@/lib/demo-coupon";

/** The entire gap is 15px: a 10px text line plus 2.5px above and below. */
export function DemoCouponFeedback({ message }: { message: string }) {
  const invalid = message === INVALID_COUPON_MESSAGE;
  return (
    <div className="box-border flex h-[15px] min-h-[15px] max-h-[15px] min-w-0 items-center overflow-hidden py-[2.5px]" data-testid="coupon-feedback-slot">
      {message && (
        <p
          role={invalid ? "alert" : "status"}
          title={message}
          className={`m-0 w-full truncate text-[10px] leading-[10px] ${invalid ? "text-red-600" : "text-primary"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
