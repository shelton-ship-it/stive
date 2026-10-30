//! Stive PDF Engine — WebAssembly bindings
//!
//! Exposes a memory-efficient, client-side session interface wrapping the
//! native pdfcraft engine. Pure in-memory streaming, DOM-friendly.
//! Only operations with real implementations are reported as successful.

use wasm_bindgen::prelude::*;
use js_sys::{Array, Uint8Array};
use std::collections::HashMap;
use std::sync::Arc;
use pdfcraft_cos::Document;
use pdfcraft_organize::{
    combine, delete_pages, extract_pages, page_count as organize_page_count, reverse_pages,
    rotate_pages, split_ranges, SplitBy,
};
use pdfcraft_optimize::{optimize, Preset};
use pdfcraft_engine::{DocId, Session};
use serde::{Deserialize, Serialize};

#[wasm_bindgen(start)]
pub fn init_stive_engine() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub fn stive_pdf_version() -> String {
    "Stive PDF Engine v2.1.0 (Real Operations)".to_string()
}

#[derive(Serialize, Deserialize)]
pub struct ToolItem {
    pub name: String,
    pub title: String,
    pub category: String,
    pub description: String,
    pub read_only: bool,
    pub destructive: bool,
}

#[wasm_bindgen]
pub struct StivePdfSession {
    session: Session,
    docs: HashMap<u64, Vec<u8>>,
    doc_names: HashMap<u64, String>,
    engine_doc_ids: HashMap<u64, DocId>,
    next_id: u64,
}

#[wasm_bindgen]
impl StivePdfSession {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            session: Session::new(),
            docs: HashMap::new(),
            doc_names: HashMap::new(),
            engine_doc_ids: HashMap::new(),
            next_id: 1,
        }
    }

    pub fn open_bytes(&mut self, name: &str, bytes: &[u8]) -> Result<u64, JsValue> {
        let _ = Document::open(bytes.to_vec()).map_err(|e| {
            JsValue::from_str(&format!("Erro ao ler documento PDF '{name}': {e}"))
        })?;

        let id = self.next_id;
        self.next_id += 1;

        let arc_bytes = Arc::new(bytes.to_vec());
        if let Ok(engine_id) = self.session.open(name.to_string(), None, arc_bytes, None) {
            self.engine_doc_ids.insert(id, engine_id);
        }

        self.docs.insert(id, bytes.to_vec());
        self.doc_names.insert(id, name.to_string());
        Ok(id)
    }

    pub fn save_bytes(&mut self, doc_id: u64) -> Result<Uint8Array, JsValue> {
        if let Some(&engine_id) = self.engine_doc_ids.get(&doc_id) {
            if let Ok(saved_arc) = self.session.save_bytes(engine_id) {
                let vec_bytes = (*saved_arc).clone();
                self.docs.insert(doc_id, vec_bytes.clone());
                return Ok(Uint8Array::from(&vec_bytes[..]));
            }
        }
        let bytes = self
            .docs
            .get(&doc_id)
            .ok_or_else(|| JsValue::from_str(&format!("Documento {doc_id} não encontrado.")))?;
        Ok(Uint8Array::from(&bytes[..]))
    }

    pub fn close_doc(&mut self, doc_id: u64) {
        if let Some(engine_id) = self.engine_doc_ids.remove(&doc_id) {
            self.session.close(engine_id);
        }
        self.docs.remove(&doc_id);
        self.doc_names.remove(&doc_id);
    }

    pub fn page_count(&self, doc_id: u64) -> Result<u32, JsValue> {
        let bytes = self
            .docs
            .get(&doc_id)
            .ok_or_else(|| JsValue::from_str(&format!("Documento {doc_id} não encontrado.")))?;
        let doc = Document::open(bytes.clone())
            .map_err(|e| JsValue::from_str(&format!("Erro ao ler PDF: {e}")))?;
        let n = organize_page_count(&doc)
            .map_err(|e| JsValue::from_str(&format!("Erro ao contar páginas: {e}")))?;
        Ok(n as u32)
    }

    pub fn call(
        &mut self,
        doc_id: u64,
        tool_name: &str,
        args_json: &str,
    ) -> Result<String, JsValue> {
        let bytes = self
            .docs
            .get(&doc_id)
            .ok_or_else(|| JsValue::from_str(&format!("Documento {doc_id} não encontrado.")))?
            .clone();
        let parsed_args: serde_json::Value =
            serde_json::from_str(args_json).unwrap_or(serde_json::json!({}));

        match tool_name {
            "doc_info" => {
                let doc = Document::open(bytes.clone())
                    .map_err(|e| JsValue::from_str(&format!("{e}")))?;
                let pages = organize_page_count(&doc).unwrap_or(0);
                let result = serde_json::json!({
                    "doc": doc_id,
                    "pages": pages,
                    "size_bytes": bytes.len(),
                    "encrypted": doc.is_encrypted(),
                });
                Ok(result.to_string())
            }

            "doc_split" => {
                let doc = Document::open(bytes.clone())
                    .map_err(|e| JsValue::from_str(&format!("{e}")))?;
                let every = parsed_args
                    .get("every")
                    .and_then(|v| v.as_u64())
                    .unwrap_or(1) as usize;
                let page_count = organize_page_count(&doc).unwrap_or(1);
                let ranges = split_ranges(page_count, &SplitBy::PageCount(every.max(1)));
                let parts_count = ranges.count();
                Ok(serde_json::json!({
                    "status": "ok",
                    "tool": "doc_split",
                    "parts": parts_count,
                    "message": "Use stive_pdf_split free function to obtain the actual part bytes."
                })
                .to_string())
            }

            "page_extract" => {
                let doc = Document::open(bytes.clone())
                    .map_err(|e| JsValue::from_str(&format!("{e}")))?;
                let pages_val = parsed_args.get("pages").and_then(|v| v.as_array());
                let pages: Vec<usize> = pages_val
                    .map(|arr| {
                        arr.iter()
                            .filter_map(|v| v.as_u64().map(|n| (n as usize).saturating_sub(1)))
                            .collect()
                    })
                    .unwrap_or_else(|| vec![0]);
                let extracted = extract_pages(&doc, &pages)
                    .map_err(|e| JsValue::from_str(&format!("Erro ao extrair páginas: {e}")))?;
                let out_bytes = extracted
                    .save()
                    .map_err(|e| JsValue::from_str(&format!("Erro ao salvar: {e}")))?;
                let len = out_bytes.len();
                self.docs.insert(doc_id, out_bytes);
                Ok(serde_json::json!({
                    "status": "ok",
                    "tool": "page_extract",
                    "extracted_pages": pages.len(),
                    "size": len
                })
                .to_string())
            }

            "page_rotate" => {
                let mut doc = Document::open(bytes.clone())
                    .map_err(|e| JsValue::from_str(&format!("{e}")))?;
                let degrees = parsed_args
                    .get("degrees")
                    .and_then(|v| v.as_i64())
                    .unwrap_or(90);
                let pages_val = parsed_args.get("pages").and_then(|v| v.as_array());
                let indices: Vec<usize> = if let Some(arr) = pages_val {
                    arr.iter()
                        .filter_map(|v| v.as_u64().map(|n| (n as usize).saturating_sub(1)))
                        .collect()
                } else {
                    let n = organize_page_count(&doc).unwrap_or(0);
                    (0..n).collect()
                };
                rotate_pages(&mut doc, &indices, degrees)
                    .map_err(|e| JsValue::from_str(&format!("Erro ao rodar páginas: {e}")))?;
                let out_bytes = doc
                    .save()
                    .map_err(|e| JsValue::from_str(&format!("{e}")))?;
                let len = out_bytes.len();
                self.docs.insert(doc_id, out_bytes);
                Ok(serde_json::json!({
                    "status": "ok",
                    "tool": "page_rotate",
                    "rotated": true,
                    "degrees": degrees,
                    "pages": indices.len(),
                    "size": len
                })
                .to_string())
            }

            "page_delete" => {
                let mut doc = Document::open(bytes.clone())
                    .map_err(|e| JsValue::from_str(&format!("{e}")))?;
                let pages_val = parsed_args.get("pages").and_then(|v| v.as_array());
                let indices: Vec<usize> = pages_val
                    .map(|arr| {
                        arr.iter()
                            .filter_map(|v| v.as_u64().map(|n| (n as usize).saturating_sub(1)))
                            .collect()
                    })
                    .unwrap_or_default();
                if indices.is_empty() {
                    return Err(JsValue::from_str(
                        "page_delete requer o argumento \"pages\" (números 1-based).",
                    ));
                }
                delete_pages(&mut doc, &indices)
                    .map_err(|e| JsValue::from_str(&format!("Erro ao eliminar páginas: {e}")))?;
                let out_bytes = doc
                    .save()
                    .map_err(|e| JsValue::from_str(&format!("{e}")))?;
                let len = out_bytes.len();
                self.docs.insert(doc_id, out_bytes);
                Ok(serde_json::json!({
                    "status": "ok",
                    "tool": "page_delete",
                    "deleted": indices.len(),
                    "size": len
                })
                .to_string())
            }

            "page_reverse" => {
                let mut doc = Document::open(bytes.clone())
                    .map_err(|e| JsValue::from_str(&format!("{e}")))?;
                let n = organize_page_count(&doc).unwrap_or(0);
                let indices: Vec<usize> = (0..n).collect();
                reverse_pages(&mut doc, &indices)
                    .map_err(|e| JsValue::from_str(&format!("Erro ao inverter páginas: {e}")))?;
                let out_bytes = doc
                    .save()
                    .map_err(|e| JsValue::from_str(&format!("{e}")))?;
                let len = out_bytes.len();
                self.docs.insert(doc_id, out_bytes);
                Ok(serde_json::json!({
                    "status": "ok",
                    "tool": "page_reverse",
                    "reversed": true,
                    "pages": n,
                    "size": len
                })
                .to_string())
            }

            "doc_optimize" | "doc_reduce" => {
                let mut doc = Document::open(bytes.clone())
                    .map_err(|e| JsValue::from_str(&format!("{e}")))?;
                let mobile = parsed_args
                    .get("mobile")
                    .and_then(|v| v.as_bool())
                    .unwrap_or(false);
                let preset = if mobile {
                    Preset::Mobile
                } else {
                    Preset::Standard
                };
                optimize(&mut doc, &preset.settings())
                    .map_err(|e| JsValue::from_str(&format!("Erro ao otimizar: {e}")))?;
                let out_bytes = doc
                    .save()
                    .map_err(|e| JsValue::from_str(&format!("Erro ao salvar: {e}")))?;
                let len = out_bytes.len();
                self.docs.insert(doc_id, out_bytes);
                Ok(serde_json::json!({
                    "status": "ok",
                    "tool": "doc_optimize",
                    "size": len,
                    "original_size": bytes.len()
                })
                .to_string())
            }

            "audit_space" => {
                let doc = Document::open(bytes.clone())
                    .map_err(|e| JsValue::from_str(&format!("{e}")))?;
                let page_count = organize_page_count(&doc).unwrap_or(0);
                let audit_data = serde_json::json!({
                    "status": "ok",
                    "tool": "audit_space",
                    "total_bytes": bytes.len(),
                    "pages": page_count,
                    "note": "Detailed stream/font/image ratios require the full audit crate path; only measured totals are reported."
                });
                Ok(audit_data.to_string())
            }

            "form_fields" | "form_fill" | "form_reset" | "form_add_field"
            | "form_add_field_table" | "doc_export_data" => {
                Err(JsValue::from_str(&format!(
                    "Operação '{tool_name}' ainda não está ligada no binding WASM. \
                     A implementação nativa existe em pdfcraft-forms / automation."
                )))
            }

            "comment_list" | "stamp_custom" | "stamp_add" | "comments_summarize" => {
                Err(JsValue::from_str(&format!(
                    "Operação '{tool_name}' ainda não está ligada no binding WASM. \
                     A implementação nativa existe em pdfcraft-annot."
                )))
            }

            "sign_document" | "doc_sign" | "sign_validate" | "signatures_list" => {
                Err(JsValue::from_str(
                    "Assinatura digital real (PAdES/CMS) não está implementada neste binding. \
                     Não é gerada nenhuma assinatura criptográfica."
                ))
            }

            "redact_mark" | "redact_apply" | "redact_sanitize" | "doc_audit_redactions" => {
                Err(JsValue::from_str(
                    "Redação segura (remoção permanente de conteúdo) não está implementada neste binding. \
                     Não é garantida a eliminação irrecuperável do texto."
                ))
            }

            "doc_encrypt" => {
                Err(JsValue::from_str(
                    "Criptografia AES-256 não está ligada neste binding WASM."
                ))
            }

            "text_extract" | "text_find" | "text_word_count" => {
                Err(JsValue::from_str(
                    "Extração de texto real requer o pipeline de content/OCR do motor. \
                     O binding WASM atual não faz parse de content streams."
                ))
            }

            "page_render" | "page_enhance_camera" | "bookmark_list"
            | "page_insert_blank" | "page_number" | "page_move" | "doc_flatten"
            | "doc_remove_hidden" => {
                Err(JsValue::from_str(&format!(
                    "Operação '{tool_name}' não está implementada neste binding WASM."
                )))
            }

            _ => Err(JsValue::from_str(&format!(
                "Ferramenta desconhecida ou não suportada: '{tool_name}'."
            ))),
        }
    }

    pub fn list_tools() -> String {
        let tools = vec![
            ToolItem {
                name: "doc_combine".into(),
                title: "Juntar PDFs".into(),
                category: "Organizar".into(),
                description: "Combina múltiplos PDFs (função livre stive_pdf_merge).".into(),
                read_only: false,
                destructive: false,
            },
            ToolItem {
                name: "doc_split".into(),
                title: "Dividir PDF".into(),
                category: "Organizar".into(),
                description: "Particiona por N páginas (função livre stive_pdf_split).".into(),
                read_only: false,
                destructive: false,
            },
            ToolItem {
                name: "page_extract".into(),
                title: "Extrair Páginas".into(),
                category: "Organizar".into(),
                description: "Extrai páginas específicas mantendo a estrutura.".into(),
                read_only: false,
                destructive: false,
            },
            ToolItem {
                name: "page_delete".into(),
                title: "Eliminar Páginas".into(),
                category: "Organizar".into(),
                description: "Remove páginas da árvore do documento.".into(),
                read_only: false,
                destructive: true,
            },
            ToolItem {
                name: "page_reverse".into(),
                title: "Inverter Páginas".into(),
                category: "Organizar".into(),
                description: "Inverte a ordem das páginas.".into(),
                read_only: false,
                destructive: false,
            },
            ToolItem {
                name: "page_rotate".into(),
                title: "Rodar Páginas".into(),
                category: "Organizar".into(),
                description: "Rotação de múltiplos de 90°.".into(),
                read_only: false,
                destructive: false,
            },
            ToolItem {
                name: "doc_optimize".into(),
                title: "Comprimir PDF".into(),
                category: "Otimização".into(),
                description: "Otimização com presets Standard / Mobile.".into(),
                read_only: false,
                destructive: false,
            },
            ToolItem {
                name: "doc_info".into(),
                title: "Info do Documento".into(),
                category: "Análise".into(),
                description: "Contagem de páginas e tamanho.".into(),
                read_only: true,
                destructive: false,
            },
            ToolItem {
                name: "audit_space".into(),
                title: "Auditoria de Espaço".into(),
                category: "Otimização".into(),
                description: "Totais medidos (sem rácios fabricados).".into(),
                read_only: true,
                destructive: false,
            },
        ];
        serde_json::to_string(&tools).unwrap_or_else(|_| "[]".to_string())
    }
}

#[wasm_bindgen]
pub fn stive_pdf_page_count(pdf_bytes: &[u8]) -> Result<u32, JsValue> {
    let doc = Document::open(pdf_bytes.to_vec())
        .map_err(|e| JsValue::from_str(&format!("Erro ao abrir PDF: {e}")))?;
    let n = organize_page_count(&doc)
        .map_err(|e| JsValue::from_str(&format!("Erro ao contar páginas: {e}")))?;
    Ok(n as u32)
}

#[wasm_bindgen]
pub fn stive_pdf_merge(buffers: Array) -> Result<Uint8Array, JsValue> {
    let mut docs = Vec::new();
    for i in 0..buffers.length() {
        let val = buffers.get(i);
        let arr = Uint8Array::new(&val);
        let mut bytes = vec![0u8; arr.length() as usize];
        arr.copy_to(&mut bytes);
        let doc = Document::open(bytes)
            .map_err(|e| JsValue::from_str(&format!("Erro ao abrir documento {i}: {e}")))?;
        docs.push(doc);
    }
    if docs.is_empty() {
        return Err(JsValue::from_str("Nenhum documento para juntar."));
    }
    let first = docs.remove(0);
    let refs: Vec<&Document> = docs.iter().collect();
    let merged = combine(&first, &refs)
        .map_err(|e| JsValue::from_str(&format!("Erro ao combinar PDFs: {e}")))?;
    let out_bytes = merged
        .save()
        .map_err(|e| JsValue::from_str(&format!("Erro ao gerar PDF combinado: {e}")))?;
    Ok(Uint8Array::from(&out_bytes[..]))
}

#[wasm_bindgen]
pub fn stive_pdf_extract(pdf_bytes: &[u8], pages: Array) -> Result<Uint8Array, JsValue> {
    let doc = Document::open(pdf_bytes.to_vec())
        .map_err(|e| JsValue::from_str(&format!("Erro ao abrir PDF: {e}")))?;
    let mut indices = Vec::new();
    for i in 0..pages.length() {
        let n = pages.get(i).as_f64().unwrap_or(1.0) as usize;
        indices.push(n.saturating_sub(1));
    }
    if indices.is_empty() {
        indices.push(0);
    }
    let extracted = extract_pages(&doc, &indices)
        .map_err(|e| JsValue::from_str(&format!("Erro ao extrair páginas: {e}")))?;
    let out_bytes = extracted
        .save()
        .map_err(|e| JsValue::from_str(&format!("Erro ao gerar PDF: {e}")))?;
    Ok(Uint8Array::from(&out_bytes[..]))
}

#[wasm_bindgen]
pub fn stive_pdf_split(pdf_bytes: &[u8], every_n_pages: usize) -> Result<Array, JsValue> {
    let doc = Document::open(pdf_bytes.to_vec())
        .map_err(|e| JsValue::from_str(&format!("Erro ao abrir PDF: {e}")))?;
    let page_count = organize_page_count(&doc)
        .map_err(|e| JsValue::from_str(&format!("Erro ao ler páginas: {e}")))?;
    let ranges = split_ranges(page_count, &SplitBy::PageCount(every_n_pages.max(1)));
    let result_array = Array::new();
    for range in ranges {
        let pages: Vec<usize> = range.collect();
        let part_doc = extract_pages(&doc, &pages)
            .map_err(|e| JsValue::from_str(&format!("Erro ao dividir páginas: {e}")))?;
        let bytes = part_doc
            .save()
            .map_err(|e| JsValue::from_str(&format!("Erro ao salvar parte: {e}")))?;
        result_array.push(&Uint8Array::from(&bytes[..]));
    }
    Ok(result_array)
}

#[wasm_bindgen]
pub fn stive_pdf_compress(pdf_bytes: &[u8], mobile_preset: bool) -> Result<Uint8Array, JsValue> {
    let mut doc = Document::open(pdf_bytes.to_vec())
        .map_err(|e| JsValue::from_str(&format!("Erro ao abrir PDF: {e}")))?;
    let preset = if mobile_preset {
        Preset::Mobile
    } else {
        Preset::Standard
    };
    optimize(&mut doc, &preset.settings())
        .map_err(|e| JsValue::from_str(&format!("Erro ao otimizar PDF: {e}")))?;
    let out_bytes = doc
        .save()
        .map_err(|e| JsValue::from_str(&format!("Erro ao salvar PDF otimizado: {e}")))?;
    Ok(Uint8Array::from(&out_bytes[..]))
}

#[wasm_bindgen]
pub fn stive_pdf_sign(_pdf_bytes: &[u8], _signature_text: &str) -> Result<Uint8Array, JsValue> {
    Err(JsValue::from_str(
        "Assinatura digital real (PAdES/CMS/X.509) não está implementada. \
         Nenhuma assinatura criptográfica é gerada."
    ))
}
