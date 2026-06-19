import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEffectivePrice } from "@/lib/utils";
import { notifyOwnerNewOrder } from "@/lib/whatsapp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      email,
      phone,
      address,
      tailleCouette,
      tailleDrap,
      notes,
      items,
    } = body;

    if (!customerName || !email || !phone || !address) {
      return NextResponse.json(
        { error: "Nom, email, téléphone et adresse sont requis" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Au moins un produit est requis" },
        { status: 400 }
      );
    }

    const productIds = items.map((i: { productId: string }) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "Un ou plusieurs produits sont invalides" },
        { status: 400 }
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    const order = await prisma.order.create({
      data: {
        customerName,
        email,
        phone,
        address,
        tailleCouette: tailleCouette || null,
        tailleDrap: tailleDrap || null,
        notes: notes || null,
        items: {
          create: items.map((item: { productId: string; quantity: number }) => {
            const product = productMap.get(item.productId)!;
            return {
              productId: item.productId,
              quantity: item.quantity || 1,
              unitPrice: getEffectivePrice(product),
            };
          }),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    notifyOwnerNewOrder(order).catch((err) =>
      console.error("WhatsApp notification failed:", err)
    );

    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID et statut requis" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
