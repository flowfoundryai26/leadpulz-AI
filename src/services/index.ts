import { mockServices } from "./mock";
import { apiServices } from "./api";
import type { Services } from "./types";

/**
 * Single entry point for data access.
 *
 *   NEXT_PUBLIC_DATA_SOURCE=mock  → in-memory demo data (default)
 *   NEXT_PUBLIC_DATA_SOURCE=api   → REST API at /api/v1 (or NEXT_PUBLIC_API_BASE_URL)
 */
const source = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock";

export const services: Services = source === "api" ? apiServices : mockServices;

export * from "./types";
