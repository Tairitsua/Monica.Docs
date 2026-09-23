import { getSkillFile } from "@/lib/knowledge";

type Context = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, { params }: Context): Promise<Response> {
  const { path } = await params;
  const [skillName, ...fileSegments] = path;
  const file = getSkillFile(skillName ?? "", fileSegments.join("/") || "SKILL.md");
  if (!file) {
    return new Response("Skill file not found.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  const etag = `"${file.digest}"`;
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag } });
  }

  return new Response(file.content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      ETag: etag,
    },
  });
}
