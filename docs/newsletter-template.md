# New blog post newsletter

The newsletter is a hosted Resend template. Its visual source lives in
`src/emails/NewBlogPostEmail.tsx`; the upload-ready entry point is
`src/emails/new-blog-post.template.tsx`.

The hosted template is published automatically after changes to `src/emails/**`
land on `main`. The workflow renders this source, creates the template under
the stable alias `techsquidtv-new-blog-post` on its first run, then updates and
publishes that same template on subsequent runs.

Set `RESEND_API_KEY` as a `production` GitHub environment secret with template
write access. You can also run the same release locally with
`RESEND_API_KEY=... pnpm newsletter:publish`; the key is never written to the
repository.

Use these case-sensitive string variables when configuring the template. Do
not use the reserved Resend names `EMAIL`, `FIRST_NAME`, `LAST_NAME`, or
`UNSUBSCRIBE_URL`.

`POST_URL`, `RELATED_POST_URL`, and `SITE_URL` must be canonical, query-free
URLs on `https://techsquidtv.com`. The template automatically appends
`utm_source=newsletter`; do not add UTM parameters manually.

| Variable                   | Purpose                                                      |
| -------------------------- | ------------------------------------------------------------ |
| `PREHEADER`                | Concise inbox-preview copy that complements the subject.     |
| `EDITOR_NOTE`              | Short personal introduction explaining why the post matters. |
| `POST_CATEGORY`            | One or two relevant categories.                              |
| `POST_PUBLISHED_ON`        | Human-readable publication date.                             |
| `POST_READ_TIME`           | Reading time, such as `8 min read`.                          |
| `POST_TITLE`               | Article title.                                               |
| `POST_DESCRIPTION`         | One-paragraph article description.                           |
| `POST_URL`                 | Canonical, query-free absolute article URL.                  |
| `POST_IMAGE_URL`           | Absolute, publicly accessible feature image URL.             |
| `POST_IMAGE_ALT`           | Concise image description.                                   |
| `TAKEAWAY_ONE`             | First key takeaway.                                          |
| `TAKEAWAY_TWO`             | Second key takeaway.                                         |
| `TAKEAWAY_THREE`           | Third key takeaway.                                          |
| `RELATED_POST_TITLE`       | Title of one related archive post.                           |
| `RELATED_POST_DESCRIPTION` | Short related-post description.                              |
| `RELATED_POST_URL`         | Canonical, query-free absolute related-post URL.             |
| `SITE_URL`                 | `https://techsquidtv.com`                                    |
| `UNSUBSCRIBE_LINK`         | The provider-generated unsubscribe URL.                      |

The upload-ready entry always includes one related post. That is intentional:
it avoids a blank visual section and keeps every send focused on one secondary
link. The published template can be sent with
`resend.emails.send({ template: { id: "techsquidtv-new-blog-post", variables } })`.
