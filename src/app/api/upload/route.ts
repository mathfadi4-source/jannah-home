import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

// Only allow known-safe media extensions (allow-list, prevents arbitrary file types).
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

function buildSafeFilename(originalName: string): string {
  // Derive the extension from the original name but never trust it directly:
  // it is validated against an allow-list and the final name is randomly generated,
  // so user input cannot influence the storage path (path-traversal safe).
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

    const filename = buildSafeFilename(file.name);

    // Production (Vercel): store on Vercel Blob when a token is configured.
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`uploads/${filename}`, file, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: file.type || undefined,
      });
      return NextResponse.json({ url: blob.url });
    }

    // Local dev / Docker: store on the local filesystem.
    // `filename` is generated server-side and validated, so it is safe to join here.
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch {
    return NextResponse.json({ error: "Erreur upload" }, { status: 500 });
  }
}
