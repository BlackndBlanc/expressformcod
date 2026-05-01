import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Badge,
  BlockStack,
  Card,
  IndexTable,
  Layout,
  Page,
  Text
} from "@shopify/polaris";

import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const [submissions, total, failed] = await Promise.all([
    prisma.codSubmission.findMany({
      where: { shop: session.shop },
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    prisma.codSubmission.count({ where: { shop: session.shop } }),
    prisma.codSubmission.count({ where: { shop: session.shop, status: "FAILED" } })
  ]);

  return json({ submissions, total, failed });
}

export default function Dashboard() {
  const { submissions, total, failed } = useLoaderData<typeof loader>();

  return (
    <Page title="Express Form COD">
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Orders overview
                </Text>
                <Text as="p" variant="bodyMd">
                  Total COD submissions: {total}
                </Text>
                <Text as="p" variant="bodyMd">
                  Failed Shopify draft orders: {failed}
                </Text>
              </BlockStack>
            </Card>
            <Card padding="0">
              <IndexTable
                resourceName={{ singular: "submission", plural: "submissions" }}
                itemCount={submissions.length}
                headings={[
                  { title: "Customer" },
                  { title: "Phone" },
                  { title: "City" },
                  { title: "Quantity" },
                  { title: "Status" },
                  { title: "Draft" }
                ]}
                selectable={false}
              >
                {submissions.map((submission, index) => (
                  <IndexTable.Row id={submission.id} key={submission.id} position={index}>
                    <IndexTable.Cell>{submission.fullName}</IndexTable.Cell>
                    <IndexTable.Cell>{submission.phone}</IndexTable.Cell>
                    <IndexTable.Cell>{submission.city}</IndexTable.Cell>
                    <IndexTable.Cell>{submission.quantity}</IndexTable.Cell>
                    <IndexTable.Cell>
                      <Badge tone={submission.status === "FAILED" ? "critical" : "success"}>
                        {submission.status}
                      </Badge>
                    </IndexTable.Cell>
                    <IndexTable.Cell>{submission.draftOrderName || "-"}</IndexTable.Cell>
                  </IndexTable.Row>
                ))}
              </IndexTable>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
