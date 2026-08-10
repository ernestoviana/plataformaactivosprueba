import { Decimal } from "decimal.js";
import { ExchangeDetailRes, QuoteCreationRes } from "../dtos/dtos.js";
import {
  CalculateQuoteInput,
  CreateQuoteInput,
} from "../models/quotes/quote.schema.js";
import {
  getWalletById,
  getWalletsByUserId,
} from "../models/wallets/wallet.repository.js";
import { getUserById } from "../models/users/user.repository.js";
import {
  createQuote,
  getQuoteByIdDB,
  getQuotesByUserId,
  updateQuote,
} from "../models/quotes/quote.repository.js";
import { CreateExchangeInput } from "../models/exchanges/exchange.schema.js";
import {
  createExchange,
  getExchange,
  getExchangeByIdempotencyKey,
  getPendingExchanges,
  updateExchange,
} from "../models/exchanges/exchange.repository.js";
import { externalValidation } from "../mock/mock.service.js";
import { db } from "../db/db.js";
import { createHash, randomUUID } from "node:crypto";
import { MovementCreationInput } from "../models/movements/movement.schema.js";
import { getMovementsByExchangeId } from "../models/movements/movement.repository.js";
import { success } from "zod";
const FEEPERCENTAGE = 0.01;
const QUOTELIFETIME = 30 * 1000;
const CURRENTEXCHANGEVALUE = 2500;
Decimal.set({
  rounding: Decimal.ROUND_HALF_DOWN,
});

export async function getQuoteById(id: string, userId: string) {
  const user = await getUserById(userId);
  if (!user) {
    return undefined;
  }
  const quotes = await getQuotesByUserId(user?.id!);
  const quote = quotes.find((q) => q.id === id);
  if (quote && quote.status === "ACTIVE") {
    // validate expiryDate
    const now = Date.now();
    const expiryDate = new Date(quote.expiry_date).getTime();
    if (now > expiryDate) {
      await updateQuote(id, { status: "EXPIRED" });
      quote.status = "EXPIRED";
    }
  }
  return quote;
}

export async function getUserQuotes(userId: string) {
  const user = await getUserById(userId);
  const quotes = await getQuotesByUserId(user?.id!);
  quotes.forEach(async (q) => {
    const now = Date.now();
    const expiryDate = new Date(q.expiry_date).getTime();
    if (now > expiryDate && q.status === "ACTIVE") {
      await updateQuote(q.id, { status: "EXPIRED" });
      q.status = "EXPIRED";
    }
  });
  return quotes;
}

export async function getExchangeDetail(
  id: string,
  userId: string
): Promise<ExchangeDetailRes> {
  const exchange = await getExchange(id);
  if (!exchange) {
    return {
      success: false,
      error_message: "Exchange not found",
    };
  }
  const quote = await getQuoteById(exchange.quote_id, userId);
  if (!quote) {
    return {
      success: false,
      error_message: "Quote not found",
    };
  }
  const movements = await getMovementsByExchangeId(exchange.id);
  const sourceWallet = await getWalletById(quote.wallet_source_id);
  const destinationWallet = await getWalletById(quote.wallet_destination_id);
  const movementsMapped = movements.map((m) => {
    return {
      type: m.type.toString(),
      amount: m.amount,
      current_balance: m.current_balance,
      new_balance: m.new_balance,
      balance_change: new Decimal(m.new_balance)
        .sub(m.current_balance)
        .toString(),
      date: m.execution_date,
    };
  });
  return {
    success: true,
    data: {
      id: exchange.id,
      idempotency_key: exchange.idempotency_key,
      status: exchange.status,
      requires_followup: exchange.requires_followup,
      quote: quote,
      movements: movementsMapped,
      wallet_source: sourceWallet!,
      wallet_destination: destinationWallet!,
    },
  };
}

export async function getExchangesPending() {
  const exchanges = await getPendingExchanges();
  return {
    success: true,
    data: exchanges,
  };
}

export async function calculateQuote(
  quoteData: CalculateQuoteInput,
  userId: string
): Promise<QuoteCreationRes> {
  const user = await getUserById(userId);
  if (!user) {
    return {
      success: false,
      error_message: "User not found",
    };
  }
  const userWallets = await getWalletsByUserId(user?.id);
  if (quoteData.asset_quote_type === "XAUT_USDT") {
    const walletSource = userWallets.find((w) => w.type === "XAUT");
    const walletDestination = userWallets.find((w) => w.type === "USDT");
    if (!walletSource || !walletDestination) {
      return {
        success: false,
        error_message: "Insufficient funds",
      };
    }
    const walletSourceBalanceValue = new Decimal(walletSource.current_balance);
    const amountToTransferValue = new Decimal(quoteData.amount_to_transfer);
    if (walletSourceBalanceValue.lt(amountToTransferValue)) {
      return {
        success: false,
        error_message: "Insufficient funds",
      };
    }
    const feeXAUT = amountToTransferValue.mul(FEEPERCENTAGE);
    const feeUSDT = feeXAUT.mul(CURRENTEXCHANGEVALUE);
    const sourceValue = amountToTransferValue.sub(feeXAUT);
    const destinationValue = sourceValue.mul(CURRENTEXCHANGEVALUE);
    const now = new Date();
    const expiryDate = new Date(now.getTime() + QUOTELIFETIME);
    const quoteCreateData: CreateQuoteInput = {
      user_id: user.id,
      wallet_source_id: walletSource.id,
      wallet_destination_id: walletDestination.id,
      source_value: sourceValue.toString(),
      destination_value: destinationValue.toString(),
      creation_date: now.toISOString(),
      expiry_date: expiryDate.toISOString(),
      fee: feeUSDT.toString(),
    };

    const quote = await createQuote(quoteCreateData);
    if (!quote) {
      return {
        success: false,
        error_message: "Failed to create quote",
      };
    }
    return {
      data: {
        id: quote?.id,
        wallet_destination: walletDestination,
        wallet_source: walletSource,
        creation_date: quote?.creation_date,
        expiry_date: quote?.expiry_date,
        destination_value: quote?.destination_value,
        source_value: quote?.source_value,
        status: quote?.status,
        fee: quote?.fee,
      },
      success: true,
    };
  } else if (quoteData.asset_quote_type === "USDT_XAUT") {
    const walletSource = userWallets.find((w) => w.type === "USDT");
    const walletDestination = userWallets.find((w) => w.type === "XAUT");
    if (!walletSource || !walletDestination) {
      return {
        success: false,
        error_message: "Insufficient funds",
      };
    }
    const walletSourceBalanceValue = new Decimal(walletSource.current_balance);
    const amountToTransferValue = new Decimal(quoteData.amount_to_transfer);
    if (walletSourceBalanceValue.lt(amountToTransferValue)) {
      return {
        success: false,
        error_message: "Insufficient funds",
      };
    }
    const fee = amountToTransferValue.mul(FEEPERCENTAGE);
    const sourceValue = amountToTransferValue.sub(fee);
    const destinationValue = sourceValue.div(CURRENTEXCHANGEVALUE);
    const now = new Date();
    const expiryDate = new Date(now.getTime() + QUOTELIFETIME);
    const quoteCreateData: CreateQuoteInput = {
      user_id: user.id,
      wallet_source_id: walletSource.id,
      wallet_destination_id: walletDestination.id,
      source_value: sourceValue.toString(),
      destination_value: destinationValue.toString(),
      creation_date: now.toISOString(),
      expiry_date: expiryDate.toISOString(),
      fee: fee.toString(),
    };
    const quote = await createQuote(quoteCreateData);
    if (!quote) {
      return {
        success: false,
        error_message: "Failed to create quote",
      };
    }
    return {
      data: {
        id: quote?.id,
        wallet_destination: walletDestination,
        wallet_source: walletSource,
        creation_date: quote?.creation_date,
        expiry_date: quote?.expiry_date,
        destination_value: quote?.destination_value,
        source_value: quote?.source_value,
        status: quote?.status,
        fee: quote?.fee,
      },
      success: true,
    };
  } else {
    return {
      success: false,
      error_message: "Asset type not supported",
    };
  }
}

export async function executeExchange(
  exchangeData: CreateExchangeInput,
  userId: string,
  idempotencyKey: string
) {
  const user = await getUserById(userId);
  if (!user) {
    return {
      success: false,
      error_message: "User not found",
      data: undefined,
    };
  }
  const possibleExchange = await getExchangeByIdempotencyKey(idempotencyKey);
  if (possibleExchange) {
    if (possibleExchange.quote_id !== exchangeData.quote_id) {
      return {
        success: false,
        error_message: "Conflict",
        data: undefined,
      };
    } else {
      return {
        success: true,
        data: {
          id: possibleExchange.id,
          quote_id: possibleExchange.quote_id,
          idempotency_key: possibleExchange.idempotency_key,
          requires_followup: possibleExchange.requires_followup,
          status: possibleExchange.status,
        },
      };
    }
  }
  const quote = await getQuoteById(exchangeData.quote_id, userId);
  const createdExchange = await createExchange({
    quote_id: exchangeData.quote_id,
    idempotency_key: idempotencyKey,
  });
  if (!createdExchange) {
    return {
      success: false,
      error_message: "Failed to create exchange",
      data: undefined,
    };
  }
  if (!quote) {
    await updateExchange(createdExchange.id, {
      status: "FAILED",
      requires_followup: false,
    });
    return {
      success: false,
      error_message: "Quote not found",
      data: undefined,
    };
  }
  if (quote.status === "EXPIRED") {
    await updateExchange(createdExchange.id, {
      status: "FAILED",
      requires_followup: false,
    });
    return {
      success: false,
      error_message: "Quote has expired",
      data: undefined,
    };
  }
  if (quote.status === "USED") {
    await updateExchange(createdExchange.id, {
      status: "FAILED",
      requires_followup: false,
    });
    return {
      success: false,
      error_message: "Quote has already been used",
      data: undefined,
    };
  }
  updateExchange(createdExchange.id, {
    requires_followup: false,
    status: "PROCESSING",
  });

  const sourceAmount = Decimal(quote.source_value);
  try {
    const validationResult = await externalValidation(sourceAmount.toNumber());
    if (validationResult === "LOW" || validationResult === "MEDIUM") {
      const transactionResult = await db.transaction().execute(async (trx) => {
        const walletSource = await trx
          .selectFrom("wallets")
          .selectAll()
          .where("id", "=", quote.wallet_source_id)
          .executeTakeFirst();
        const walletDestination = await trx
          .selectFrom("wallets")
          .selectAll()
          .where("id", "=", quote.wallet_destination_id)
          .executeTakeFirst();
        if (!walletSource || !walletDestination) {
          await updateExchange(createdExchange.id, {
            status: "FAILED",
            requires_followup: false,
          });
          return {
            success: false,
            error_message: "Wallet not found",
            data: undefined,
          };
        }

        const ledgerSource = await trx
          .selectFrom("ledger")
          .selectAll()
          .where("wallet_id", "=", walletSource.id)
          .executeTakeFirst();
        const ledgerDestination = await trx
          .selectFrom("ledger")
          .selectAll()
          .where("wallet_id", "=", walletDestination.id)
          .executeTakeFirst();
        if (!ledgerSource || !ledgerDestination) {
          await updateExchange(createdExchange.id, {
            status: "FAILED",
            requires_followup: false,
          });
          return {
            success: false,
            error_message: "Ledger not found",
            data: undefined,
          };
        }

        const previousMovementSource = await trx
          .selectFrom("movements")
          .selectAll()
          .where("wallet_id", "=", walletSource.id)
          .orderBy("sequence", "desc")
          .limit(1)
          .executeTakeFirst();

        const previousMovementDestination = await trx
          .selectFrom("movements")
          .selectAll()
          .where("wallet_id", "=", walletDestination.id)
          .orderBy("sequence", "desc")
          .limit(1)
          .executeTakeFirst();

        const sourceSequence = previousMovementSource
          ? previousMovementSource.sequence + 1
          : 1;

        const destinationSequence = previousMovementDestination
          ? previousMovementDestination.sequence + 1
          : 1;

        const sourceBalance = calculateBalances(
          walletSource.current_balance,
          quote.source_value,
          "DEBIT",
          quote.fee
        );
        const destinationBalance = calculateBalances(
          walletDestination.current_balance,
          quote.destination_value,
          "CREDIT"
        );

        const previousHashSource = previousMovementSource
          ? previousMovementSource.hash
          : null;

        const previousHashDestination = previousMovementDestination
          ? previousMovementDestination.hash
          : null;

        const payloadSource = JSON.stringify({
          ledgerId: ledgerSource.id,
          walletId: walletSource.id,
          sequence: sourceSequence,
          type: "DEBIT",
          amount: sourceBalance.totalSum,
          currentBalance: sourceBalance.currentBalance,
          newBalance: sourceBalance.newBalance,
          previousHash: previousHashSource,
        });

        const payloadDestination = JSON.stringify({
          ledgerId: ledgerDestination.id,
          walletId: walletDestination.id,
          sequence: destinationSequence,
          type: "CREDIT",
          amount: destinationBalance.totalSum,
          currentBalance: destinationBalance.currentBalance,
          newBalance: destinationBalance.newBalance,
          previousHash: previousHashDestination,
        });

        const hashSource = createHashFromData(payloadSource);
        const hashDestination = createHashFromData(payloadDestination);

        const movementSource: MovementCreationInput = {
          id: randomUUID(),
          ledger_id: ledgerSource.id,
          wallet_id: walletSource.id,
          exchange_id: createdExchange.id,
          type: "DEBIT",
          amount: sourceBalance.totalSum,
          current_balance: sourceBalance.currentBalance,
          new_balance: sourceBalance.newBalance,
          sequence: sourceSequence,
          previous_hash: previousHashSource,
          hash: hashSource,
          execution_date: new Date().toISOString(),
        };
        const movementDestination: MovementCreationInput = {
          id: randomUUID(),
          ledger_id: ledgerDestination.id,
          wallet_id: walletDestination.id,
          exchange_id: createdExchange.id,
          type: "CREDIT",
          amount: destinationBalance.totalSum,
          current_balance: destinationBalance.currentBalance,
          new_balance: destinationBalance.newBalance,
          sequence: destinationSequence,
          previous_hash: previousHashDestination,
          hash: hashDestination,
          execution_date: new Date().toISOString(),
        };

        await trx
          .insertInto("movements")
          .values({
            id: movementSource.id,
            ledger_id: movementSource.ledger_id,
            wallet_id: movementSource.wallet_id,
            exchange_id: movementSource.exchange_id,
            type: movementSource.type,
            amount: movementSource.amount,
            current_balance: movementSource.current_balance,
            new_balance: movementSource.new_balance,
            sequence: movementSource.sequence,
            previous_hash: movementSource.previous_hash || "",
            hash: movementSource.hash,
            execution_date: movementSource.execution_date,
          })
          .execute();

        await trx
          .insertInto("movements")
          .values({
            id: movementDestination.id,
            ledger_id: movementDestination.ledger_id,
            wallet_id: movementDestination.wallet_id,
            exchange_id: movementDestination.exchange_id,
            type: movementDestination.type,
            amount: movementDestination.amount,
            current_balance: movementDestination.current_balance,
            new_balance: movementDestination.new_balance,
            sequence: movementDestination.sequence,
            previous_hash: movementDestination.previous_hash || "",
            hash: movementDestination.hash,
            execution_date: movementDestination.execution_date,
          })
          .execute();

        await trx
          .updateTable("wallets")
          .set({
            current_balance: sourceBalance.newBalance,
            total_balance: calculateTotalSum(
              sourceBalance.newBalance,
              walletSource.withheld_balance
            ),
          })
          .where("id", "=", walletSource.id)
          .execute();
        await trx
          .updateTable("wallets")
          .set({
            current_balance: destinationBalance.newBalance,
            total_balance: calculateTotalSum(
              destinationBalance.newBalance,
              walletDestination.withheld_balance
            ),
          })
          .where("id", "=", walletDestination.id)
          .execute();

        await updateExchange(createdExchange.id, {
          status: "COMPLETED",
          requires_followup: validationResult === "MEDIUM",
        });
        await updateQuote(quote.id, { status: "USED" });

        return {
          success: true,
          data: {
            id: createdExchange.id,
            quote_id: createdExchange.quote_id,
            idempotency_key: createdExchange.idempotency_key,
            requires_followup: validationResult === "MEDIUM",
            status: "COMPLETED",
          },
        };
      });

      return transactionResult;
    } else if (validationResult === "HIGH") {
      const transactionResult = await db.transaction().execute(async (trx) => {
        const walletSource = await trx
          .selectFrom("wallets")
          .selectAll()
          .where("id", "=", quote.wallet_source_id)
          .executeTakeFirst();
        if (!walletSource) {
          return {
            success: false,
            error_message: "Wallet not found",
            data: undefined,
          };
        }
        const newWithheld = calculateTotalSum(quote.source_value, quote.fee);
        const newWithheldDecimal = new Decimal(newWithheld);
        const currentBalance = new Decimal(walletSource.current_balance);
        const newBalance = currentBalance.sub(newWithheldDecimal);
        if (newWithheldDecimal.gt(currentBalance)) {
          await updateExchange(createdExchange.id, {
            status: "FAILED",
            requires_followup: false,
          });
          await updateQuote(quote.id, { status: "USED" });
          return {
            success: false,
            error_message: "Insufficient funds",
            data: undefined,
          };
        } else {
          await trx
            .updateTable("wallets")
            .set({
              withheld_balance: newWithheld,
              current_balance: newBalance.toString(),
            })
            .where("id", "=", walletSource.id)
            .execute();
          await updateExchange(createdExchange.id, {
            status: "PENDING_REVIEW",
            requires_followup: false,
          });
          await updateQuote(quote.id, { status: "USED" });
          return {
            success: true,
            data: {
              id: createdExchange.id,
              quote_id: createdExchange.quote_id,
              idempotency_key: createdExchange.idempotency_key,
              requires_followup: false,
              status: "PENDING_REVIEW",
            },
          };
        }
      });

      return transactionResult;
    }
  } catch (error) {
    await updateExchange(createdExchange.id, {
      status: "FAILED",
      requires_followup: false,
    });
    return {
      success: false,
      error_message: "External validation service failed",
      data: undefined,
    };
  }
}

export async function approveExchange(exchangeId: string) {
  const exchange = await getExchange(exchangeId);
  if (!exchange) {
    return {
      success: false,
      error_message: "Exchange not found",
      data: undefined,
    };
  }
  if (exchange.status !== "PENDING_REVIEW") {
    return {
      success: false,
      error_message: "Exchange not in pending review",
      data: exchange,
    };
  }
  const quote = await getQuoteByIdDB(exchange.quote_id);
  if (!quote) {
    return {
      success: false,
      error_message: "Quote not found",
      data: undefined,
    };
  }
  const transactionResult = await db.transaction().execute(async (trx) => {
    const walletSource = await trx
      .selectFrom("wallets")
      .selectAll()
      .where("id", "=", quote.wallet_source_id)
      .executeTakeFirst();
    const walletDestination = await trx
      .selectFrom("wallets")
      .selectAll()
      .where("id", "=", quote.wallet_destination_id)
      .executeTakeFirst();
    if (!walletSource || !walletDestination) {
      await updateExchange(exchange.id, {
        status: "FAILED",
        requires_followup: false,
      });
      return {
        success: false,
        error_message: "Wallet not found",
        data: undefined,
      };
    }

    const ledgerSource = await trx
      .selectFrom("ledger")
      .selectAll()
      .where("wallet_id", "=", walletSource.id)
      .executeTakeFirst();
    const ledgerDestination = await trx
      .selectFrom("ledger")
      .selectAll()
      .where("wallet_id", "=", walletDestination.id)
      .executeTakeFirst();
    if (!ledgerSource || !ledgerDestination) {
      await updateExchange(exchange.id, {
        status: "FAILED",
        requires_followup: false,
      });
      return {
        success: false,
        error_message: "Ledger not found",
        data: undefined,
      };
    }

    const previousMovementSource = await trx
      .selectFrom("movements")
      .selectAll()
      .where("wallet_id", "=", walletSource.id)
      .orderBy("sequence", "desc")
      .limit(1)
      .executeTakeFirst();

    const previousMovementDestination = await trx
      .selectFrom("movements")
      .selectAll()
      .where("wallet_id", "=", walletDestination.id)
      .orderBy("sequence", "desc")
      .limit(1)
      .executeTakeFirst();

    const sourceSequence = previousMovementSource
      ? previousMovementSource.sequence + 1
      : 1;

    const destinationSequence = previousMovementDestination
      ? previousMovementDestination.sequence + 1
      : 1;

    const sourceBalance = calculateBalances(
      walletSource.total_balance,
      quote.source_value,
      "DEBIT",
      quote.fee
    );
    const destinationBalance = calculateBalances(
      walletDestination.current_balance,
      quote.destination_value,
      "CREDIT"
    );

    const previousHashSource = previousMovementSource
      ? previousMovementSource.hash
      : null;

    const previousHashDestination = previousMovementDestination
      ? previousMovementDestination.hash
      : null;

    const payloadSource = JSON.stringify({
      ledgerId: ledgerSource.id,
      walletId: walletSource.id,
      sequence: sourceSequence,
      type: "DEBIT",
      amount: sourceBalance.totalSum,
      currentBalance: sourceBalance.currentBalance,
      newBalance: sourceBalance.newBalance,
      previousHash: previousHashSource,
    });

    const payloadDestination = JSON.stringify({
      ledgerId: ledgerDestination.id,
      walletId: walletDestination.id,
      sequence: destinationSequence,
      type: "CREDIT",
      amount: destinationBalance.totalSum,
      currentBalance: destinationBalance.currentBalance,
      newBalance: destinationBalance.newBalance,
      previousHash: previousHashDestination,
    });

    const hashSource = createHashFromData(payloadSource);
    const hashDestination = createHashFromData(payloadDestination);

    const movementSource: MovementCreationInput = {
      id: randomUUID(),
      ledger_id: ledgerSource.id,
      wallet_id: walletSource.id,
      exchange_id: exchange.id,
      type: "DEBIT",
      amount: sourceBalance.totalSum,
      current_balance: sourceBalance.currentBalance,
      new_balance: sourceBalance.newBalance,
      sequence: sourceSequence,
      previous_hash: previousHashSource,
      hash: hashSource,
      execution_date: new Date().toISOString(),
    };
    const movementDestination: MovementCreationInput = {
      id: randomUUID(),
      ledger_id: ledgerDestination.id,
      wallet_id: walletDestination.id,
      exchange_id: exchange.id,
      type: "CREDIT",
      amount: destinationBalance.totalSum,
      current_balance: destinationBalance.currentBalance,
      new_balance: destinationBalance.newBalance,
      sequence: destinationSequence,
      previous_hash: previousHashDestination,
      hash: hashDestination,
      execution_date: new Date().toISOString(),
    };

    await trx
      .insertInto("movements")
      .values({
        id: movementSource.id,
        ledger_id: movementSource.ledger_id,
        wallet_id: movementSource.wallet_id,
        exchange_id: movementSource.exchange_id,
        type: movementSource.type,
        amount: movementSource.amount,
        current_balance: movementSource.current_balance,
        new_balance: movementSource.new_balance,
        sequence: movementSource.sequence,
        previous_hash: movementSource.previous_hash || "",
        hash: movementSource.hash,
        execution_date: movementSource.execution_date,
      })
      .execute();

    await trx
      .insertInto("movements")
      .values({
        id: movementDestination.id,
        ledger_id: movementDestination.ledger_id,
        wallet_id: movementDestination.wallet_id,
        exchange_id: movementDestination.exchange_id,
        type: movementDestination.type,
        amount: movementDestination.amount,
        current_balance: movementDestination.current_balance,
        new_balance: movementDestination.new_balance,
        sequence: movementDestination.sequence,
        previous_hash: movementDestination.previous_hash || "",
        hash: movementDestination.hash,
        execution_date: movementDestination.execution_date,
      })
      .execute();

    const sourceWithheld = walletSource.withheld_balance;
    const sourceWithheldDecimal = new Decimal(sourceWithheld);
    const newWithheld = sourceWithheldDecimal
      .sub(new Decimal(quote.source_value))
      .sub(new Decimal(quote.fee))
      .toString();
    await trx
      .updateTable("wallets")
      .set({
        current_balance: sourceBalance.newBalance,
        total_balance: calculateTotalSum(sourceBalance.newBalance, newWithheld),
        withheld_balance: newWithheld,
      })
      .where("id", "=", walletSource.id)
      .execute();
    await trx
      .updateTable("wallets")
      .set({
        current_balance: destinationBalance.newBalance,
        total_balance: calculateTotalSum(
          destinationBalance.newBalance,
          walletDestination.withheld_balance
        ),
      })
      .where("id", "=", walletDestination.id)
      .execute();

    await updateExchange(exchange.id, {
      status: "COMPLETED",
      requires_followup: exchange.requires_followup,
    });
    await updateQuote(quote.id, { status: "USED" });

    return {
      success: true,
      data: {
        id: exchange.id,
        quote_id: exchange.quote_id,
        idempotency_key: exchange.idempotency_key,
        requires_followup: exchange.requires_followup,
        status: "COMPLETED",
      },
    };
  });

  return transactionResult;
}

export async function rejectExchange(exchangeId: string) {
  const exchange = await getExchange(exchangeId);
  if (!exchange) {
    return {
      success: false,
      error_message: "Exchange not found",
      data: undefined,
    };
  }
  if (exchange.status !== "PENDING_REVIEW") {
    return {
      success: false,
      error_message: "Exchange not in pending review",
      data: exchange,
    };
  }
  const quote = await getQuoteByIdDB(exchange.quote_id);
  if (!quote) {
    return {
      success: false,
      error_message: "Quote not found",
      data: undefined,
    };
  }
  const transactionResult = await db.transaction().execute(async (trx) => {
    const walletSource = await trx
      .selectFrom("wallets")
      .selectAll()
      .where("id", "=", quote.wallet_source_id)
      .executeTakeFirst();
    if (!walletSource) {
      return {
        success: false,
        error_message: "Wallet not found",
        data: undefined,
      };
    }
    const withHeldDecimal = new Decimal(walletSource.withheld_balance);
    const newWithheld = withHeldDecimal
      .sub(new Decimal(quote.source_value))
      .sub(new Decimal(quote.fee))
      .toString();
    const currentBalance = new Decimal(walletSource.current_balance);
    const newBalance = currentBalance.add(withHeldDecimal);
    const totalBalance = newBalance.add(new Decimal(newWithheld));

    await trx
      .updateTable("wallets")
      .set({
        withheld_balance: newWithheld,
        current_balance: newBalance.toString(),
        total_balance: totalBalance.toString(),
      })
      .where("id", "=", walletSource.id)
      .execute();
    await updateExchange(exchange.id, {
      status: "REJECTED",
      requires_followup: false,
    });
    await updateQuote(quote.id, { status: "USED" });
    return {
      success: true,
      data: {
        id: exchange.id,
        quote_id: exchange.quote_id,
        idempotency_key: exchange.idempotency_key,
        requires_followup: exchange.requires_followup,
        status: "REJECTED",
      },
    };
  });

  return transactionResult;
}

function calculateBalances(
  current_balance: string,
  amount: string,
  type: "DEBIT" | "CREDIT",
  fee?: string
) {
  const currentBalance = new Decimal(current_balance);
  const amountDecimal = new Decimal(amount);
  const feeDecimal = fee ? new Decimal(fee) : new Decimal(0);
  if (type === "DEBIT") {
    return {
      currentBalance: currentBalance.toString(),
      newBalance: currentBalance.sub(amountDecimal).sub(feeDecimal).toString(),
      totalSum: amountDecimal.add(feeDecimal).toString(),
    };
  } else {
    return {
      currentBalance: currentBalance.toString(),
      newBalance: currentBalance.add(amountDecimal).toString(),
      totalSum: amountDecimal.add(feeDecimal).toString(),
    };
  }
}

function calculateTotalSum(firstNumber: string, secondNumber: string) {
  const newBalanceDecimal = new Decimal(firstNumber);
  const withHeldDecimal = new Decimal(secondNumber);
  return newBalanceDecimal.add(withHeldDecimal).toString();
}

function createHashFromData(val: string) {
  return createHash("sha256").update(val).digest("hex");
}
