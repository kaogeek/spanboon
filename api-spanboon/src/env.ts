/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

import * as pkg from '../package.json';
import {
    getOsEnv, getOsEnvOptional, getOsPath, getOsPaths, normalizePort, toBool, toNumber
} from './lib/env';

/**
 * Load .env file or for tests the .env.test file.
 */
dotenv.config(
    {
        path: path.join(process.cwd(), `.env${((!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ? '' : '.' + process.env.NODE_ENV)}`),
    }
);

/**
 * Environment variables
 */
export const env = {
    node: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
    isDevelopment: process.env.NODE_ENV === 'development',
    app: {
        name: getOsEnv('APP_NAME'),
        version: (pkg as any).version,
        description: (pkg as any).description,
        host: getOsEnv('APP_HOST'),
        schema: getOsEnv('APP_SCHEMA'),
        routePrefix: getOsEnv('APP_ROUTE_PREFIX'),
        port: normalizePort(process.env.PORT || getOsEnv('APP_PORT')),
        sslport: normalizePort(process.env.SSLPORT || getOsEnv('APP_SSLPORT')),
        banner: toBool(getOsEnv('APP_BANNER')),
        dirs: {
            migrations: getOsPaths('TYPEORM_MIGRATIONS'),
            migrationsDir: getOsPath('TYPEORM_MIGRATIONS_DIR'),
            entities: getOsPaths('TYPEORM_ENTITIES'),
            entitiesDir: getOsPath('TYPEORM_ENTITIES_DIR'),
            controllers: getOsPaths('CONTROLLERS'),
            middlewares: getOsPaths('MIDDLEWARES'),
            interceptors: getOsPaths('INTERCEPTORS'),
            subscribers: getOsPaths('SUBSCRIBERS'),
            resolvers: getOsPaths('RESOLVERS'),
        },
    },
    log: {
        level: getOsEnv('LOG_LEVEL'),
        json: toBool(getOsEnvOptional('LOG_JSON')),
        output: getOsEnv('LOG_OUTPUT'),
    },
    db: {
        type: getOsEnv('TYPEORM_CONNECTION'),
        host: getOsEnv('TYPEORM_HOST'),
        port: toNumber(getOsEnv('TYPEORM_PORT')),
        url: getOsEnv('TYPEORM_URL'),
        username: getOsEnvOptional('TYPEORM_USERNAME'),
        password: getOsEnvOptional('TYPEORM_PASSWORD'),
        database: getOsEnv('TYPEORM_DATABASE'),
        synchronize: toBool(getOsEnvOptional('TYPEORM_SYNCHRONIZE')),
        logging: toBool(getOsEnv('TYPEORM_LOGGING')),
    },
    apidoc: {
        enabled: toBool(getOsEnv('APIDOC_ENABLED')),
        route: getOsEnv('APIDOC_ROUTE'),
    },
    monitor: {
        enabled: toBool(getOsEnv('MONITOR_ENABLED')),
        route: getOsEnv('MONITOR_ROUTE'),
        username: getOsEnv('MONITOR_USERNAME'),
        password: getOsEnv('MONITOR_PASSWORD'),
    },
    imageserver: getOsEnv('IMAGE_SERVER'),
    storeUrl: getOsEnv('STORE_URL'),
    SECRET_KEY: getOsEnv('SECRET_KEY')
};

export const mail = {
    SERVICE: getOsEnv('MAIL_DRIVER'),
    HOST: getOsEnv('MAIL_HOST'),
    PORT: getOsEnv('MAIL_PORT'),
    SECURE: getOsEnv('MAIL_SECURE'),
    FROM: getOsEnv('MAIL_FROM'),
    AUTH: {
        user: getOsEnv('MAIL_USERNAME'),
        pass: getOsEnv('MAIL_PASSWORD'),
    },
};

// AWS S3 Access Key
export const aws_setup = {
    AWS_ACCESS_KEY_ID: getOsEnv('AWS_ACCESS_KEY_ID'),
    AWS_SECRET_ACCESS_KEY: getOsEnv('AWS_SECRET_ACCESS_KEY'),
    AWS_DEFAULT_REGION: getOsEnv('AWS_DEFAULT_REGION'),
    AWS_BUCKET: getOsEnv('AWS_BUCKET'),
};

// Facebook Setup
export const facebook_setup = {
    FACEBOOK_APP_ID: getOsEnv('FACEBOOK_APP_ID'),
    FACEBOOK_APP_SECRET: getOsEnv('FACEBOOK_APP_SECRET'),
    FACEBOOK_TEST_APP_ID: getOsEnv('FACEBOOK_TEST_APP_ID'),
    FACEBOOK_TEST_APP_SECRET: getOsEnv('FACEBOOK_TEST_APP_SECRET'),
    FACEBOOK_COOKIE: getOsEnv('FACEBOOK_COOKIE'),
    FACEBOOK_XFBML: getOsEnv('FACEBOOK_XFBML'),
    FACEBOOK_VERSION: getOsEnv('FACEBOOK_VERSION'),
};

// Google Setup
export const google_setup = {
    GOOGLE_CLIENT_ID: getOsEnv('GOOGLE_CLIENT_ID'),
    GOOGLE_CLIENT_SECRET: getOsEnv('GOOGLE_CLIENT_SECRET'),
    GOOGLE_REDIRECT_URL: getOsEnv('GOOGLE_REDIRECT_URL'),
    GOOGLE_SCOPES: getOsEnv('GOOGLE_SCOPES')
};

// Twitter Setup
export const twitter_setup = {
    TWITTER_API_KEY: getOsEnv('TWITTER_API_KEY'),
    TWITER_API_SECRET_KEY: getOsEnv('TWITER_API_SECRET_KEY'),
    TWITTER_BEARER_TOKEN: getOsEnv('TWITTER_BEARER_TOKEN'),
    TWITTER_ACCESS_TOKEN: getOsEnv('TWITTER_ACCESS_TOKEN'),
    TWITTER_TOKEN_SECRET: getOsEnv('TWITTER_TOKEN_SECRET')
};

// Spanboon Web Setup
export const spanboon_web = {
    ROOT_URL: getOsEnv('SPANBOON_ROOT_URL')
};
