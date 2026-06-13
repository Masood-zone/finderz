export function formatGhanaCedi(amount: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPaymentPeriod(period: string) {
  const labels: Record<string, string> = {
    MONTHLY: "Per Month",
    QUARTERLY: "Per Quarter",
    BIANNUALLY: "Biannually",
    YEARLY: "Per Year",
  };

  return labels[period] ?? period;
}

export function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
