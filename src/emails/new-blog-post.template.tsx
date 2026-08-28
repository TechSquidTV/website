/** @jsxImportSource react */

import {
  NewBlogPostEmail,
  resendTemplateVariable,
} from "@/emails/NewBlogPostEmail";

const value = resendTemplateVariable;

/**
 * Upload this file to Resend with the React Email CLI. The rendered HTML keeps
 * each `{{{VARIABLE}}}` placeholder for Resend to replace at send time.
 */
export default function NewBlogPostTemplate() {
  return (
    <NewBlogPostEmail
      articleUrl={value("POST_URL")}
      category={value("POST_CATEGORY")}
      description={value("POST_DESCRIPTION")}
      featureImageAlt={value("POST_IMAGE_ALT")}
      featureImageUrl={value("POST_IMAGE_URL")}
      introduction={value("EDITOR_NOTE")}
      preheader={value("PREHEADER")}
      publishedOn={value("POST_PUBLISHED_ON")}
      readTime={value("POST_READ_TIME")}
      relatedPost={{
        description: value("RELATED_POST_DESCRIPTION"),
        title: value("RELATED_POST_TITLE"),
        url: value("RELATED_POST_URL"),
      }}
      siteUrl={value("SITE_URL")}
      takeaways={[
        value("TAKEAWAY_ONE"),
        value("TAKEAWAY_TWO"),
        value("TAKEAWAY_THREE"),
      ]}
      title={value("POST_TITLE")}
      unsubscribeUrl={value("UNSUBSCRIBE_LINK")}
    />
  );
}
