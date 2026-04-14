import braintree from 'braintree';
import dotenv from 'dotenv';
import { Response } from 'express';
import { AuthenticatedRequest, PaymentRequestBody } from '../types';

dotenv.config();

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID as string,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY as string,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY as string,
});

export const generateToken = (_req: AuthenticatedRequest, res: Response): void => {
  gateway.clientToken.generate({}, (err: Error | null, response: { clientToken: string }) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(response);
    }
  });
};

export const processPayment = (req: AuthenticatedRequest, res: Response): void => {
  const { paymentMethodNonce, amount } = req.body as PaymentRequestBody;

  gateway.transaction.sale(
    {
      amount,
      paymentMethodNonce,
      options: {
        submitForSettlement: true,
      },
    },
    (error: Error | null, result: unknown) => {
      if (error) {
        res.status(500).json(error);
      } else {
        res.json(result);
      }
    }
  );
};
