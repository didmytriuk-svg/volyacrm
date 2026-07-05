import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db'; // Наш синглтон бази даних
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { status, notes } = body;

    // 1. Перевіряємо, чи такий лід взагалі існує в базі Neon
    const existingLead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!existingLead) {
      return NextResponse.json({ error: 'Ліда з таким ID не знайдено' }, { status: 404 });
    }

    // 2. Динамічно збираємо поля для оновлення
    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    // 3. Виконуємо атомарне оновлення в базі даних
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updatedLead }, { status: 200 });
  } catch (error: any) {
    console.error(`[API PATCH LEADS ERROR] ID: ${params.id}:`, error);
    return NextResponse.json({ error: 'Внутрішня помилка при модифікації ліда' }, { status: 500 });
  }
}

