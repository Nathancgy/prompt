import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET() {
  try {
    // Templates are public, so no auth required
    const templates = await db.template.findMany({
      where: {
        isPublic: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("TEMPLATES_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, description, content, category, isPublic = true } = body;

    if (!name || !content) {
      return new NextResponse("Name and content are required", { status: 400 });
    }

    const template = await db.template.create({
      data: {
        name,
        description,
        content,
        category,
        isPublic,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("TEMPLATE_CREATE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 