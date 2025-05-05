
export interface PDFLinkByArea {
  id: string;
  pdf_name: string;
  area: string;
  pdf_url: string;
  original_path?: string;
  description?: string;
  total_pages?: number;
  created_at: string;
  source_id?: string;
}

export interface PDFArea {
  name: string;
  count: number;
}
