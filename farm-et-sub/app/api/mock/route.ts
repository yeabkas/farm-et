export async function GET() {
  return new Response(JSON.stringify({ message: "Mock API route is working" }), {
    headers: { "Content-Type": "application/json" },
  });
}
