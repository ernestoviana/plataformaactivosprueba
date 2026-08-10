type ValidationRisk = "LOW" | "MEDIUM" | "HIGH";

export class ExternalServiceError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "ExternalServiceError";
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function externalValidation(
  amount: number
): Promise<ValidationRisk> {
  await delay(200);

  if (Math.random() < 0.1) {
    throw new ExternalServiceError(500, "External validation service failed");
  }

  if (amount <= 0) {
    throw new ExternalServiceError(404, "Amount cannot be validated");
  }

  if (amount < 1000) {
    return "LOW";
  }

  if (amount <= 5000) {
    return "MEDIUM";
  }

  return "HIGH";
}
