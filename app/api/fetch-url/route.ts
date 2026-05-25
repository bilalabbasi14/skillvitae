import { NextResponse } from "next/server";

export async function POST(_request: Request) {
  return NextResponse.json(
    { error: "Not implemented", route: "fetch-url" },
    { status: 501 }
  );
}
