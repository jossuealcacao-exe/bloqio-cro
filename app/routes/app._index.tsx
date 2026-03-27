import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import styles from "./_index/styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
            demoInfo: metafield(namespace: "$app", key: "demo_info") {
              jsonValue
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
          metafields: [
            {
              namespace: "$app",
              key: "demo_info",
              value: "Created by React Router Template",
            },
          ],
        },
      },
    },
  );
  const responseJson = await response.json();

  const product = responseJson.data!.productCreate!.product!;
  const variantId = product.variants.edges[0]!.node!.id!;

  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyReactRouterTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );

  const variantResponseJson = await variantResponse.json();

  const metaobjectResponse = await admin.graphql(
    `#graphql
    mutation shopifyReactRouterTemplateUpsertMetaobject($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
      metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
        metaobject {
          id
          handle
          title: field(key: "title") {
            jsonValue
          }
          description: field(key: "description") {
            jsonValue
          }
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        handle: {
          type: "$app:example",
          handle: "demo-entry",
        },
        metaobject: {
          fields: [
            { key: "title", value: "Demo Entry" },
            {
              key: "description",
              value:
                "This metaobject was created by the Shopify app template to demonstrate the metaobject API.",
            },
          ],
        },
      },
    },
  );

  const metaobjectResponseJson = await metaobjectResponse.json();

  return {
    product: responseJson!.data!.productCreate!.product,
    variant:
      variantResponseJson!.data!.productVariantsBulkUpdate!.productVariants,
    metaobject:
      metaobjectResponseJson!.data!.metaobjectUpsert!.metaobject,
  };
};

export default function Index() {
  return (
    <s-page heading="Bloqio CRO TopBar">
      <s-button
        slot="primary-action"
        href="shopify://admin/themes/current/editor?context=apps"
      >
        Open Theme Editor
      </s-button>

      <div className={styles.layout}>
        <s-section>
          <div className={styles.hero}>
            <h1 className={styles.heroTitle}>Bloqio CRO TopBar</h1>
            <p className={styles.heroSubtitle}>
              A powerful, customizable top bar for Shopify stores to highlight
              promotions, create urgency, and drive more clicks.
              <br />
              Una top bar potente y personalizable para Shopify que destaca
              promociones, crea urgencia y genera mas clics.
            </p>
          </div>
        </s-section>

        <s-section>
          <div className={styles.moduleCard}>
            <div className={styles.moduleHeader}>
              <h2 className={styles.moduleTitle}>Bloqio CRO TopBar</h2>
              <span className={styles.status}>Released</span>
            </div>
            <p className={styles.moduleDescription}>
              Highlight promotions, add urgency with countdowns, guide shoppers
              with CTA buttons, and control visibility across your storefront.
              <br />
              Destaca promociones, agrega urgencia con countdowns, guía a tus
              visitantes con botones CTA y controla la visibilidad en tu
              storefront.
            </p>
            <div className={styles.featuresBlock}>
              <h3 className={styles.blockTitle}>What it does / Qué hace</h3>
              <ul className={styles.features}>
                <li>Primary and secondary CTA / CTA principal y secundario</li>
                <li>
                  Countdown timer for urgency / Countdown para generar urgencia
                </li>
                <li>Closable bar with persistence / Cierre persistente</li>
                <li>Mobile compact mode / Modo compacto para mobile</li>
                <li>Left or center alignment / Alineación izquierda o centrada</li>
                <li>Homepage-only visibility / Mostrar solo en home</li>
                <li>Smart scroll behavior / Scroll inteligente</li>
              </ul>
            </div>
            <div className={styles.actions}>
              <s-button href="shopify://admin/themes/current/editor?context=apps">
                Open Theme Editor
              </s-button>
              <s-button
                variant="secondary"
                href="https://help.shopify.com/en/manual/online-store/themes/customizing-themes/add-app-embed-block"
                target="_blank"
              >
                View setup guide
              </s-button>
            </div>
          </div>
        </s-section>

        <div className={styles.grid}>
          <s-section heading="Quick setup / Configuración rápida">
            <ol className={styles.steps}>
              <li>Activate the app embed / Activa el app embed</li>
              <li>
                Customize your message, CTA, countdown, and layout /
                Personaliza mensaje, CTA, countdown y layout
              </li>
              <li>
                Save and preview your storefront / Guarda y previsualiza tu
                tienda
              </li>
            </ol>
          </s-section>

          <s-section heading="Coming soon / Próximamente">
            <ul className={styles.comingSoon}>
              <li>Trust Bar</li>
              <li>Sticky Add to Cart</li>
              <li>FAQ Accordion</li>
            </ul>
          </s-section>
        </div>
      </div>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
