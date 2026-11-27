import { test } from "node:test";
import assert from "node:assert/strict";
import handler from "./contact.js";

const valid = { topic: "new", name: "Artisan Mart QA", email: "artisanmartllc@gmail.com", company: "", phone: "", order: "", message: "Testing contact delivery." };
const request = (body, origin = "https://artisanmart.site") => new Request("https://artisanmart.site/api/contact", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify(body) });
const env = (send) => ({ CONTACT_LIMIT: { limit: async () => ({ success: true }) }, EMAIL: { send } });

test("valid inquiry is confirmed only after email sending succeeds", async () => {
  let sent;
  const response = await handler.fetch(request(valid), env(async message => { sent = message; return { messageId: "test" }; }));
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.match(body.reference, /^AM-N-\d{8}-[A-F0-9]{8}$/);
  assert.equal(sent.to, "artisanmartllc@gmail.com");
  assert.equal(sent.replyTo, valid.email);
  assert.match(sent.text, /Testing contact delivery/);
});

test("delivery errors do not claim success", async () => {
  const response = await handler.fetch(request(valid), env(async () => { throw new Error("Email service down"); }));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).ok, undefined);
});

test("invalid origin and missing order are rejected", async () => {
  assert.equal((await handler.fetch(request(valid, "https://example.com"), env(async () => {}))).status, 403);
  assert.equal((await handler.fetch(request({ ...valid, topic: "existing" }), env(async () => {}))).status, 400);
});

test("new order does not require an order field", async () => {
  const { order, ...withoutOrder } = valid;
  const response = await handler.fetch(request(withoutOrder), env(async () => ({ messageId: "test" })));
  assert.equal(response.status, 200);
});
