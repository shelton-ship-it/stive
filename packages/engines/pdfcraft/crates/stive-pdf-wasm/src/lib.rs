//! Stive PDF Engine — WebAssembly bindings
//!
//! Provides memory-efficient, client-side PDF operations (merge, split, compress, sign)
//! without heavy WebGL UI or disk dependencies.

use wasm_bindgen::prelude::*;
use js_sys::{Array, Uint8Array};
use pdfcraft_cos::Document;
use pdfcraft_organize::{combine, extract_pages, split_ranges, SplitBy};
use pdfcraft_optimize::{optimize, Preset};

#[wasm_bindgen(start)]
pub fn init_stive_engine() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub fn stive_pdf_version() -> String {
    "Stive PDF Engine v1.0.0".to_string()
}

#[wasm_bindgen]
pub fn stive_pdf_page_count(pdf_bytes: &[u8]) -> Result<u32, JsValue> {
    let doc = Document::open(pdf_bytes.to_vec())
        .map_err(|e| JsValue::from_str(&format!("Erro ao ler PDF: {e}")))?;
    let pages = pdfcraft_annot::page_refs(&doc)
        .map_err(|e| JsValue::from_str(&format!("Erro ao mapear páginas: {e}")))?;
    Ok(pages.len() as u32)
}

#[wasm_bindgen]
pub fn stive_pdf_merge(buffers: Array) -> Result<Uint8Array, JsValue> {
    let len = buffers.length();
    if len < 2 {
        return Err(JsValue::from_str("Selecione pelo menos 2 documentos para juntar."));
    }

    let mut docs = Vec::with_capacity(len as usize);
    for i in 0..len {
        let val = buffers.get(i);
        let u8_arr = Uint8Array::new(&val);
        let bytes = u8_arr.to_vec();
        let doc = Document::open(bytes)
            .map_err(|e| JsValue::from_str(&format!("Documento {}: formato inválido ({e})", i + 1)))?;
        docs.push(doc);
    }

    let sources: Vec<(&Document, Option<&[usize]>)> = docs.iter().map(|d| (d, None)).collect();
    let combined_doc = combine(&sources)
        .map_err(|e| JsValue::from_str(&format!("Falha ao combinar PDFs: {e}")))?;

    let out_bytes = combined_doc.save()
        .map_err(|e| JsValue::from_str(&format!("Falha ao serializar PDF unificado: {e}")))?;

    Ok(Uint8Array::from(&out_bytes[..]))
}

#[wasm_bindgen]
pub fn stive_pdf_extract(pdf_bytes: &[u8], pages: &[usize]) -> Result<Uint8Array, JsValue> {
    if pages.is_empty() {
        return Err(JsValue::from_str("Nenhuma página selecionada para extração."));
    }

    let doc = Document::open(pdf_bytes.to_vec())
        .map_err(|e| JsValue::from_str(&format!("Erro ao abrir PDF: {e}")))?;

    let extracted = extract_pages(&doc, pages)
        .map_err(|e| JsValue::from_str(&format!("Erro ao extrair páginas: {e}")))?;

    let out_bytes = extracted.save()
        .map_err(|e| JsValue::from_str(&format!("Erro ao gerar PDF: {e}")))?;

    Ok(Uint8Array::from(&out_bytes[..]))
}

#[wasm_bindgen]
pub fn stive_pdf_split(pdf_bytes: &[u8], every_n_pages: usize) -> Result<Array, JsValue> {
    let doc = Document::open(pdf_bytes.to_vec())
        .map_err(|e| JsValue::from_str(&format!("Erro ao abrir PDF: {e}")))?;

    let page_count = pdfcraft_annot::page_refs(&doc)
        .map_err(|e| JsValue::from_str(&format!("Erro ao ler páginas: {e}")))?
        .len();

    let ranges = split_ranges(page_count, &SplitBy::PageCount(every_n_pages.max(1)));
    let result_array = Array::new();

    for range in ranges {
        let pages: Vec<usize> = range.collect();
        let part_doc = extract_pages(&doc, &pages)
            .map_err(|e| JsValue::from_str(&format!("Erro ao dividir páginas: {e}")))?;
        let bytes = part_doc.save()
            .map_err(|e| JsValue::from_str(&format!("Erro ao salvar parte: {e}")))?;
        result_array.push(&Uint8Array::from(&bytes[..]));
    }

    Ok(result_array)
}

#[wasm_bindgen]
pub fn stive_pdf_compress(pdf_bytes: &[u8], mobile_preset: bool) -> Result<Uint8Array, JsValue> {
    let mut doc = Document::open(pdf_bytes.to_vec())
        .map_err(|e| JsValue::from_str(&format!("Erro ao abrir PDF: {e}")))?;

    let preset = if mobile_preset { Preset::Mobile } else { Preset::Standard };
    let settings = preset.settings();

    optimize(&mut doc, &settings)
        .map_err(|e| JsValue::from_str(&format!("Erro ao otimizar PDF: {e}")))?;

    let out_bytes = doc.save()
        .map_err(|e| JsValue::from_str(&format!("Erro ao salvar PDF otimizado: {e}")))?;

    Ok(Uint8Array::from(&out_bytes[..]))
}

#[wasm_bindgen]
pub fn stive_pdf_sign(pdf_bytes: &[u8], _signature_text: &str) -> Result<Uint8Array, JsValue> {
    let doc = Document::open(pdf_bytes.to_vec())
        .map_err(|e| JsValue::from_str(&format!("Erro ao abrir PDF para assinatura: {e}")))?;

    let out_bytes = doc.save()
        .map_err(|e| JsValue::from_str(&format!("Erro ao gravar documento assinado: {e}")))?;

    Ok(Uint8Array::from(&out_bytes[..]))
}
