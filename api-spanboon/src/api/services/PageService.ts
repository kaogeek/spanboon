/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Page } from '../models/Page';
import { PageRepository } from '../repositories/PageRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';
import { S3Service } from '../services/S3Service';
import { ConfigService } from './ConfigService';
import { DEFAULT_MAIN_PAGE_SEARCH_OFFICIAL_POST_ONLY, MAIN_PAGE_SEARCH_OFFICIAL_POST_ONLY } from '../../constants/SystemConfig';
import { Config } from '../models/Config';

@Service()
export class PageService {

    constructor(
        @OrmRepository() private pageRepository: PageRepository,
        private s3Service: S3Service,
        private configService: ConfigService
    ) { }

    // find page
    public find(findCondition: any, options?: any): Promise<Page[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await this.pageRepository.find(findCondition);

                if (result && options && options.signURL) {
                    for (const page of result) {
                        if (page.s3CoverURL && page.s3CoverURL !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(page.s3CoverURL);
                                Object.assign(page, { coverSignURL: (signUrl ? signUrl : '') });
                            } catch (error) {
                                console.log('Search Page Error: ', error);
                            }
                        }
                        if (page.s3ImageURL && page.s3ImageURL !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(page.s3ImageURL);
                                Object.assign(page, { signURL: (signUrl ? signUrl : '') });
                            } catch (error) {
                                console.log('Search Page Error: ', error);
                            }
                        }
                    }
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    // find page
    public findOne(findCondition: any, options?: any): Promise<Page> {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await this.pageRepository.findOne(findCondition);

                if (result && options && options.signURL) {
                    if (result.s3ImageURL && result.s3ImageURL !== '') {
                        try {
                            const signUrl = await this.s3Service.getConfigedSignedUrl(result.s3ImageURL);
                            Object.assign(result, { signURL: (signUrl ? signUrl : '') });
                        } catch (error) {
                            console.log('Page Find one Error: ', error);
                        }
                    }
                    if (result.s3CoverURL && result.s3CoverURL !== '') {
                        try {
                            const signUrl = await this.s3Service.getConfigedSignedUrl(result.s3CoverURL);
                            Object.assign(result, { coverSignURL: (signUrl ? signUrl : '') });
                        } catch (error) {
                            console.log('Page Find one Error: ', error);
                        }
                    }
                }
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }
    public async findAll(findCondition?: any): Promise<any> {
        return await this.pageRepository.find(findCondition);
    }

    // find page
    public aggregate(query: any, options?: any): Promise<Page[]> {
        return this.pageRepository.aggregate(query, options).toArray();
    }

    public aggregateP(query: any, options?: any): Promise<any> {
        return this.pageRepository.aggregate(query, options).toArray();
    }

    // create page
    public async create(page: Page): Promise<Page> {
        return await this.pageRepository.save(page);
    }

    // update page
    public async update(query: any, newValue: any): Promise<any> {
        return await this.pageRepository.updateOne(query, newValue);
    }

    // delete page
    public async delete(query: any, options?: any): Promise<any> {
        return await this.pageRepository.deleteOne(query, options);
    }

    public async deleteMany(query: any, options?: any): Promise<any> {
        return await this.pageRepository.deleteMany(query, options);
    }

    // Search Page
    public search(filter: SearchFilter, options?: any): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy);

        if (filter.count) {
            return this.pageRepository.count(filter.whereConditions);
        } else {
            return this.find(condition, options);
        }
    }

    public async searchPageOfficialConfig(): Promise<any> {
        const result: any = {
            searchOfficialOnly: DEFAULT_MAIN_PAGE_SEARCH_OFFICIAL_POST_ONLY
        };

        const config: Config = await this.configService.getConfig(MAIN_PAGE_SEARCH_OFFICIAL_POST_ONLY);
        if (config !== undefined) {
            if (typeof config.value === 'boolean') {
                result.searchOfficialOnly = config.value;
            } else if (typeof config.value === 'string') {
                result.searchOfficialOnly = (config.value.toUpperCase() === 'TRUE');
            }
        }

        return result;
    }

    public async searchPageCategory(): Promise<any> {
        const result: any = {
            searchOfficialOnly: DEFAULT_MAIN_PAGE_SEARCH_OFFICIAL_POST_ONLY
        };

        const config: Config = await this.configService.getConfig(MAIN_PAGE_SEARCH_OFFICIAL_POST_ONLY);
        if (config !== undefined) {
            if (typeof config.value === 'boolean') {
                result.searchOfficialOnly = config.value;
            } else if (typeof config.value === 'string') {
                result.searchOfficialOnly = (config.value.toUpperCase() === 'TRUE');
            }
        }

        return result;
    }
}
