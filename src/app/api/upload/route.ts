import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

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

// Vercel serverless functions accept a request body up to ~4.5 MB. We cap a bit
// below that so the user gets a clear message instead of a platform-level error.
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB

function buildSafeFilename(originalName: string): string {
  // The extension is validated against an allow-list and the final name is
  // randomly generated server-side, so user input cannot influence the storage
  // path (path-traversal safe).
  const ext = path.extname(originalName).toLowerCase();
  const safeExt = ALLOWED_EXT.has(ext) ? ext : ".jpg";
  return `${Date.now()}-${Math.random().toString(36).slice(2)}${safeExt}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (max 4 Mo)." },
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

    // Production (Vercel): store on Vercel Blob (server upload). We do NOT pass a
    // `token` so the SDK resolves credentials automatically: it prefers the
    // OIDC token (VERCEL_OIDC_TOKEN + BLOB_STORE_ID, injected by a connected
    // store) and falls back to BLOB_READ_WRITE_TOKEN. The file is stored with a
    // public URL so it can be shown on the storefront.
    const blobConfigured =
      process.env.VERCEL ||
      process.env.BLOB_STORE_ID ||
      process.env.BLOB_READ_WRITE_TOKEN;

    if (blobConfigured) {
      const blob = await put(`uploads/${filename}`, file, {
        access: "public",
        contentType: file.type || undefined,
      });
      return NextResponse.json({ url: blob.url });
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
