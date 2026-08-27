import { defineMiddleware } from "astro:middleware";

const PRIMARY_ORIGIN = "https://techsquidtv.com";

export const onRequest = defineMiddleware((context, next) => {
  if (context.url.hostname !== "www.techsquidtv.com") {
    return next();
  }

  return Response.redirect(
    new URL(`${context.url.pathname}${context.url.search}`, PRIMARY_ORIGIN),
    301,
  );
});
