import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "true";

  if (all) {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  }

  const products = await prisma.product.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      price: true,
      promoPrice: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      category,
      price,
      promoPrice,
      imageUrl,
      videoUrl,
      active,
    } = body;

    if (!name || !category || price == null) {
      return NextResponse.json(
        { error: "Nom, catégorie et prix requis" },
        { status: 400 }
      );
    }

    // A product must contain an image.
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Une image du produit est requise" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        category,
        price: parseFloat(price),
        promoPrice: promoPrice ? parseFloat(promoPrice) : null,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        active: active !== false,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.category && { category: data.category }),
        ...(data.price != null && { price: parseFloat(data.price) }),
        ...(data.promoPrice !== undefined && {
          promoPrice: data.promoPrice ? parseFloat(data.promoPrice) : null,
        }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
        ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl || null }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });

    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID requis" }, { status: 400 });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
