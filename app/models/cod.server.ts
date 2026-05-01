import prisma from "../db.server";

type AdminGraphqlContext = {
  graphql: (
    query: string,
    options?: { variables?: Record<string, unknown> }
  ) => Promise<Response>;
};

export type CodPayload = {
  shop: string;
  productId: string;
  variantId?: string;
  productTitle?: string;
  fullName: string;
  phone: string;
  city: string;
  address: string;
  quantity: number;
};

export function validateCodPayload(payload: Partial<CodPayload>) {
  const errors: Record<string, string> = {};
  const phone = payload.phone?.trim() || "";

  if (!payload.shop || !/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(payload.shop)) {
    errors.shop = "Invalid shop.";
  }
  if (!payload.productId) errors.productId = "Product is required.";
  if (!payload.fullName?.trim()) errors.fullName = "Full name is required.";
  if (!phone) errors.phone = "Phone is required.";
  if (phone && !/^\+?[0-9\s().-]{7,20}$/.test(phone)) errors.phone = "Phone is invalid.";
  if (!payload.city?.trim()) errors.city = "City is required.";
  if (!payload.address?.trim()) errors.address = "Address is required.";
  if (!Number.isInteger(payload.quantity) || Number(payload.quantity) < 1) {
    errors.quantity = "Quantity must be at least 1.";
  }

  return errors;
}

export async function createCodSubmission(payload: CodPayload) {
  const settings = await prisma.storeSettings.findUnique({ where: { shop: payload.shop } });

  if (!settings?.isEnabled) {
    throw new Error("COD form is disabled for this store.");
  }

  return prisma.codSubmission.create({
    data: {
      shop: payload.shop,
      productId: payload.productId,
      variantId: payload.variantId,
      productTitle: payload.productTitle,
      fullName: payload.fullName,
      phone: payload.phone,
      city: payload.city,
      address: payload.address,
      quantity: payload.quantity,
      storeSettingsId: settings.id
    }
  });
}

export async function createShopifyDraftOrder(
  admin: AdminGraphqlContext,
  submissionId: string,
  payload: CodPayload
) {
  const response = await admin.graphql(
    `#graphql
      mutation draftOrderCreate($input: DraftOrderInput!) {
        draftOrderCreate(input: $input) {
          draftOrder {
            id
            name
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        input: {
          note: "Created by Express Form COD",
          tags: ["Express Form COD", "COD"],
          customAttributes: [
            { key: "Phone", value: payload.phone },
            { key: "City", value: payload.city },
            { key: "Address", value: payload.address }
          ],
          shippingAddress: {
            firstName: payload.fullName,
            address1: payload.address,
            city: payload.city,
            phone: payload.phone
          },
          lineItems: [
            payload.variantId
              ? {
                  variantId: payload.variantId,
                  quantity: payload.quantity
                }
              : {
                  title: payload.productTitle || "COD product",
                  originalUnitPrice: "0.00",
                  quantity: payload.quantity
                }
          ]
        }
      }
    }
  );

  const result = await response.json();
  const draft = result.data?.draftOrderCreate?.draftOrder;
  const userErrors = result.data?.draftOrderCreate?.userErrors || [];

  if (!draft || userErrors.length > 0) {
    const message = userErrors.map((error: { message: string }) => error.message).join(", ") || "Draft order creation failed.";
    await prisma.codSubmission.update({
      where: { id: submissionId },
      data: { status: "FAILED", errorMessage: message }
    });
    throw new Error(message);
  }

  await prisma.codSubmission.update({
    where: { id: submissionId },
    data: {
      status: "DRAFT_CREATED",
      draftOrderId: draft.id,
      draftOrderName: draft.name
    }
  });

  return draft;
}
