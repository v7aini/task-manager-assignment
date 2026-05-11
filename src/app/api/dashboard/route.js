import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { assigneeId: userId },
          { project: { members: { some: { userId } } } }
        ]
      }
    });

    const statusCounts = {
      TODO: tasks.filter(t => t.status === 'TODO').length,
      IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      DONE: tasks.filter(t => t.status === 'DONE').length,
    };

    const overdueCount = tasks.filter(t => 
      t.status !== 'DONE' && 
      t.dueDate && 
      new Date(t.dueDate) < new Date()
    ).length;

    const projectsCount = await prisma.project.count({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      }
    });

    return NextResponse.json({
      totalTasks: tasks.length,
      statusCounts,
      overdueCount,
      projectsCount,
      recentTasks: tasks.slice(0, 5),
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
