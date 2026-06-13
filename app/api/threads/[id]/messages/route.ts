import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify thread belongs to user
  const thread = await prisma.chatThread.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!thread) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { threadId: id },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true, createdAt: true },
  });

  return Response.json(messages);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { messages } = await request.json();

  // Verify thread belongs to user
  const thread = await prisma.chatThread.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!thread) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  // Upsert messages (save new ones)
  const ops = messages.map((msg: { id: string; role: string; parts: unknown }) =>
    prisma.chatMessage.upsert({
      where: { id: msg.id },
      create: {
        id: msg.id,
        threadId: id,
        role: msg.role,
        content: msg.parts as any,
      },
      update: {
        content: msg.parts as any,
      },
    })
  );

  await prisma.$transaction(ops);

  // Touch thread updatedAt
  await prisma.chatThread.update({
    where: { id },
    data: { updatedAt: new Date() },
  });

  return Response.json({ ok: true });
}
