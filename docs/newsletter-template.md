# New blog post newsletter

The newsletter is a hosted Resend template. Its visual source lives in
`src/emails/NewBlogPostEmail.tsx`; the upload-ready entry point is
`src/emails/new-blog-post.template.tsx`.

Create or update the hosted template from the repository, then publish it in
Resend before sending:

```sh
npx react-email@latest resend setup
npx resend@latest templates create \
  --name "New blog post" \
  --subject "New: {{{POST_TITLE}}}" \
  --react-email ./src/emails/new-blog-post.template.tsx
```

Use these case-sensitive string variables when configuring the template. Do
not use the reserved Resend names `EMAIL`, `FIRST_NAME`, `LAST_NAME`, or
`UNSUBSCRIBE_URL`.

| Variable                   | Purpose                                                      |
| -------------------------- | ------------------------------------------------------------ |
| `PREHEADER`                | Concise inbox-preview copy that complements the subject.     |
| `EDITOR_NOTE`              | Short personal introduction explaining why the post matters. |
| `POST_CATEGORY`            | One or two relevant categories.                              |
| `POST_PUBLISHED_ON`        | Human-readable publication date.                             |
| `POST_READ_TIME`           | Reading time, such as `8 min read`.                          |
| `POST_TITLE`               | Article title.                                               |
| `POST_DESCRIPTION`         | One-paragraph article description.                           |
| `POST_URL`                 | Absolute article URL.                                        |
| `POST_IMAGE_URL`           | Absolute, publicly accessible feature image URL.             |
| `POST_IMAGE_ALT`           | Concise image description.                                   |
| `TAKEAWAY_ONE`             | First key takeaway.                                          |
| `TAKEAWAY_TWO`             | Second key takeaway.                                         |
| `TAKEAWAY_THREE`           | Third key takeaway.                                          |
| `RELATED_POST_TITLE`       | Title of one related archive post.                           |
| `RELATED_POST_DESCRIPTION` | Short related-post description.                              |
| `RELATED_POST_URL`         | Absolute related-post URL.                                   |
| `SITE_URL`                 | `https://www.techsquidtv.com`                                |
| `UNSUBSCRIBE_LINK`         | The provider-generated unsubscribe URL.                      |

The upload-ready entry always includes one related post. That is intentional:
it avoids a blank visual section and keeps every send focused on one secondary
link. The hosted template must be published before its ID or alias can be used
in `resend.emails.send({ template: { id, variables } })`.
