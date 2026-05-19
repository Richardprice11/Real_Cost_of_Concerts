import { AlertCircle, CheckCircle2 } from "lucide-react";

type AlertBannerProps = {
  type: "error" | "success";
  message: string;
};

export function AlertBanner({ type, message }: AlertBannerProps) {
  const isError = type === "error";
  return (
    <div
      role="alert"
      className={`alert text-sm ${isError ? "alert-error" : "alert-success"}`}
    >
      {isError ? (
        <AlertCircle className="h-5 w-5 shrink-0" aria-hidden />
      ) : (
        <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />
      )}
      <span>{message}</span>
    </div>
  );
}
