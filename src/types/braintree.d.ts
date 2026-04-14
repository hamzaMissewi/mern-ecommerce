declare module 'braintree' {
  export interface BraintreeGateway {
    clientToken: {
      generate(
        options: Record<string, unknown>,
        callback: (err: Error | null, response: { clientToken: string }) => void
      ): void;
    };
    transaction: {
      sale(
        request: {
          amount: string;
          paymentMethodNonce: string;
          options: { submitForSettlement: boolean };
        },
        callback: (error: Error | null, result: unknown) => void
      ): void;
    };
  }

  export class BraintreeGateway {
    constructor(config: {
      environment: Environment;
      merchantId: string;
      publicKey: string;
      privateKey: string;
    });
  }

  export interface Environment {
    Sandbox: Environment;
    Production: Environment;
  }

  export const Environment: {
    Sandbox: Environment;
    Production: Environment;
  };
}
