// Verified inbox behind the email@artisanmart.site routing address.
const inbox = "artisanmartllc@gmail.com";
const sender = "inquiries@artisanmart.site";
const origins = new Set(["https://artisanmart.site", "https://www.artisanmart.site"]);
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
const clean = (value, limit) => typeof value === "string" && value.length <= limit ? value.trim() : null;

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname !== "/api/contact") return json({ error: "Not found" }, 404);
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
    if (!origins.has(request.headers.get("Origin"))) return json({ error: "Invalid origin" }, 403);
    if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) return json({ error: "JSON required" }, 415);
    if (Number(request.headers.get("Content-Length")) > 8000) return json({ error: "Message too large" }, 413);
    const { success } = await env.CONTACT_LIMIT.limit({ key: request.headers.get("CF-Connecting-IP") || "unknown" });
    if (!success) return json({ error: "Too many requests. Please try again later." }, 429);
    let data;
    try {
      const body = await request.text();
      if (body.length > 8000) return json({ error: "Message too large" }, 413);
      data = JSON.parse(body);
    } catch { return json({ error: "Invalid message" }, 400); }
    if (!data || typeof data !== "object" || Array.isArray(data)) return json({ error: "Invalid message" }, 400);
    if (data.website) return json({ ok: true });
    const name = clean(data.name, 120);
    const email = clean(data.email, 254);
    const company = clean(data.company, 160);
    const phone = clean(data.phone, 40);
    const order = clean(data.order, 80);
    const message = clean(data.message, 5000);
    const topic = data.topic;
    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message || !["new", "existing"].includes(topic) || (topic === "existing" && !order) || company === null || phone === null || order === null) return json({ error: "Please complete the required fields." }, 400);
    const reference = `AM-${topic === "new" ? "N" : "E"}-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const lines = [
      `Reference: ${reference}`,
      `Inquiry: ${topic === "new" ? "New order" : "Existing order"}`,
      `Name: ${name}`,
      `Email: ${email}`,
      `Company: ${company || "—"}`,
      `Phone: ${phone || "—"}`,
      `Order: ${order || "—"}`,
      "",
      "Message:",
      message,
    ];
    try {
      await env.EMAIL.send({
        to: inbox,
        from: sender,
        replyTo: email,
        subject: `[${reference}] ${topic === "new" ? "New order" : "Existing order"} inquiry`,
        text: lines.join("\n"),
      });
    } catch (error) {
      console.error("Contact delivery failed", error);
      return json({ error: "Message could not be sent. Please email us directly." }, 503);
    }
    return json({ ok: true, reference });
  },
};
