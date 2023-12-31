export const tags = [
  "hardware",
  "linux",
  "coding",
  "technology",
  "gaming",
  "nerd",
] as const;

export type TagItem = {
  href: string;
  color: string;
};

export type ValidTags = (typeof tags)[number];

type TagMap = {
  [key in ValidTags]: TagItem;
};

export const tagMap: TagMap = {
  hardware: {
    href: "/blog/tags/hardware",
    color: "green-400",
  },
  linux: {
    href: "/blog/tags/linux",
    color: "orange-400",
  },
  coding: {
    href: "/blog/tags/coding",
    color: "blue-400",
  },
  technology: {
    href: "/blog/tags/technology",
    color: "teal-400",
  },
  gaming: {
    href: "/blog/tags/gaming",
    color: "rose-400",
  },
  nerd: {
    href: "/blog/tags/nerd",
    color: "cyan-200",
  },
};
