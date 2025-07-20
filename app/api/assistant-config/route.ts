import { NextRequest, NextResponse } from "next/server";
import { getServerSideConfig } from "../../config/server";

export async function GET(req: NextRequest) {
  try {
    const config = getServerSideConfig();

    return NextResponse.json({
      assistantId: config.assistantId,
      hasAssistantId: !!config.assistantId,
    });
  } catch (error) {
    console.error("[Assistant Config] Error:", error);
    return NextResponse.json(
      { error: "Failed to get assistant configuration" },
      { status: 500 },
    );
  }
}
