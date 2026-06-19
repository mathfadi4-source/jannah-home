import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export const runtime = "nodejs";

// Only allow known-safe media extensions / content types (allow-list).
const ALLOWED_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
  ".mp4",
  ".webm",
]);

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
];

// Cap upload size (applies to both paths). Client-direct uploads stream to Blob
// and so can comfortably exceed Vercel's ~4.5 MB serverless body limit.
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

function buildSafeFilename(originalName: string): string {
  // The extension is validated against an allow-list and the final name is
  // randomly generated server-side, so user input cannot influence the storage
  // path (path-traversal safe).
  const ext = path.extname(originalName).toLowerCase();
  const safeExt = ALLOWED_EXT.has(ext) ? ext : ".jpg";
  return `${Date.now()}-${Math.random().toString(36).slice(2)}${safeExt}`;
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const isMultipart = contentType.includes("multipart/form-data");

  // ---------- Path A: Vercel Blob client-direct upload (JSON handshake) ----------
  // The browser uploads the file straight to Blob; this route only mints a
  // short-lived, scoped token. This avoids the serverless request-body limit.
  if (!isMultipart) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      // No Blob store configured — the client will fall back to multipart.
      return NextResponse.json(
        {
          error:
            "Stockage non configuré. Créez un store Vercel Blob (variable BLOB_READ_WRITE_TOKEN).",
        },
        { status: 501 }
      );
    }

    try {
      const body = (await request.json()) as HandleUploadBody;
      const json = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async () => ({
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
          // Group uploads under a folder; pathname is sanitized + randomized.
          tokenPayload: JSON.stringify({ folder: "uploads" }),
        }),
        // Called by Blob after the upload finishes. We persist the URL on the
        // product when the admin submits the form, so nothing to do here.
        onUploadCompleted: async () => {},
      });
      return NextResponse.json(json);
    } catch (err) {
      console.error("Blob client-upload handshake failed:", err);
      return NextResponse.json({ error: "Erreur upload" }, { status: 500 });
    }
  }

  // ---------- Path B: multipart (local dev / Docker) ----------
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (max 50 Mo)." },
        { status: 413 }
      );
    }
    if (file.type && !ALLOWED_CONTENT_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Type de fichier non autorisé." },
        { status: 415 }
      );
    }

    const filename = buildSafeFilename(file.name);

    // If a Blob token is present, prefer Blob even for multipart (small files).
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`uploads/${filename}`, file, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: file.type || undefined,
      });
      return NextResponse.json({ url: blob.url });
    }

    // On Vercel the filesystem is read-only; refuse with a clear message instead
    // of throwing an opaque 500.
    if (process.env.VERCEL) {
      console.error(
        "Upload failed: BLOB_READ_WRITE_TOKEN is not set on Vercel. Add a Blob store in the project Storage tab."
      );
      return NextResponse.json(
        {
          error:
            "Stockage non configuré. Créez un store Vercel Blob (variable BLOB_READ_WRITE_TOKEN).",
        },
        { status: 501 }
      );
    }

    // Local dev / Docker: store on the local filesystem.
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Erreur upload" }, { status: 500 });
  }
}
