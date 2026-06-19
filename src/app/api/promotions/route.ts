import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const promotions = await prisma.promotion.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(promotions);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, discountPct, active, endDate } = body;

    if (!title) {
      return NextResponse.json({ error: "Titre requis" }, { status: 400 });
    }

    const promotion = await prisma.promotion.create({
      data: {
        title,
        description: description || null,
        discountPct: discountPct ? parseFloat(discountPct) : null,
        active: active !== false,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json(promotion, { status: 201 });
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

  await prisma.promotion.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, active } = body;

    const promotion = await prisma.promotion.update({
      where: { id },
      data: { active },
    });

    return NextResponse.json(promotion);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
