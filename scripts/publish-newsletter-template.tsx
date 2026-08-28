/** @jsxImportSource react */

import { renderToStaticMarkup } from "react-dom/server";
import { Resend, type Response } from "resend";
import NewBlogPostTemplate from "@/emails/new-blog-post.template";
import {
  NEWSLETTER_TEMPLATE_ALIAS,
  NEWSLETTER_TEMPLATE_VARIABLES,
} from "@/emails/new-blog-post.template-variables";

const TEMPLATE_NAME = "New blog post";
const TEMPLATE_SUBJECT = "New: {{{POST_TITLE}}}";

function requiredEnvironment(name: "RESEND_API_KEY"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set to publish the newsletter template.`);
  }

  return value;
}

function unwrapResponse<T>(response: Response<T>): T {
  if (response.error) {
    throw new Error(`Resend request failed: ${response.error.message}`);
  }

  return response.data;
}

const resend = new Resend(requiredEnvironment("RESEND_API_KEY"));
const html = `<!doctype html>${renderToStaticMarkup(<NewBlogPostTemplate />)}`;
const templatePayload = {
  alias: NEWSLETTER_TEMPLATE_ALIAS,
  html,
  name: TEMPLATE_NAME,
  subject: TEMPLATE_SUBJECT,
  variables: NEWSLETTER_TEMPLATE_VARIABLES.map((variable) => ({ ...variable })),
};

const existingTemplate = await resend.templates.get(NEWSLETTER_TEMPLATE_ALIAS);

if (existingTemplate.error && existingTemplate.error.name !== "not_found") {
  throw new Error(`Resend request failed: ${existingTemplate.error.message}`);
}

const templateId = existingTemplate.data
  ? unwrapResponse(
      await resend.templates.update(existingTemplate.data.id, templatePayload),
    ).id
  : unwrapResponse(await resend.templates.create(templatePayload)).id;

unwrapResponse(await resend.templates.publish(templateId));
console.info(`Published Resend template ${NEWSLETTER_TEMPLATE_ALIAS}.`);
