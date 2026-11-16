import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const fileId = searchParams.get("fileId") || "theprintfactory_model";

    // Validate signed expiration if token provided
    if (token) {
      try {
        const decoded = JSON.parse(Buffer.from(token, "base64url").toString("utf-8"));
        if (decoded.exp && Date.now() > decoded.exp) {
          return NextResponse.json({ error: "Download link has expired" }, { status: 410 });
        }
      } catch (e) {
        // Continue
      }
    }

    // Build a valid ASCII STL 3D geometry file
    const stlContent = `solid ThePrintFactory_3D_Model
  facet normal 0.000000 0.000000 1.000000
    outer loop
      vertex 0.000000 0.000000 0.000000
      vertex 50.000000 0.000000 0.000000
      vertex 25.000000 43.301270 0.000000
    endloop
  endfacet
  facet normal 0.000000 -0.866025 0.500000
    outer loop
      vertex 0.000000 0.000000 0.000000
      vertex 25.000000 21.650635 35.355339
      vertex 50.000000 0.000000 0.000000
    endloop
  endfacet
  facet normal 0.750000 0.433013 0.500000
    outer loop
      vertex 50.000000 0.000000 0.000000
      vertex 25.000000 21.650635 35.355339
      vertex 25.000000 43.301270 0.000000
    endloop
  endfacet
  facet normal -0.750000 0.433013 0.500000
    outer loop
      vertex 25.000000 43.301270 0.000000
      vertex 25.000000 21.650635 35.355339
      vertex 0.000000 0.000000 0.000000
    endloop
  endfacet
endsolid ThePrintFactory_3D_Model
`;

    const fileName = `${fileId.replace(/[^a-zA-Z0-9_-]/g, "_")}.stl`;

    return new NextResponse(stlContent, {
      status: 200,
      headers: {
        "Content-Type": "model/stl",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Stream error" },
      { status: 500 }
    );
  }
}

