import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import {
    Page,
    Layout,
    Card,
    BlockStack,
    Text,
    TextField,
    Button,
    Checkbox,
    FormLayout,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    let settings = await prisma.storeSettings.findUnique({
        where: { shop },
    });

    if (!settings) {
        settings = await prisma.storeSettings.create({
            data: { shop },
        });
    }

    return json({ settings });
};

export const action = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;
    const formData = await request.formData();

    const isActive = formData.get("isActive") === "true";
    const formTitle = formData.get("formTitle");
    const buttonColor = formData.get("buttonColor");

    const settings = await prisma.storeSettings.upsert({
        where: { shop },
        update: { isActive, formTitle, buttonColor },
        create: { shop, isActive, formTitle, buttonColor },
    });

    return json({ settings, success: true });
};

export default function Settings() {
    const { settings } = useLoaderData();
    const submit = useSubmit();
    const nav = useNavigation();

    const isSaving = nav.state === "submitting";

    const [formState, setFormState] = useState({
        isActive: settings.isActive,
        formTitle: settings.formTitle,
        buttonColor: settings.buttonColor,
    });

    const handleChange = useCallback((value, id) => {
        setFormState((prev) => ({ ...prev, [id]: value }));
    }, []);

    const handleSave = () => {
        submit(
            { ...formState, isActive: formState.isActive.toString() },
            { method: "post" }
        );
    };

    return (
        <Page title="COD Form Settings">
            <Layout>
                <Layout.Section>
                    <Card>
                        <BlockStack gap="400">
                            <Text as="h2" variant="headingMd">
                                Customize your Cash on Delivery Form
                            </Text>

                            <FormLayout>
                                <Checkbox
                                    label="Enable COD Form on Product Pages"
                                    checked={formState.isActive}
                                    onChange={(val) => handleChange(val, "isActive")}
                                />

                                <TextField
                                    label="Form Title"
                                    value={formState.formTitle}
                                    onChange={(val) => handleChange(val, "formTitle")}
                                    autoComplete="off"
                                    helpText="The title displayed at the top of the COD form."
                                />

                                <TextField
                                    label="Button Color (Hex Code)"
                                    value={formState.buttonColor}
                                    onChange={(val) => handleChange(val, "buttonColor")}
                                    autoComplete="off"
                                    helpText="E.g., #000000 for black."
                                />

                                <Button loading={isSaving} variant="primary" onClick={handleSave}>
                                    Save Settings
                                </Button>
                            </FormLayout>
                        </BlockStack>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
