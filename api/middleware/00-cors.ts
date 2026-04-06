import { defineEventHandler, handleCors } from "h3";

const ALLOWED_ORIGINS = [
  "https://gakushu.now",
  "http://localhost:3000",
];

export default defineEventHandler((event) => {
  const handled = handleCors(event, {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  if (handled) {
    return handled;
  }
});
