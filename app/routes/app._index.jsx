import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  DataTable,
} from "@shopify/polaris";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const submissions = await prisma.submission.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
  });

  return json({ submissions });
};

export default function Index() {
  const { submissions } = useLoaderData();

  const rows = submissions.map((sub) => [
    new Date(sub.createdAt).toLocaleDateString(),
    sub.fullName,
    sub.phone,
    sub.city,
    sub.quantity.toString(),
    sub.draftOrderId ? `#${sub.draftOrderId}` : "-",
  ]);

  return (
    <Page title="Dashboard - Express Form COD">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Recent COD Submissions
              </Text>

              {submissions.length === 0 ? (
                <Text as="p" variant="bodyMd">
                  No submissions yet. Submissions will appear here once customers use the form on your store.
                </Text>
              ) : (
                <DataTable
                  columnContentTypes={[
                    "text",
                    "text",
                    "text",
                    "text",
                    "numeric",
                    "text",
                  ]}
                  headings={[
                    "Date",
                    "Customer",
                    "Phone",
                    "City",
                    "Quantity",
                    "Draft Order ID",
                  ]}
                  rows={rows}
                />
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
