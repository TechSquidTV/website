// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "TechSquidTV";
export const SITE_DESCRIPTION =
  "Open-source developer and tech educator, Kyle A.K.A TechSquidTV. Software development tutorials, videos, and fun code experiments.";

// Personal Information
export const PERSONAL_INFO = {
  name: "Kyle Tryon",
  username: "TechSquidTV",
  website: "https://www.techsquidtv.com",
  email: "kyle@techsquidtv.com",
  jobTitle: "Developer Advocate & Content Creator",
  company: "TechSquidTV",
  corporateRole: "Developer Experience Engineer",
  corporateCompany: "Sentry",
} as const;

// Expertise Areas for Schema.org "knowsAbout"
export const EXPERTISE_AREAS = [
  "Software Development",
  "DevOps",
  "CI/CD",
  "Docker",
  "Kubernetes",
  "JavaScript",
  "TypeScript",
  "Web Development",
  "Content Creation",
  "Developer Relations",
  "Open Source",
] as const;

// Social Media Links
export const SOCIAL_LINKS = [
  {
    name: "Twitter",
    url: "https://twitter.com/techsquidtv",
    icon: "x",
    brandColor: "#FFFFFF",
  },
  {
    name: "BlueSky",
    url: "https://bsky.app/profile/techsquidtv.com",
    icon: "bluesky",
    brandColor: "#1185FE",
  },
  {
    name: "YouTube",
    url: "https://youtube.com/@techsquidtv",
    icon: "youtube",
    brandColor: "#ff0000",
  },
  {
    name: "Mastodon",
    url: "https://fosstodon.org/@techsquidtv",
    icon: "mastodon",
    brandColor: "#6364FF",
  },
  {
    name: "GitHub",
    url: "https://github.com/KyleTryon",
    icon: "github",
    brandColor: "#4078c0",
  },

  {
    name: "Discord",
    url: "https://discord.gg/x9WYxubx2j",
    icon: "discord",
    brandColor: "#5865F2",
  },

  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/kyletryon",
    icon: "linkedin",
    brandColor: "#0a66c2",
  },
  // {
  //   name: "Twitch",
  //   url: "https://www.twitch.tv/techsquidtv",
  //   icon: "twitch",
  //   brandColor: "#9146ff",
  // },
] as const;

export const YOUTUBE_CHANNEL_ID = "UC7vYUkA-s5XVjS7UoyGSFbg" as const;

// GPG Information
export const GPG_INFO = {
  fingerprint: "A606F9A583AD5E69738E241226BF4A861BD3AE79",
  publicKeyUrl: "/sig/A606F9A583AD5E69738E241226BF4A861BD3AE79.asc",
  publicKey:
    "-----BEGIN PGP PUBLIC KEY BLOCK-----mDMEZXTD5hYJKwYBBAHaRw8BAQdA+kI8sTWL77Fukqn0Qjlx3DY1to1BRoVkabVP9ssfzoW0RUt5bGUgVHJ5b24gKFRlY2hTcXVpZFRWIFB1YmxpYyBDb21tdW5pY2F0aW9ucykgPEt5bGVAVGVjaFNxdWlkVFYuY29tPoiTBBMWCgA7FiEEpgb5pYOtXmlzjiQSJr9KhhvTrnkFAmV0w+YCGwMFCwkIBwICIgIGFQoJCAsCBBYCAwECHgcCF4AACgkQJr9KhhvTrnn/jAEA/s3ukyueR9zC72DYOC01Uq8yNwv0/BvJFGePicHWSYMA+wVjkLEdcWiPGI1Jj7xEWDm6+L+28YeHcMiXb94Q434FuDgEZXTD5hIKKwYBBAGXVQEFAQEHQIH/WbzkY3m3vqrJikXMEoKOmbW4vFDqF+6HypdylVAiAwEIB4h4BBgWCgAgFiEEpgb5pYOtXmlzjiQSJr9KhhvTrnkFAmV0w+YCGwwACgkQJr9KhhvTrnmTPwD+I/N5n5PD+TNL6bSxS2dDQEUVJTIEl/UKFr3JJGmU0m4BAKn48IpxfhNESXsKXu62bHykydSuCV3cZD84ZGIX4G8L=oX0s-----END PGP PUBLIC KEY BLOCK-----",
} as const;
