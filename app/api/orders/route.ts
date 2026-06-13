import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(orders);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      orderRef: data.orderRef,
      checkoutUrl: data.checkoutUrl,
      expiresAt: new Date(data.expiresAt),
      orderStatus: "confirmed",
      paymentStatus: "pending",
      chatMessageId: data.chatMessageId || null,
      items: data.items,
      summary: data.summary,
      recipient: data.recipient,
      delivery: data.delivery,
      sender: data.sender,
      giftMessage: data.giftMessage || null,
    },
  });

  return Response.json(order);
}
