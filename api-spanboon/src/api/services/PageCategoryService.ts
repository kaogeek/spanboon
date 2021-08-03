/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { PageCategory } from '../models/PageCategory';
import { PageCategoryRepository } from '../repositories/PageCategoryRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';
import { S3Service } from '../services/S3Service';

@Service()
export class PageCategoryService {

    constructor(@OrmRepository() private pageCategoryRepository: PageCategoryRepository, private s3Service: S3Service) { }

    // find PageCategory
    public find(findCondition: any, options?: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await this.pageCategoryRepository.find(findCondition);

                if (result && options && options.signURL) {
                    for (const category of result) {
                        if (category.s3IconURL && category.s3IconURL !== '') {
                            try {
                                const signUrl = await this.s3Service.getSignedUrl(category.s3IconURL);
                                Object.assign(category, { iconSignURL: (signUrl ? signUrl : '') });
                            } catch (error) {
                                console.log('Search PageCategory Error: ', error);
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

    // find PageCategory
    public findOne(findCondition: any): Promise<any> {
        return this.pageCategoryRepository.findOne(findCondition);
    }

    // create PageCategory
    public async create(pageCategory: PageCategory): Promise<PageCategory> {
        return await this.pageCategoryRepository.save(pageCategory);
    }

    // update PageCategory
    public async update(query: any, newValue: any): Promise<any> {
        return await this.pageCategoryRepository.updateOne(query, newValue);
    }

    // delete PageCategory
    public async delete(query: any, options?: any): Promise<any> {
        return await this.pageCategoryRepository.deleteOne(query, options);
    }

    // Search PageCategory
    public search(filter: SearchFilter, options?: any): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy);

        if (filter.count) {
            return this.pageCategoryRepository.count(condition);
        } else {
            return this.find(condition, options);
        }
    }
}
