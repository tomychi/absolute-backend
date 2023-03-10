declare namespace NodeJS {
  interface ProcessEnv {
    PORT: number;
    DB_HOST: string;
    DB_PORT: number;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    CLOUD_NAME: string;
    API_KEY: string;
    API_SECRET: string;
    HASH_SALT: number;
    JWT_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
  }
}
