/**
 * Stive PDF Engine — WebAssembly TypeScript API definitions
 */
export function stive_pdf_version(): string;
export function stive_pdf_page_count(pdf_bytes: Uint8Array): Promise<number> | number;
export function stive_pdf_merge(buffers: Uint8Array[]): Promise<Uint8Array> | Uint8Array;
export function stive_pdf_extract(pdf_bytes: Uint8Array, pages: number[]): Promise<Uint8Array> | Uint8Array;
export function stive_pdf_split(pdf_bytes: Uint8Array, every_n_pages: number): Promise<Uint8Array[]> | Uint8Array[];
export function stive_pdf_compress(pdf_bytes: Uint8Array, mobile_preset?: boolean): Promise<Uint8Array> | Uint8Array;
export function stive_pdf_sign(pdf_bytes: Uint8Array, signature_text: string): Promise<Uint8Array> | Uint8Array;

export default function init(): Promise<void>;
