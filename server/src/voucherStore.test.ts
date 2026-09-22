import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFileStore } from "./db/fileStore.js";
import type { Database } from "./db/index.js";
import {
  checkVoucherForRegistration,
  createVoucher,
  getVoucher,
  initVoucherStore,
  isVoucherExpired,
  listVouchers,
  markVoucherRegistered,
  revokeVoucher,
  toPublicVoucher,
} from "./voucherStore.js";
import { VOUCHER_VALIDITY_MS, type Voucher } from "./voucherSchema.js";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "voucherstore-test-"));
  const db: Database = {
    createStore: async (collectionName, idField) => createFileStore(dir, collectionName, idField),
    close: async () => {},
  };
  await initVoucherStore(db);
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("createVoucher", () => {
  it("starts pending, lowercases the email, and expires exactly a year from issuance for a student", async () => {
    const before = Date.now();
    const voucher = await createVoucher({ email: "A@Example.com", name: "Alex", role: "student" });
    const after = Date.now();

    expect(voucher.email).toBe("a@example.com");
    expect(voucher.status).toBe("pending");
    expect(voucher.issuedAt).toBeGreaterThanOrEqual(before);
    expect(voucher.issuedAt).toBeLessThanOrEqual(after);
    expect(voucher.expiresAt).toBeDefined();
    expect(voucher.expiresAt! - voucher.issuedAt).toBe(VOUCHER_VALIDITY_MS);
  });

  it.each(["admin", "super_admin"] as const)("never expires for a %s voucher", async (role) => {
    const voucher = await createVoucher({ email: "a@b.com", name: "A", role });
    expect(voucher.expiresAt).toBeUndefined();
  });

  it("persists so a later getVoucher finds it", async () => {
    const voucher = await createVoucher({ email: "a@b.com", name: "A", role: "admin" });
    expect(await getVoucher(voucher.voucherId)).toEqual(voucher);
  });
});

describe("listVouchers", () => {
  it("returns every issued voucher", async () => {
    await createVoucher({ email: "a@b.com", name: "A", role: "student" });
    await createVoucher({ email: "c@d.com", name: "C", role: "admin" });
    const all = await listVouchers();
    expect(all).toHaveLength(2);
  });
});

describe("isVoucherExpired", () => {
  it("is false for a voucher issued moments ago", async () => {
    const voucher = await createVoucher({ email: "a@b.com", name: "A", role: "student" });
    expect(isVoucherExpired(voucher)).toBe(false);
  });

  it("is true once expiresAt is in the past", () => {
    expect(isVoucherExpired({ expiresAt: Date.now() - 1000 })).toBe(true);
  });

  it("is false with no expiresAt at all, however far in the past 'now' pretends to be", () => {
    expect(isVoucherExpired({ expiresAt: undefined })).toBe(false);
  });
});

describe("revokeVoucher", () => {
  it("flips a pending voucher to revoked", async () => {
    const voucher = await createVoucher({ email: "a@b.com", name: "A", role: "student" });
    const revoked = await revokeVoucher(voucher.voucherId);
    expect(revoked?.status).toBe("revoked");
    expect((await getVoucher(voucher.voucherId))?.status).toBe("revoked");
  });

  it("refuses to revoke a voucher that's already been registered", async () => {
    const voucher = await createVoucher({ email: "a@b.com", name: "A", role: "student" });
    await markVoucherRegistered(voucher.voucherId, "u1");
    expect(await revokeVoucher(voucher.voucherId)).toBeUndefined();
    expect((await getVoucher(voucher.voucherId))?.status).toBe("registered");
  });

  it("returns undefined for a voucherId that doesn't exist", async () => {
    expect(await revokeVoucher("missing")).toBeUndefined();
  });
});

describe("markVoucherRegistered", () => {
  it("records status, registeredUserId, and registeredAt", async () => {
    const voucher = await createVoucher({ email: "a@b.com", name: "A", role: "student" });
    const before = Date.now();
    const updated = await markVoucherRegistered(voucher.voucherId, "u1");
    expect(updated?.status).toBe("registered");
    expect(updated?.registeredUserId).toBe("u1");
    expect(updated?.registeredAt).toBeGreaterThanOrEqual(before);
  });
});

describe("toPublicVoucher", () => {
  it("strips registeredUserId/registeredAt", async () => {
    const voucher = await createVoucher({ email: "a@b.com", name: "A", role: "student" });
    const registered = (await markVoucherRegistered(voucher.voucherId, "u1"))!;
    const pub = toPublicVoucher(registered);
    expect(pub).not.toHaveProperty("registeredUserId");
    expect(pub).not.toHaveProperty("registeredAt");
    expect(pub.status).toBe("registered");
  });
});

describe("checkVoucherForRegistration", () => {
  function baseVoucher(overrides: Partial<Voucher> = {}): Voucher {
    const issuedAt = Date.now();
    return {
      voucherId: "v1",
      email: "a@b.com",
      name: "A",
      role: "student",
      issuedAt,
      expiresAt: issuedAt + VOUCHER_VALIDITY_MS,
      status: "pending",
      ...overrides,
    };
  }

  it("allows a pending, unexpired voucher used with its own email", () => {
    expect(checkVoucherForRegistration(baseVoucher(), "a@b.com")).toBeNull();
  });

  it("is case-insensitive on the email comparison", () => {
    expect(checkVoucherForRegistration(baseVoucher(), "A@B.COM")).toBeNull();
  });

  it("rejects a revoked voucher", () => {
    expect(checkVoucherForRegistration(baseVoucher({ status: "revoked" }), "a@b.com")).toBe("revoked");
  });

  it("rejects an already-registered voucher", () => {
    expect(checkVoucherForRegistration(baseVoucher({ status: "registered" }), "a@b.com")).toBe("already_used");
  });

  it("rejects an expired voucher", () => {
    expect(checkVoucherForRegistration(baseVoucher({ expiresAt: Date.now() - 1000 }), "a@b.com")).toBe("expired");
  });

  it("rejects a mismatched email", () => {
    expect(checkVoucherForRegistration(baseVoucher(), "someone-else@b.com")).toBe("email_mismatch");
  });

  it("checks status before expiry, so a revoked-and-expired voucher reports revoked", () => {
    const voucher = baseVoucher({ status: "revoked", expiresAt: Date.now() - 1000 });
    expect(checkVoucherForRegistration(voucher, "a@b.com")).toBe("revoked");
  });

  it("allows an admin voucher with no expiresAt regardless of how old issuedAt is", () => {
    const voucher = baseVoucher({ role: "admin", issuedAt: 0, expiresAt: undefined });
    expect(checkVoucherForRegistration(voucher, "a@b.com")).toBeNull();
  });
});
