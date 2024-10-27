declare namespace NodeJS {
  interface ProcessEnv {
    PORT: number;
    CONNECT_STRING: string;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    SMTP_HOST: string;
    SMTP_PORT: number;
    SMTP_USER: string;
    SMTP_PASSWORD: string;
    API_URL: string;
    CLIENT_URL: string;
    CRYPTO_SECRET_KEY: string;
    CRYPTO_ALGORITHM: string;
  }
}
