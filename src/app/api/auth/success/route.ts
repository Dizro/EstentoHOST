import { db } from "@/db/index";
import { users } from "@/db/schema";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  // check if user exists
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user == null || !user.id)
    throw new Error("Something went wrong with authentication: " + user);

  const dbUser = await db.select().from(users).where(eq(users.userId, user!.id));
  if (!dbUser.length) {

    await db.insert(users).values({
      userId: user!.id,
      firstName: user.given_name,
      lastName: user.family_name,
      email: user.email,
    });
  }

  return NextResponse.redirect("http://localhost:3000/");
}
