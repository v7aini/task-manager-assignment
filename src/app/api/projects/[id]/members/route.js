import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(request, { params }) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: projectId } = params;

  try {
    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: projectId } = params;

  try {
    const { email, role } = await request.json();

    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    // Check if current user is admin of the project
    const currentMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!currentMember || currentMember.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can invite members' }, { status: 403 });
    }

    // Find the user to invite
    const userToInvite = await prisma.user.findUnique({
      where: { email },
    });

    if (!userToInvite) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: userToInvite.id } },
    });

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: userToInvite.id,
        role: role || 'MEMBER',
      },
      include: { user: { select: { name: true, email: true } } },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Invite error:', error);
    return NextResponse.json({ error: 'Failed to invite member' }, { status: 500 });
  }
}
