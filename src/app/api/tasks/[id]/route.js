import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export async function PATCH(request, { params }) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: taskId } = params;

  try {
    const body = await request.json();
    
    // Find task to check project membership
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } }
    });

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const isMember = task.project.members.some(m => m.userId === userId);
    if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...body,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        assigneeId: body.assigneeId === "" ? null : body.assigneeId,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: taskId } = params;

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } }
    });

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const member = task.project.members.find(m => m.userId === userId);
    if (!member || member.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can delete tasks' }, { status: 403 });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ message: 'Task deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
