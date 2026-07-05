import { NextResponse } from "next/server";
import { db } from "@/lib/db"; 

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const leads = await db.lead.findMany({
      orderBy: { createdAt: "desc" },
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, subject } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Необхідно вказати ім'я та номер телефону" },
        { status: 400 }
      );
    }

    const newLead = await db.lead.create({
      data: {
        name,
        phone,
        subject: subject || "MATHEMATICS",
        status: "NEW",
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
