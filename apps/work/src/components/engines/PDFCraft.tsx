"use client";

/**
 * PDFCraft component backward compatibility layer.
 * Re-exports the modern StivePdfEngine.
 */
import { StivePdfEngine } from "./StivePdfEngine";

export { StivePdfEngine, StivePdfEngine as PDFCraft };
export default StivePdfEngine;
