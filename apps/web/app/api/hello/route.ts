export async function GET() {
  return new Response(JSON.stringify({ ok: true, message: "Hello from API" }), {
    headers: { "content-type": "application/json" }
  });
}
