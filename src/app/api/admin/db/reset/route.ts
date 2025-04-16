import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import resetDatabase from "@/lib/db-reset";

// Function to handle database reset
export async function POST() {
  try {
    // Reset the database
    await resetDatabase();

    // Force revalidate all paths that might depend on database data
    revalidatePath("/admin");
    revalidatePath("/admin/lists");
    revalidatePath("/admin/verification");
    revalidatePath("/admin/history");
    revalidatePath("/admin/maintenance");

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Database has been reset successfully",
    });
  } catch (error) {
    console.error("Error resetting database:", error);
    return NextResponse.json(
      { error: "Failed to reset database" },
      { status: 500 }
    );
  }
}
