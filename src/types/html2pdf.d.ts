declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: { type?: 'jpeg' | 'png' | 'webp'; quality?: number };
    html2canvas?: Record<string, unknown>;
    jsPDF?: { unit?: string; format?: string | number[]; orientation?: string };
    pagebreak?: Record<string, unknown>;
  }
  interface Html2PdfInstance {
    set(opt: Html2PdfOptions): Html2PdfInstance;
    from(el: HTMLElement): Html2PdfInstance;
    save(): Promise<void>;
    toPdf(): Html2PdfInstance;
    output(type: string): Promise<any>;
  }
  function html2pdf(): Html2PdfInstance;
  export = html2pdf;
}
