import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { title } = await request.json();

  const thread = await prisma.chatThread.updateMany({
    where: { id, userId: session.user.id },
    data: { title },
  });

  return Response.json(thread);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.chatThread.deleteMany({
    where: { id, userId: session.user.id },
  });

  return Response.json({ ok: true });
}
