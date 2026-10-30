/**
 * Stive PDF Engine — WebAssembly TypeScript API definitions
 * Only operations with real implementations are advertised as successful.
 */

export interface ToolItem {
  name: string;
  title: string;
  category: string;
  description: string;
  read_only: boolean;
  destructive: boolean;
}

export class StivePdfSession {
  constructor();
  open_bytes(name: string, bytes: Uint8Array): number;
  save_bytes(doc_id: number): Uint8Array;
  close_doc(doc_id: number): void;
  page_count(doc_id: number): number;
  call(doc_id: number, tool_name: string, args_json: string): string;
  static list_tools(): string;
  free(): void;
}

export function stive_pdf_version(): string;
export function stive_pdf_page_count(pdf_bytes: Uint8Array): Promise<number> | number;
export function stive_pdf_merge(buffers: Uint8Array[]): Promise<Uint8Array> | Uint8Array;
export function stive_pdf_extract(pdf_bytes: Uint8Array, pages: number[]): Promise<Uint8Array> | Uint8Array;
export function stive_pdf_split(pdf_bytes: Uint8Array, every_n_pages: number): Promise<Uint8Array[]> | Uint8Array[];
export function stive_pdf_compress(pdf_bytes: Uint8Array, mobile_preset?: boolean): Promise<Uint8Array> | Uint8Array;
/** Throws: real PAdES/CMS signing is not implemented. */
export function stive_pdf_sign(pdf_bytes: Uint8Array, signature_text: string): Promise<Uint8Array> | Uint8Array;

export default function init(): Promise<void>;
