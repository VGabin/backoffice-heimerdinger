// tests/stripe.test.js
const stripeEventHandlers = require("../services/stripe");
const payments = require("../services/payments");
const jobs = require("../services/jobs");
const { getRoleFromAmount } = require("../utils/data");

jest.mock("../services/payments");
jest.mock("../services/jobs");
jest.mock("../utils/data");

describe("stripeEventHandlers", () => {
  const commonFields = {
    id: "evt_test",
    created: Math.floor(Date.now() / 1000),
    description: "discordUser123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const baseExpectSave = (type, status, amount) => {
    expect(payments.savePayment).toHaveBeenCalledWith(
      type,
      "evt_test",
      expect.any(String),
      "discordUser123",
      amount,
      expect.any(Date),
      status
    );
  };

  it("gère checkout.session.completed", async () => {
    const event = {
      type: "checkout.session.completed",
      id: "evt_test",
      data: {
        object: {
          ...commonFields,
          id: "pi_123",
          amount_total: 1099,
          payment_status: "paid",
        },
      },
    };

    getRoleFromAmount.mockReturnValue("VIP");

    await stripeEventHandlers(event);

    baseExpectSave("checkout.session.completed", "paid", 10.99);
    expect(jobs.createJob).toHaveBeenCalledTimes(2);
    expect(jobs.createJob).toHaveBeenNthCalledWith(
      1,
      "assign_role",
      "pending",
      expect.any(Date),
      "discordUser123",
      "VIP",
      "evt_test",
      "pi_123"
    );
    expect(jobs.createJob).toHaveBeenNthCalledWith(
      2,
      "remove_role",
      "scheduled",
      expect.any(Date),
      "discordUser123",
      "VIP",
      "evt_test",
      "pi_123"
    );
  });

  it("gère invoice.paid", async () => {
    const event = {
      type: "invoice.paid",
      id: "evt_test",
      data: {
        object: {
          ...commonFields,
          id: "inv_456",
          amount_paid: 2199,
          payment_status: "paid",
        },
      },
    };

    getRoleFromAmount.mockReturnValue("PREMIUM");

    await stripeEventHandlers(event);

    baseExpectSave("invoice.paid", "paid", 21.99);
    expect(jobs.createJob).toHaveBeenCalledTimes(2);
  });

  it("gère payment_intent.succeeded", async () => {
    const event = {
      type: "payment_intent.succeeded",
      id: "evt_test",
      data: {
        object: {
          ...commonFields,
          id: "pi_789",
          amount_received: 599,
          payment_status: "paid",
        },
      },
    };

    getRoleFromAmount.mockReturnValue("BASIC");

    await stripeEventHandlers(event);

    baseExpectSave("payment_intent.succeeded", "paid", 5.99);
    expect(jobs.createJob).toHaveBeenCalledTimes(2);
  });

  const errorTypes = [
    { type: "invoice.payment_failed", expectedStatus: "failed" },
    { type: "customer.subscription.deleted", expectedStatus: "failed" },
    { type: "charge.refunded", expectedStatus: "failed" },
    { type: "charge.dispute.created", expectedStatus: "failed" },
  ];

  errorTypes.forEach(({ type, expectedStatus }) => {
    it(`gère ${type}`, async () => {
      const event = {
        type,
        id: "evt_test",
        data: {
          object: {
            ...commonFields,
            id: "id_000X",
            payment_status: expectedStatus,
          },
        },
      };

      await stripeEventHandlers(event);

      baseExpectSave(type, expectedStatus, 0);
      expect(jobs.updateJobByDiscordId).toHaveBeenCalledWith(
        "discordUser123",
        expect.any(Date)
      );
    });
  });

  it("capture et log une erreur si savePayment échoue", async () => {
    const error = new Error("DB down");
    payments.savePayment.mockRejectedValueOnce(error);

    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    const event = {
      type: "checkout.session.completed",
      id: "evt_test",
      data: {
        object: {
          ...commonFields,
          id: "pi_error",
          amount_total: 999,
          payment_status: "paid",
        },
      },
    };

    getRoleFromAmount.mockReturnValue("ERROR");

    await stripeEventHandlers(event);

    expect(console.error).toHaveBeenCalledWith(error);
    spy.mockRestore();
  });

  it("capture et log une erreur si updateJobByDiscordId échoue", async () => {
    const error = new Error("DB update fail");
    jobs.updateJobByDiscordId.mockRejectedValueOnce(error);

    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    const event = {
      type: "invoice.payment_failed",
      id: "evt_test",
      data: {
        object: {
          ...commonFields,
          id: "inv_fail",
          payment_status: "failed",
        },
      },
    };

    await stripeEventHandlers(event);

    expect(console.error).toHaveBeenCalledWith(error);
    spy.mockRestore();
  });
});
