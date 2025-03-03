import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        defaultMeta: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("USER_SETTINGS_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, defaultMeta } = body;

    const updatedUser = await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: name !== undefined ? name : undefined,
        defaultMeta: defaultMeta !== undefined ? defaultMeta : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        defaultMeta: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("USER_SETTINGS_UPDATE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 