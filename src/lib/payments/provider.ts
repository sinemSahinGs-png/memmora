import { placeholderPaymentProvider } from "./providers/placeholder";
import type { PaymentProvider } from "./types";

export {
  getMissingPaymentEnvKeys,
  PAYMENT_ENV_KEYS,
  PAYMENT_INTEGRATION_CHECKLIST,
} from "./checklist";

export function resolvePaymentProvider(): PaymentProvider {
  // Real providers will be registered here once credentials are provided.
  // Example:
  // if (process.env.MEMOORA_PAYMENT_PROVIDER === "iyzico") return iyzicoProvider;
  return placeholderPaymentProvider;
}
