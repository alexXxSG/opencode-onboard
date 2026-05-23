import { describe, expect, it, vi } from "vitest";
import { initOpenspec, openspecSteps } from "./index.js";

describe("initOpenspec()", () => {
  it("installs OpenSpec if not available", async () => {
    vi.spyOn(openspecSteps, "check")
      .mockResolvedValueOnce({ available: false })
      .mockResolvedValueOnce({ available: true });

    vi.spyOn(openspecSteps, "install").mockResolvedValue({ installed: true });
    vi.spyOn(openspecSteps, "init").mockResolvedValue({ initialized: true });
    vi.spyOn(openspecSteps, "patch").mockResolvedValue({ success: true });

    const result = await initOpenspec();

    expect(openspecSteps.install).toHaveBeenCalled();
    expect(openspecSteps.init).toHaveBeenCalled();
    expect(openspecSteps.patch).toHaveBeenCalled();
    expect(result.available).toBe(true);
    expect(result.initialized).toBe(true);
    expect(result.patched).toBe(true);
  });

  it("fails if OpenSpec is not installed", async () => {
    vi.spyOn(openspecSteps, "check")
      .mockResolvedValueOnce({ available: false })
      .mockResolvedValueOnce({ available: false });
    vi.spyOn(openspecSteps, "install").mockResolvedValue({ installed: false });

    const result = await initOpenspec();

    expect(openspecSteps.install).toHaveBeenCalled();
    expect(result.available).toBe(false);
    expect(result.initialized).toBe(false);
    expect(result.patched).toBe(false);
  });

  it("fails if OpenSpec is not initialized", async () => {
    vi.spyOn(openspecSteps, "check")
      .mockResolvedValueOnce({ available: false })
      .mockResolvedValueOnce({ available: true });
    vi.spyOn(openspecSteps, "install").mockResolvedValue({ installed: true });
    vi.spyOn(openspecSteps, "init").mockResolvedValue({ initialized: false });

    const result = await initOpenspec();

    expect(openspecSteps.install).toHaveBeenCalled();
    expect(openspecSteps.init).toHaveBeenCalled();
    expect(result.available).toBe(true);
    expect(result.initialized).toBe(false);
    expect(result.patched).toBe(false);
  });
});
