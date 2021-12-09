/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

export const PLATFORM_NAME_TH = 'สะพานบุญ';
export const PLATFORM_NAME_ENG = 'Spanboon';

export const ASSET_CONFIG_NAME = {
    EXPIRE_MINUTE: 'asset.expiration.minute',
    S3_STORAGE_UPLOAD: 'asset.s3.storage.upload',
    S3_SIGN_EXPIRING_SEC: 'asset.s3.sign.expires.sec'
};

export const DEFAULT_ASSET_CONFIG_VALUE = {
    EXPIRE_MINUTE: 60,
    S3_STORAGE_UPLOAD: false,
    S3_SIGN_EXPIRING_SEC: 3600 // 1 hour
};

export const USER_EXPIRED_TIME_CONFIG = 'user.expiration.time';
export const DEFAULT_USER_EXPIRED_TIME = 30; // as day
export const JOB_BEFORE_TOKEN_EXPIRE_MINUTE = 'job.beforeTokenExpire.minute';
export const DEFAULT_JOB_BEFORE_TOKEN_EXPIRE_MINUTE = 2880; // 2 days
export const MAIN_PAGE_SEARCH_OFFICIAL_POST_ONLY = 'page.main.searchOfficialPostOnly';
export const DEFAULT_MAIN_PAGE_SEARCH_OFFICIAL_POST_ONLY = false;