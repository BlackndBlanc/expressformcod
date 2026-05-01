import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import {
  createCodSubmission,
  createShopifyDraftOrder,
  validateCodPayload
} from "../models/cod.server";
import prisma from "../db.server";
import { unauthenticated } from "../shopify.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || "";

  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop)) {
    return json({ error: "Invalid shop." }, { status: 400, headers: corsHeaders });
  }

  const settings = await prisma.storeSettings.findUnique({ where: { shop } });

  return json(
    {
      settings: settings || {
        isEnabled: false,
        fullNameLabel: "Full name",
        phoneLabel: "Phone",
        cityLabel: "City",
        addressLabel: "Address",
        quantityLabel: "Quantity",
        buttonText: "Order with cash on delivery",
        successMessage: "Thank you. We received your order."
      }
    },
    { headers: corsHeaders }
  );
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const body = await request.json();
  const payload = {
    shop: String(body.shop || ""),
    productId: String(body.productId || ""),
    variantId: body.variantId ? String(body.variantId) : undefined,
    productTitle: body.productTitle ? String(body.productTitle) : undefined,
    fullName: String(body.fullName || "").trim(),
    phone: String(body.phone || "").trim(),
    city: String(body.city || "").trim(),
    address: String(body.address || "").trim(),
    quantity: Number(body.quantity || 1)
  };
  const errors = validateCodPayload(payload);

  if (Object.keys(errors).length > 0) {
    return json({ ok: false, errors }, { status: 422, headers: corsHeaders });
  }

  const submission = await createCodSubmission(payload);

  try {
    const { admin } = await unauthenticated.admin(payload.shop);
    const draft = await createShopifyDraftOrder(admin, submission.id, payload);
    return json({ ok: true, submissionId: submission.id, draftOrderName: draft.name }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create Shopify draft order.";
    return json({ ok: false, submissionId: submission.id, error: message }, { status: 500, headers: corsHeaders });
  }
}
