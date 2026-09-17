import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";

function unauthorized() {
  return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  const images = await prisma.heroImage.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(images);
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  try {
    const { url, alt } = await request.json();

    if (typeof url !== "string" || url.trim() === "") {
      return NextResponse.json({ error: "Image requise" }, { status: 400 });
    }

    // New images go to the end of the list.
    const last = await prisma.heroImage.findFirst({
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const image = await prisma.heroImage.create({
      data: {
        url: url.trim(),
        alt: typeof alt === "string" && alt.trim() !== "" ? alt.trim() : null,
        position: (last?.position ?? -1) + 1,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  try {
    const { id, active, alt, position } = await request.json();

    if (typeof id !== "string" || id === "") {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    const exists = await prisma.heroImage.findUnique({ where: { id } });
    if (!exists) {
      return NextResponse.json({ error: "Image introuvable" }, { status: 404 });
    }

    const image = await prisma.heroImage.update({
      where: { id },
      data: {
        ...(typeof active === "boolean" && { active }),
        ...(typeof position === "number" && { position }),
        ...(alt !== undefined && {
          alt: typeof alt === "string" && alt.trim() !== "" ? alt.trim() : null,
        }),
      },
    });

    return NextResponse.json(image);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** Rewrites the display order from a full list of ids, in one transaction. */
export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) {
      return NextResponse.json(
        { error: "Liste d'identifiants requise" },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      ids.map((id: string, index: number) =>
        prisma.heroImage.update({ where: { id }, data: { position: index } })
      )
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID requis" }, { status: 400 });
  }

  try {
    await prisma.heroImage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Image introuvable" }, { status: 404 });
  }
}
