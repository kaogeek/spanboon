/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { StandardItem } from '../models/StandardItem';
import { StandardItemRepository } from '../repositories/StandardItemRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';
import { S3Service } from '../services/S3Service';

@Service()
export class StandardItemService {

    constructor(@OrmRepository() private standardItemRepository: StandardItemRepository, private s3Service: S3Service) { }

    // find standardItem
    public async find(findCondition: any): Promise<StandardItem[]> {
        return await this.standardItemRepository.find(findCondition);
    }

    // find standardItem
    public findOne(findCondition: any, options?: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await this.standardItemRepository.findOne(findCondition);
                if (result && options && options.signURL) {
                    if (result.s3ImageURL && result.s3ImageURL !== '') {
                        try {
                            const signUrl = await this.s3Service.getSignedUrl(result.s3ImageURL);
                            Object.assign(result, { signURL: (signUrl ? signUrl : '') });
                        } catch (error) {
                            console.log('StandardItem Find one Error: ', error);
                        }
                    }
                }
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    // create standardItem
    public async create(standardItem: StandardItem): Promise<StandardItem> {
        return await this.standardItemRepository.save(standardItem);
    }

    // update standardItem
    public async update(query: any, newValue: any): Promise<any> {
        return await this.standardItemRepository.updateOne(query, newValue);
    }

    // delete standardItem
    public async delete(query: any, options?: any): Promise<any> {
        return await this.standardItemRepository.deleteOne(query, options);
    }

    // find standardItem
    public aggregate(query: any, options?: any): Promise<any> {
        return this.standardItemRepository.aggregate(query, options).toArray();
    }

    // Search StandardItem
    public search(filter: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy);

        if (filter.count) {
            return this.standardItemRepository.count(condition);
        } else {
            return this.standardItemRepository.find(condition);
        }
    }
}
