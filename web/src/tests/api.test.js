const request = require("supertest");
const express = require("express");
const router = require("../routes/api");

jest.mock("../services/stripe");
jest.mock("../services/jobs");
jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: jest
        .fn()
        .mockReturnValue({
          type: "checkout.session.completed",
          data: { object: {} },
          id: "evt_test",
        }),
    },
  }));
});

const stripe = require("stripe");
const stripeEventHandlers = require("../services/stripe");
const {
  findJobAssignRoleByDiscordId,
  updateJobStatusById,
  getAllJobsToDo,
} = require("../services/jobs");

const app = express();

// Support raw body for Stripe Webhook
app.use("/api", (req, res, next) => {
  if (req.originalUrl === "/api/payment/webhook") {
    express.raw({ type: "application/json" })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

app.use("/api", router);

describe("API routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /payment/webhook", () => {
    it("should handle a valid stripe webhook", async () => {
      const fakeEvent = { type: "checkout.session.completed" };
      const rawBody = Buffer.from(JSON.stringify(fakeEvent));

      stripe().webhooks.constructEvent.mockReturnValue(fakeEvent);
      stripeEventHandlers.mockResolvedValue();

      await request(app)
        .post("/api/payment/webhook")
        .set("stripe-signature", "test_signature")
        .send(rawBody)
        .expect(200);
    });

    it("should return 400 if stripe signature is empty", async () => {
      stripe().webhooks.constructEvent.mockImplementation(() => {
        throw new Error("Empty signature");
      });

      await request(app)
        .post("/api/payment/webhook")
        .set("stripe-signature", "")
        .send(Buffer.from(JSON.stringify({})))
        .expect(400);
    });

    it("should return 500 if handler throws", async () => {
      const fakeEvent = { type: "checkout.session.completed" };
      stripe().webhooks.constructEvent.mockReturnValue(fakeEvent);
      stripeEventHandlers.mockRejectedValue(new Error("Handler failed"));

      await request(app)
        .post("/api/payment/webhook")
        .set("stripe-signature", "test_signature")
        .send(Buffer.from(JSON.stringify(fakeEvent)))
        .expect(500);
    });
  });

  describe("GET /join", () => {
    it("should return 400 without discordId", async () => {
      await request(app).get("/api/join").expect(400);
    });

    it("should return 204 if no job is found", async () => {
      findJobAssignRoleByDiscordId.mockResolvedValue(null);
      await request(app).get("/api/join?discordId=123").expect(204);
    });

    it("should return job info if found", async () => {
      findJobAssignRoleByDiscordId.mockResolvedValue({
        id: 1,
        type: "assign_role",
        role: "VIP",
      });
      updateJobStatusById.mockResolvedValue();

      const res = await request(app).get("/api/join?discordId=123").expect(200);

      expect(res.body).toEqual({ type: "assign_role", role: "VIP" });
    });
  });

  describe("GET /jobs", () => {
    it("should update job status and return jobs", async () => {
      getAllJobsToDo.mockResolvedValue([
        { id: 1, type: "remove_role" },
        { id: 2, type: "assign_role" },
      ]);
      updateJobStatusById.mockResolvedValue();

      const res = await request(app).get("/api/jobs").expect(200);
      expect(res.body.length).toBe(2);
    });
  });

  describe("POST /done", () => {
    it("should return 400 without jobId", async () => {
      await request(app).post("/api/done").expect(400);
    });

    it("should mark job as done", async () => {
      updateJobStatusById.mockResolvedValue();

      const res = await request(app).post("/api/done?jobId=1").expect(200);

      expect(res.body).toEqual({ statut: "done" });
    });
  });
});
