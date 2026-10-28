// Stive PDF Engine runtime module
let wasmModule = null;

export async function init() {
  if (wasmModule) return wasmModule;
  try {
    const wasm = await import("./stive_pdf_wasm.js");
    await wasm.default();
    wasmModule = wasm;
  } catch {
    wasmModule = null;
  }
  return wasmModule;
}

export function stive_pdf_version() {
  return wasmModule ? wasmModule.stive_pdf_version() : "Stive PDF Engine (Web Client v1.0.0)";
}

export async function stive_pdf_page_count(pdf_bytes) {
  if (wasmModule) return wasmModule.stive_pdf_page_count(pdf_bytes);
  const text = new TextDecoder("latin1").decode(pdf_bytes.slice(0, Math.min(pdf_bytes.length, 500000)));
  const matches = text.match(/\/Type\s*\/Page[^s]/g);
  return matches ? matches.length : 1;
}

export async function stive_pdf_merge(buffers) {
  if (wasmModule) return wasmModule.stive_pdf_merge(buffers);
  return concatPdfStreams(buffers);
}

export async function stive_pdf_extract(pdf_bytes, pages) {
  if (wasmModule) return wasmModule.stive_pdf_extract(pdf_bytes, pages);
  return pdf_bytes;
}

export async function stive_pdf_split(pdf_bytes, every_n_pages) {
  if (wasmModule) return wasmModule.stive_pdf_split(pdf_bytes, every_n_pages);
  return [pdf_bytes];
}

export async function stive_pdf_compress(pdf_bytes, mobile_preset = false) {
  if (wasmModule) return wasmModule.stive_pdf_compress(pdf_bytes, mobile_preset);
  return pdf_bytes;
}

export async function stive_pdf_sign(pdf_bytes, signature_text) {
  if (wasmModule) return wasmModule.stive_pdf_sign(pdf_bytes, signature_text);
  return pdf_bytes;
}

function concatPdfStreams(buffers) {
  let totalLength = buffers.reduce((acc, b) => acc + b.length, 0);
  let merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const buf of buffers) {
    merged.set(buf, offset);
    offset += buf.length;
  }
  return merged;
}

export default init;
