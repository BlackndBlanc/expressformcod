import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import {
  BlockStack,
  Button,
  Card,
  Checkbox,
  FormLayout,
  Layout,
  Page,
  TextField
} from "@shopify/polaris";

import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const settings = await prisma.storeSettings.upsert({
    where: { shop: session.shop },
    update: {},
    create: { shop: session.shop }
  });

  return json({ settings });
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  await prisma.storeSettings.upsert({
    where: { shop: session.shop },
    update: {
      fullNameLabel: String(formData.get("fullNameLabel") || "Full name"),
      phoneLabel: String(formData.get("phoneLabel") || "Phone"),
      cityLabel: String(formData.get("cityLabel") || "City"),
      addressLabel: String(formData.get("addressLabel") || "Address"),
      quantityLabel: String(formData.get("quantityLabel") || "Quantity"),
      buttonText: String(formData.get("buttonText") || "Order with cash on delivery"),
      successMessage: String(formData.get("successMessage") || "Thank you. We received your order."),
      isEnabled: formData.get("isEnabled") === "on"
    },
    create: {
      shop: session.shop,
      fullNameLabel: String(formData.get("fullNameLabel") || "Full name"),
      phoneLabel: String(formData.get("phoneLabel") || "Phone"),
      cityLabel: String(formData.get("cityLabel") || "City"),
      addressLabel: String(formData.get("addressLabel") || "Address"),
      quantityLabel: String(formData.get("quantityLabel") || "Quantity"),
      buttonText: String(formData.get("buttonText") || "Order with cash on delivery"),
      successMessage: String(formData.get("successMessage") || "Thank you. We received your order."),
      isEnabled: formData.get("isEnabled") === "on"
    }
  });

  return redirect("/app/settings");
}

export default function SettingsPage() {
  const { settings } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSaving = navigation.state === "submitting";
  const [formState, setFormState] = useState({
    isEnabled: settings.isEnabled,
    fullNameLabel: settings.fullNameLabel,
    phoneLabel: settings.phoneLabel,
    cityLabel: settings.cityLabel,
    addressLabel: settings.addressLabel,
    quantityLabel: settings.quantityLabel,
    buttonText: settings.buttonText,
    successMessage: settings.successMessage
  });
  const updateField = (field: keyof typeof formState) => (value: string | boolean) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  return (
    <Page title="COD form settings">
      <Layout>
        <Layout.Section>
          <Card>
            <Form method="post">
              <BlockStack gap="400">
                <Checkbox
                  label="Enable COD form on product pages"
                  name="isEnabled"
                  checked={formState.isEnabled}
                  onChange={updateField("isEnabled")}
                />
                <FormLayout>
                  <TextField label="Full name label" name="fullNameLabel" value={formState.fullNameLabel} onChange={updateField("fullNameLabel")} autoComplete="off" />
                  <TextField label="Phone label" name="phoneLabel" value={formState.phoneLabel} onChange={updateField("phoneLabel")} autoComplete="off" />
                  <TextField label="City label" name="cityLabel" value={formState.cityLabel} onChange={updateField("cityLabel")} autoComplete="off" />
                  <TextField label="Address label" name="addressLabel" value={formState.addressLabel} onChange={updateField("addressLabel")} autoComplete="off" />
                  <TextField label="Quantity label" name="quantityLabel" value={formState.quantityLabel} onChange={updateField("quantityLabel")} autoComplete="off" />
                  <TextField label="Button text" name="buttonText" value={formState.buttonText} onChange={updateField("buttonText")} autoComplete="off" />
                  <TextField
                    label="Success message"
                    name="successMessage"
                    value={formState.successMessage}
                    onChange={updateField("successMessage")}
                    autoComplete="off"
                  />
                </FormLayout>
                <Button submit variant="primary" loading={isSaving}>
                  Save settings
                </Button>
              </BlockStack>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
