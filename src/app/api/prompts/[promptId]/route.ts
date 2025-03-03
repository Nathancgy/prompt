import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface PromptParams {
  params: {
    promptId: string;
  };
}

export async function GET(req: Request, { params }: PromptParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { promptId } = params;

    const prompt = await db.prompt.findUnique({
      where: {
        id: promptId,
      },
      include: {
        project: true,
      },
    });

    if (!prompt) {
      return new NextResponse("Prompt not found", { status: 404 });
    }

    // Check if user owns the project
    if (prompt.project.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json(prompt);
  } catch (error) {
    console.error("PROMPT_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: PromptParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { promptId } = params;
    const body = await req.json();
    const { name, content } = body;

    if (!name || !content) {
      return new NextResponse("Name and content are required", { status: 400 });
    }

    // Get the prompt with its project
    const prompt = await db.prompt.findUnique({
      where: {
        id: promptId,
      },
      include: {
        project: true,
      },
    });

    if (!prompt) {
      return new NextResponse("Prompt not found", { status: 404 });
    }

    // Check if user owns the project
    if (prompt.project.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedPrompt = await db.prompt.update({
      where: {
        id: promptId,
      },
      data: {
        name,
        content,
      },
    });

    return NextResponse.json(updatedPrompt);
  } catch (error) {
    console.error("PROMPT_UPDATE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: PromptParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { promptId } = params;

    // Get the prompt with its project
    const prompt = await db.prompt.findUnique({
      where: {
        id: promptId,
      },
      include: {
        project: true,
      },
    });

    if (!prompt) {
      return new NextResponse("Prompt not found", { status: 404 });
    }

    // Check if user owns the project
    if (prompt.project.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db.prompt.delete({
      where: {
        id: promptId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("PROMPT_DELETE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 