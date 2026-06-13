import { AppText } from "./app-text";
import { colors } from "./design-system";

export function FormError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <AppText variant="caption" style={{ color: colors.error }} className="mt-1">
      {message}
    </AppText>
  );
}
