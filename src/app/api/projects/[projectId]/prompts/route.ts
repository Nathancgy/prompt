import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

interface PromptParams {
  params: {
    projectId: string;
  };
}

export async function POST(req: Request, { params }: PromptParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { projectId } = params;
    const body = await req.json();
    const { name, content } = body;

    if (!name || !content) {
      return new NextResponse("Name and content are required", { status: 400 });
    }

    // Check if user owns the project
    const project = await db.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    const prompt = await db.prompt.create({
      data: {
        name,
        content,
        projectId,
      },
    });

    return NextResponse.json(prompt, { status: 201 });
  } catch (error) {
    console.error("PROMPT_CREATE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request, { params }: PromptParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { projectId } = params;

    // Check if user owns the project
    const project = await db.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    const prompts = await db.prompt.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(prompts);
  } catch (error) {
    console.error("PROMPTS_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 