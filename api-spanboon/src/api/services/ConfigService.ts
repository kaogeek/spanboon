/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { SearchUtil } from '../../utils/SearchUtil';
import { Config } from '../models/Config';
import { ConfigRepository } from '../repositories/ConfigRepository';
import { MAIN_PAGE_SEARCH_OFFICIAL_POST_ONLY, DEFAULT_MAIN_PAGE_SEARCH_OFFICIAL_POST_ONLY, USER_EXPIRED_TIME_CONFIG, DEFAULT_USER_EXPIRED_TIME, JOB_BEFORE_TOKEN_EXPIRE_MINUTE, DEFAULT_JOB_BEFORE_TOKEN_EXPIRE_MINUTE, ASSET_CONFIG_NAME, DEFAULT_ASSET_CONFIG_VALUE, SEARCH_ENGAGEMENT_ACCESSIBLE_DATE, DEFAULT_SEARCH_ENGAGEMENT_ACCESSIBLE_DATE } from '../../constants/SystemConfig';

@Service()
export class ConfigService {
    constructor(@OrmRepository() private configRepository: ConfigRepository) { }

    // create config
    public async create(config: any): Promise<any> {
        return await this.configRepository.save(config);
    }

    // find one config
    public async findOne(config: any): Promise<any> {
        return await this.configRepository.findOne(config);
    }
    public async find(findCondition: any):  Promise<any> {
        return await this.configRepository.find(findCondition);
    }
    // find all config
    public async findAll(): Promise<Config[]> {
        return await this.configRepository.find();
    }

    // edit config
    public async update(query: any, newValue: any): Promise<any> {
        return await this.configRepository.updateOne(query, newValue);
    }

    public async getConfig(name: string): Promise<any> {
        const condition = { name };
        return await this.configRepository.findOne(condition);
    }

    // config List
    public async search(limit: number, offset: number, select: any = [], relation: any[], whereConditions: any = [], orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);
        if (count) {
            return await this.configRepository.count(condition);
        } else {
            return await this.configRepository.find(condition);
        }
    }

    // delete config
    public async delete(query: any, options?: any): Promise<any> {
        return await this.configRepository.deleteOne(query, options);
    }

    public async initialConfig(): Promise<void> {
        const searchOfficialCfg = await this.getConfig(MAIN_PAGE_SEARCH_OFFICIAL_POST_ONLY);

        if (searchOfficialCfg === null || searchOfficialCfg === undefined) {
            const config: Config = new Config();
            config.name = MAIN_PAGE_SEARCH_OFFICIAL_POST_ONLY;
            config.value = DEFAULT_MAIN_PAGE_SEARCH_OFFICIAL_POST_ONLY + '';
            config.type = 'number';

            this.create(config);
        }

        const userExpireTimeCfg = await this.getConfig(USER_EXPIRED_TIME_CONFIG);

        if (userExpireTimeCfg === null || userExpireTimeCfg === undefined) {
            const config: Config = new Config();
            config.name = USER_EXPIRED_TIME_CONFIG;
            config.value = DEFAULT_USER_EXPIRED_TIME + '';
            config.type = 'number';

            this.create(config);
        }

        const jobBeforeTokenExpCfg = await this.getConfig(JOB_BEFORE_TOKEN_EXPIRE_MINUTE);

        if (jobBeforeTokenExpCfg === null || jobBeforeTokenExpCfg === undefined) {
            const config: Config = new Config();
            config.name = JOB_BEFORE_TOKEN_EXPIRE_MINUTE;
            config.value = DEFAULT_JOB_BEFORE_TOKEN_EXPIRE_MINUTE + '';
            config.type = 'number';

            this.create(config);
        }

        const assetExpireCfg = await this.getConfig(ASSET_CONFIG_NAME.EXPIRE_MINUTE);

        if (assetExpireCfg === null || assetExpireCfg === undefined) {
            const config: Config = new Config();
            config.name = ASSET_CONFIG_NAME.EXPIRE_MINUTE;
            config.value = DEFAULT_ASSET_CONFIG_VALUE.EXPIRE_MINUTE + '';
            config.type = 'number';

            this.create(config);
        }

        const assetUploadToS3Cfg = await this.getConfig(ASSET_CONFIG_NAME.S3_STORAGE_UPLOAD);
        if (assetUploadToS3Cfg === null || assetUploadToS3Cfg === undefined) {
            const config: Config = new Config();
            config.name = ASSET_CONFIG_NAME.S3_STORAGE_UPLOAD;
            config.value = DEFAULT_ASSET_CONFIG_VALUE.S3_STORAGE_UPLOAD ? 'TRUE' : 'FALSE';
            config.type = 'boolean';

            this.create(config);
        }

        const assetS3ExpireCfg = await this.getConfig(ASSET_CONFIG_NAME.EXPIRE_MINUTE);

        if (assetS3ExpireCfg === null || assetS3ExpireCfg === undefined) {
            const config: Config = new Config();
            config.name = ASSET_CONFIG_NAME.S3_SIGN_EXPIRING_SEC;
            config.value = DEFAULT_ASSET_CONFIG_VALUE.S3_SIGN_EXPIRING_SEC + '';
            config.type = 'number';

            this.create(config);
        }

        const searchEngagementAcccDateCfg = await this.getConfig(SEARCH_ENGAGEMENT_ACCESSIBLE_DATE);

        if (searchEngagementAcccDateCfg === null || searchEngagementAcccDateCfg === undefined) {
            const config: Config = new Config();
            config.name = SEARCH_ENGAGEMENT_ACCESSIBLE_DATE;
            config.value = DEFAULT_SEARCH_ENGAGEMENT_ACCESSIBLE_DATE + '';
            config.type = 'number';

            this.create(config);
        }
    }
}
