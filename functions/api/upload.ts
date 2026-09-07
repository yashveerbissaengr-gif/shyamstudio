import type { PagesFunction } from "@cloudflare/workers-types";

export interface Env {
  BUCKET: R2Bucket;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const request = context.request;
    const formData = await request.formData();
    
    const file = formData.get("file");
    const filename = formData.get("filename") || `upload_${Date.now()}.pdf`;

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: "Missing or invalid file" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Convert file to ArrayBuffer for R2 upload
    const arrayBuffer = await file.arrayBuffer();

    // Upload to R2 Bucket
    await context.env.BUCKET.put(filename.toString(), arrayBuffer, {
      httpMetadata: {
        contentType: file.type || 'application/pdf',
      },
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "File uploaded to R2 successfully",
      filename: filename
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
