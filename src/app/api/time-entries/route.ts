import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role;
  const userId = (session.user as { id?: string }).id;

  try {
    let entries;
    if (role === "BOSS") {
      entries = await prisma.timeEntry.findMany({
        include: { user: true, project: true },
        orderBy: { date: 'desc' }
      });
    } else {
      entries = await prisma.timeEntry.findMany({
        where: { userId },
        include: { project: true },
        orderBy: { date: 'desc' }
      });
    }
    return NextResponse.json(entries);
  } catch {
    return NextResponse.json({ error: "Failed to fetch time entries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as { role?: string }).role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { date, hours, taskDescription, projectId } = body;
    const userId = (session.user as { id?: string }).id;

    if (!userId || !date || !hours || !taskDescription || !projectId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const entry = await prisma.timeEntry.create({
      data: {
        date: new Date(date),
        hours: parseFloat(hours),
        taskDescription,
        userId,
        projectId,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create time entry" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as { role?: string }).role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, date, hours, taskDescription, projectId } = body;
    const userId = (session.user as { id?: string }).id;

    if (!id || !userId || !date || !hours || !taskDescription || !projectId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingEntry = await prisma.timeEntry.findUnique({
      where: { id }
    });

    if (!existingEntry || existingEntry.userId !== userId) {
        return NextResponse.json({ error: "Unauthorized or entry not found" }, { status: 403 });
    }

    const updatedEntry = await prisma.timeEntry.update({
      where: { id },
      data: {
        date: new Date(date),
        hours: parseFloat(hours),
        taskDescription,
        projectId,
      },
    });

    return NextResponse.json(updatedEntry, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to update time entry" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as { role?: string }).role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = body;
    const userId = (session.user as { id?: string }).id;

    if (!id || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingEntry = await prisma.timeEntry.findUnique({
      where: { id }
    });

    if (!existingEntry || existingEntry.userId !== userId) {
        return NextResponse.json({ error: "Unauthorized or entry not found" }, { status: 403 });
    }

    const deletedEntry = await prisma.timeEntry.delete({
      where: { id },
    });

    return NextResponse.json(deletedEntry, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete time entry" }, { status: 500 });
  }
}
