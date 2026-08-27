import type { CSSProperties, ReactElement } from "react";
import { EMAIL_THEME } from "@/emails/theme";

type AbsoluteUrl = `https://${string}` | `http://${string}`;
type TemplateVariable = `{{{${string}}}}`;
type UrlValue = AbsoluteUrl | TemplateVariable;

export function resendTemplateVariable<const Key extends string>(
  key: Key,
): `{{{${Key}}}}` {
  return `{{{${key}}}}`;
}

interface RelatedPost {
  description: string;
  title: string;
  url: UrlValue;
}

export interface NewBlogPostEmailProps {
  articleUrl: UrlValue;
  category: string;
  description: string;
  featureImageAlt: string;
  featureImageUrl: UrlValue;
  introduction: string;
  preheader: string;
  publishedOn: string;
  readTime: string;
  relatedPost?: RelatedPost;
  siteUrl: UrlValue;
  takeaways: readonly [string, string, string];
  title: string;
  unsubscribeUrl: UrlValue;
}

const fontFamily =
  "Outfit, ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const styles = {
  articleMeta: {
    color: EMAIL_THEME.muted,
    fontFamily,
    fontSize: "14px",
    margin: "0 0 14px",
  },
  button: {
    backgroundColor: EMAIL_THEME.foreground,
    borderRadius: "6px",
    color: EMAIL_THEME.primaryForeground,
    display: "inline-block",
    fontFamily,
    fontSize: "16px",
    fontWeight: 700,
    lineHeight: "1",
    padding: "15px 20px",
    textDecoration: "none",
  },
  container: {
    margin: "0 auto",
    maxWidth: "620px",
    width: "100%",
  },
  eyebrow: {
    color: EMAIL_THEME.muted,
    fontFamily,
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    margin: "0 0 12px",
    textTransform: "uppercase",
  },
  footer: {
    color: EMAIL_THEME.muted,
    fontFamily,
    fontSize: "12px",
    lineHeight: "1.6",
    margin: "0",
    textAlign: "center" as const,
  },
  heading: {
    color: EMAIL_THEME.foreground,
    fontFamily,
    fontSize: "32px",
    fontWeight: 700,
    letterSpacing: "-0.03em",
    lineHeight: "1.12",
    margin: "0 0 16px",
  },
  paragraph: {
    color: EMAIL_THEME.foreground,
    fontFamily,
    fontSize: "17px",
    lineHeight: "1.6",
    margin: "0 0 22px",
  },
  sectionHeading: {
    color: EMAIL_THEME.foreground,
    fontFamily,
    fontSize: "18px",
    fontWeight: 700,
    letterSpacing: "-0.01em",
    margin: "0 0 14px",
  },
} satisfies Record<string, CSSProperties>;

/**
 * The reusable newsletter sent whenever a new TechSquidTV blog post publishes.
 * All values are supplied by the publishing workflow; the visual hierarchy and
 * calls-to-action intentionally stay fixed.
 */
export function NewBlogPostEmail({
  articleUrl,
  category,
  description,
  featureImageAlt,
  featureImageUrl,
  introduction,
  preheader,
  publishedOn,
  readTime,
  relatedPost,
  siteUrl,
  takeaways,
  title,
  unsubscribeUrl,
}: NewBlogPostEmailProps): ReactElement {
  return (
    <table
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style={{ backgroundColor: EMAIL_THEME.background, width: "100%" }}
    >
      <tbody>
        <tr>
          <td style={{ padding: "32px 16px 48px" }}>
            <div
              style={{
                color: EMAIL_THEME.background,
                display: "none",
                fontSize: "1px",
                lineHeight: "1px",
                maxHeight: 0,
                maxWidth: 0,
                opacity: 0,
                overflow: "hidden",
              }}
            >
              {preheader}
            </div>
            <table
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style={styles.container}
            >
              <tbody>
                <tr>
                  <td style={{ padding: "0 4px 24px" }}>
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tbody>
                        <tr>
                          <td style={{ paddingRight: "8px" }}>
                            <a href={siteUrl} style={{ display: "block" }}>
                              <img
                                alt=""
                                height="24"
                                src="https://www.techsquidtv.com/apple-touch-icon.png"
                                style={{ display: "block" }}
                                width="24"
                              />
                            </a>
                          </td>
                          <td>
                            <a
                              href={siteUrl}
                              style={{
                                color: EMAIL_THEME.foreground,
                                fontFamily,
                                fontSize: "20px",
                                fontWeight: 700,
                                textDecoration: "none",
                              }}
                            >
                              TechSquidTV
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: "26px" }}>
                    <p style={styles.eyebrow}>Latest writing</p>
                    <p style={{ ...styles.paragraph, margin: 0 }}>
                      {introduction}
                    </p>
                    <p
                      style={{
                        ...styles.paragraph,
                        fontSize: "16px",
                        margin: "14px 0 0",
                      }}
                    >
                      — Kyle
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <img
                      alt={featureImageAlt}
                      src={featureImageUrl}
                      style={{
                        borderRadius: "6px",
                        display: "block",
                        height: "auto",
                        width: "100%",
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "24px 4px 30px" }}>
                    <p style={styles.articleMeta}>
                      {category} · {publishedOn} · {readTime}
                    </p>
                    <h1 style={styles.heading}>{title}</h1>
                    <p style={styles.paragraph}>{description}</p>
                    <a href={articleUrl} style={styles.button}>
                      Read the post →
                    </a>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      borderTop: `1px solid ${EMAIL_THEME.border}`,
                      padding: "30px 4px 0",
                    }}
                  >
                    <h2 style={styles.sectionHeading}>In this post</h2>
                    <table
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style={{ width: "100%" }}
                    >
                      <tbody>
                        {takeaways.map((takeaway, index) => (
                          <tr>
                            <td
                              style={{
                                padding:
                                  index === 0
                                    ? "0 0 10px"
                                    : index === takeaways.length - 1
                                      ? "10px 0 0"
                                      : "10px 0",
                              }}
                            >
                              <p
                                style={{
                                  ...styles.paragraph,
                                  fontSize: "15px",
                                  margin: 0,
                                }}
                              >
                                <span
                                  style={{
                                    color: EMAIL_THEME.muted,
                                    fontWeight: 700,
                                  }}
                                >
                                  0{index + 1}
                                </span>
                                <span style={{ paddingLeft: "12px" }}>
                                  {takeaway}
                                </span>
                              </p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
                {relatedPost ? (
                  <tr>
                    <td
                      style={{
                        borderTop: `1px solid ${EMAIL_THEME.border}`,
                        padding: "30px 4px 0",
                      }}
                    >
                      <p style={styles.eyebrow}>Also worth your time</p>
                      <a
                        href={relatedPost.url}
                        style={{
                          color: EMAIL_THEME.foreground,
                          fontFamily,
                          fontSize: "18px",
                          fontWeight: 700,
                          lineHeight: "1.35",
                        }}
                      >
                        {relatedPost.title}
                      </a>
                      <p
                        style={{
                          ...styles.paragraph,
                          color: EMAIL_THEME.muted,
                          fontSize: "15px",
                          margin: "6px 0 0",
                        }}
                      >
                        {relatedPost.description}
                      </p>
                    </td>
                  </tr>
                ) : null}
                <tr>
                  <td style={{ padding: "36px 4px" }}>
                    <p
                      style={{
                        ...styles.paragraph,
                        fontSize: "15px",
                        margin: 0,
                      }}
                    >
                      Have a thought or a question? Hit reply—I read every
                      message.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      borderTop: `1px solid ${EMAIL_THEME.border}`,
                      padding: "24px 4px 0",
                    }}
                  >
                    <p style={styles.footer}>
                      You’re receiving this because you subscribed to the
                      TechSquidTV newsletter.
                      <br />
                      <a
                        href={unsubscribeUrl}
                        style={{ color: EMAIL_THEME.muted }}
                      >
                        Unsubscribe
                      </a>
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
