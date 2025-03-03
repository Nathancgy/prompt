import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

interface ProjectParams {
  params: {
    projectId: string;
  };
}

export async function GET(req: Request, { params }: ProjectParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { projectId } = params;

    const project = await db.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
      include: {
        prompts: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("PROJECT_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: ProjectParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { projectId } = params;
    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Check if user owns the project
    const existingProject = await db.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!existingProject) {
      return new NextResponse("Project not found", { status: 404 });
    }

    const updatedProject = await db.project.update({
      where: {
        id: projectId,
      },
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("PROJECT_UPDATE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: ProjectParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { projectId } = params;

    // Check if user owns the project
    const existingProject = await db.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!existingProject) {
      return new NextResponse("Project not found", { status: 404 });
    }

    await db.project.delete({
      where: {
        id: projectId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("PROJECT_DELETE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 