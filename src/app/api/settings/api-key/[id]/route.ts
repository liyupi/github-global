// 删除 API Key

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * DELETE /api/settings/api-key/:id - 删除 API Key
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key not found' },
        { status: 404 }
      );
    }

    await prisma.apiKey.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete API key error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
