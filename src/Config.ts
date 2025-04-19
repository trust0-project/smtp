

export const AUTH_HEADER_NAME = "auth-proof";
export const DEFAULT_MAIL_PORT = 465;
export const DEFAULT_HTTP_PORT = process.env.HTTP_PORT || 443;
export const DEFAULT_PUBLIC_DOMAIN =
  process.env.PUBLIC_DOMAIN || "https://djack.email";

export const DEFAULT_DIDWEB_HOST =
  process.env.PUBLIC_DIDWEB_HOST || "djack.email";

export const REPEAT_EMAIL_EVERY_MS = 100000;

export const HOST_PK = process.env.HOST_PK;
export const HOST_SK = process.env.HOST_SK;

export const SSL_KEY_PATH = process.env.SSL_KEY_PATH;
export const SSL_CERT_PATH = process.env.SSL_CERT_PATH;

export const MAIL_PORT = process.env.MAIL_PORT;
export const CORS_ALLOW = process.env.CORS_ALLOW || '';

export const NODE_ENV = process.env.NODE_ENV || 'development';