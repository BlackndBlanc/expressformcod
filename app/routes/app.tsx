import type { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { Frame, Navigation } from "@shopify/polaris";
import { HomeIcon, SettingsIcon } from "@shopify/polaris-icons";

import { authenticate } from "../shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return { shop: new URL(request.url).searchParams.get("shop") };
}

export default function AppLayout() {
  const navigate = useNavigate();
  const { shop } = useLoaderData<typeof loader>();

  return (
    <Frame
      navigation={
        <Navigation location="/app">
          <Navigation.Section
            items={[
              {
                label: "Dashboard",
                icon: HomeIcon,
                onClick: () => navigate("/app")
              },
              {
                label: "Settings",
                icon: SettingsIcon,
                onClick: () => navigate("/app/settings")
              }
            ]}
          />
        </Navigation>
      }
    >
      <Outlet context={{ shop }} />
    </Frame>
  );
}
