import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Імпортуємо наш адаптований Lazy клієнт Prisma

// Критично для Vercel: ізолює маршрут від статичної валідації під час npm run build
export const dynamic = "force-dynamic";

/**
 * GET /api/leads
 * Отримання списку всіх лідів для CRM-воронки
 */
export async function GET() {
  try {
    // Запит до бази даних виконується строго в процесі обробки виклику
    // Переконайся, що в schema.prisma назва моделі відповідає твоїй схемі (наприклад, lead або leads)
    const leads = await db.lead.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(leads, { status: 200 });
  } catch (error) {
    console.error("[LEADS_GET_ERROR]:", error);
    return NextResponse.json(
      { error: "Внутрішня помилка сервера при отриманні лідів" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leads
 * Створення нового ліда (з форми на сайті або менеджером)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, subject } = body;

    // Базова валідація вхідних даних на рівні архітектури API
    if (!name || !phone) {
      return NextResponse.json(
        { error: "Необхідно вказати ім'я та номер телефону" },
        { status: 400 }
      );
    }

    // Запис у базу даних Supabase через Prisma
    const newLead = await db.lead.create({
      data: {
        name,
        phone,
        subject: subject || "MATHEMATICS", // Дефолтне значення, якщо предмет не обрано
        status: "NEW", // Початковий етап воронки продажів
      },
    });

    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.error("[LEADS_POST_ERROR]:", error);
    return NextResponse.json(
      { error: "Не вдалося створити картку ліда" },
      { status: 500 }
    );
  }
}
