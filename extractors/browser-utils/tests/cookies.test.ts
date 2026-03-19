import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { invalidateCookies, readCookieJar } from "../src/cookies.js";

// loadCookies / saveCookies need a real Playwright BrowserContext which is
// heavy to set up.  We test the file-level functions that don't need one:
// readCookieJar, invalidateCookies.

function storageDir() {
  const dir = join(tmpdir(), `browser-utils-test-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function writeCookieJar(
  dir: string,
  extractorId: string,
  overrides: Record<string, unknown> = {},
) {
  const jar = {
    extractorId,
    savedAt: new Date().toISOString(),
    cookies: [
      {
        name: "cf_clearance",
        value: "fake",
        domain: ".example.com",
        path: "/",
        // Expires 1 hour from now
        expires: Date.now() / 1000 + 3600,
        httpOnly: true,
        secure: true,
        sameSite: "None",
      },
    ],
    ...overrides,
  };
  writeFileSync(
    join(dir, `${extractorId}-cookies.json`),
    JSON.stringify(jar, null, 2),
  );
}

describe("cookies", () => {
  describe("readCookieJar", () => {
    it("returns hasCookies false when no file exists", async () => {
      const dir = storageDir();
      const result = await readCookieJar("nonexistent", dir);
      expect(result).toEqual({ hasCookies: false });
    });

    it("returns saved userAgent and hasCookies true", async () => {
      const dir = storageDir();
      writeCookieJar(dir, "hiringcafe", {
        userAgent: "Mozilla/5.0 SolverUA",
      });

      const result = await readCookieJar("hiringcafe", dir);
      expect(result.hasCookies).toBe(true);
      expect(result.userAgent).toBe("Mozilla/5.0 SolverUA");
    });

    it("returns hasCookies false when all cookies are expired", async () => {
      const dir = storageDir();
      writeCookieJar(dir, "hiringcafe", {
        cookies: [
          {
            name: "cf_clearance",
            value: "old",
            domain: ".example.com",
            path: "/",
            expires: Date.now() / 1000 - 3600, // expired 1 hour ago
            httpOnly: true,
            secure: true,
            sameSite: "None",
          },
        ],
        userAgent: "Mozilla/5.0 StaleUA",
      });

      const result = await readCookieJar("hiringcafe", dir);
      expect(result.hasCookies).toBe(false);
      // UA is still returned — caller decides whether to use it
      expect(result.userAgent).toBe("Mozilla/5.0 StaleUA");
    });

    it("returns undefined userAgent when jar has no UA field", async () => {
      const dir = storageDir();
      writeCookieJar(dir, "gradcracker"); // no userAgent override

      const result = await readCookieJar("gradcracker", dir);
      expect(result.hasCookies).toBe(true);
      expect(result.userAgent).toBeUndefined();
    });
  });

  describe("invalidateCookies", () => {
    it("deletes the cookie file", async () => {
      const dir = storageDir();
      writeCookieJar(dir, "hiringcafe");
      const path = join(dir, "hiringcafe-cookies.json");
      expect(existsSync(path)).toBe(true);

      await invalidateCookies("hiringcafe", dir);
      expect(existsSync(path)).toBe(false);
    });

    it("does not throw when file does not exist", async () => {
      const dir = storageDir();
      await expect(
        invalidateCookies("nonexistent", dir),
      ).resolves.toBeUndefined();
    });

    it("makes readCookieJar return hasCookies false after invalidation", async () => {
      const dir = storageDir();
      writeCookieJar(dir, "hiringcafe", {
        userAgent: "Mozilla/5.0 SolverUA",
      });

      expect((await readCookieJar("hiringcafe", dir)).hasCookies).toBe(true);
      await invalidateCookies("hiringcafe", dir);
      expect((await readCookieJar("hiringcafe", dir)).hasCookies).toBe(false);
    });
  });
});
