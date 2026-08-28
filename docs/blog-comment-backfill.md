# Blog Comment Discussion Backfill

The normal deployment workflow creates comment Discussions only for posts that
are newly public. These commands are a deliberate one-time exception for
backfilling the existing public archive.

They use the same two-phase, idempotent process as production publishing:

1. `commentThreadId` is written to each eligible post before a GitHub
   Discussion is created.
2. Each thread marker is searched before creation, then its immutable GitHub
   `discussionId` is written back to frontmatter.

The backfill commands are safe previews by default. They cannot modify posts
or create GitHub Discussions unless `--apply` is supplied.

## Review sequence

First inspect the eligible public posts without changing local files or GitHub:

```sh
pnpm discussions:backfill:prepare
```

When ready, create and commit only the stable thread identifiers:

```sh
pnpm discussions:backfill:prepare -- --apply
git add src/content/blog
git commit -m "chore(blog): initialize archived discussion threads"
```

Set a token with permission to create repository Discussions, then preview the
GitHub-side changes:

```sh
GITHUB_TOKEN=... pnpm discussions:backfill:provision
```

Finally, create or recover the Discussions and write their IDs:

```sh
GITHUB_TOKEN=... pnpm discussions:backfill:provision -- --apply
git add src/content/blog
git commit -m "chore(blog): link archived GitHub discussions"
```

If either apply step is interrupted, rerun that same phase. Existing thread
markers prevent duplicate Discussions. The process excludes drafts, leaves any
already-mapped post untouched, and fails on duplicate/missing mappings rather
than silently repairing them.

## Production recovery

The production workflow can be run manually from GitHub Actions. For a retry
of the latest publication, leave **discussion_base_sha** empty. To recover an
older failed publication, supply the SHA of the commit immediately before the
publication. This preserves the new-post-only policy while allowing the
workflow to identify that exact publication again.
