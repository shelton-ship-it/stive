// Stive PDF Engine runtime module — honest failures, no silent success
let wasmModule = null;
let initError = null;

export async function init() {
  if (wasmModule) return wasmModule;
  if (initError) throw initError;
  try {
    const wasm = await import("./stive_pdf_wasm.js");
    await wasm.default();
    wasmModule = wasm;
    return wasmModule;
  } catch (err) {
    initError = err instanceof Error ? err : new Error(String(err));
    wasmModule = null;
    throw initError;
  }
}

function requireWasm() {
  if (!wasmModule) {
    throw new Error(
      "WASM do Stive PDF Engine não inicializado. " +
        (initError ? initError.message : "Chame init() primeiro ou verifique se o módulo WASM foi construído.")
    );
  }
  return wasmModule;
}

export class StivePdfSession {
  constructor() {
    const wasm = requireWasm();
    this.native = new wasm.StivePdfSession();
  }

  open_bytes(name, bytes) {
    return this.native.open_bytes(name, bytes);
  }

  save_bytes(docId) {
    return this.native.save_bytes(docId);
  }

  close_doc(docId) {
    return this.native.close_doc(docId);
  }

  page_count(docId) {
    return this.native.page_count(docId);
  }

  call(docId, toolName, argsJson) {
    return this.native.call(docId, toolName, argsJson);
  }

  static list_tools() {
    const wasm = requireWasm();
    return wasm.StivePdfSession.list_tools();
  }

  free() {
    if (this.native && typeof this.native.free === "function") {
      this.native.free();
    }
  }
}

export function stive_pdf_version() {
  if (!wasmModule) return "Stive PDF Engine (WASM não carregado)";
  return wasmModule.stive_pdf_version();
}

export async function stive_pdf_page_count(pdf_bytes) {
  const wasm = requireWasm();
  return wasm.stive_pdf_page_count(pdf_bytes);
}

export async function stive_pdf_merge(buffers) {
  const wasm = requireWasm();
  const arr = Array.isArray(buffers) ? buffers : Array.from(buffers);
  return wasm.stive_pdf_merge(arr);
}

export async function stive_pdf_extract(pdf_bytes, pages) {
  const wasm = requireWasm();
  return wasm.stive_pdf_extract(pdf_bytes, pages);
}

export async function stive_pdf_split(pdf_bytes, every_n_pages) {
  const wasm = requireWasm();
  return wasm.stive_pdf_split(pdf_bytes, every_n_pages);
}

export async function stive_pdf_compress(pdf_bytes, mobile_preset = false) {
  const wasm = requireWasm();
  return wasm.stive_pdf_compress(pdf_bytes, mobile_preset);
}

export async function stive_pdf_sign(pdf_bytes, signature_text) {
  const wasm = requireWasm();
  return wasm.stive_pdf_sign(pdf_bytes, signature_text);
}

export default init;
