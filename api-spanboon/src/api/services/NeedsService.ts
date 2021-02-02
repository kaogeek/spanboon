/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Needs } from '../models/Needs';
import { NeedsRepository } from '../repositories/NeedsRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';
import { ObjectID } from 'mongodb';

@Service()
export class NeedsService {

    constructor(@OrmRepository() private needsRepository: NeedsRepository) { }

    // find Needs
    public find(findCondition: any): Promise<Needs[]> {
        return this.needsRepository.find(findCondition);
    }

    // find Needs
    public findOne(findCondition: any): Promise<any> {
        return this.needsRepository.findOne(findCondition);
    }

    // find Needs Agg
    public aggregate(query: any, options?: any): Promise<any[]> {
        return this.needsRepository.aggregate(query, options).toArray();
    }

    // find Needs Agg
    public aggregateEntity(query: any, options?: any): Promise<Needs[]> {
        return this.needsRepository.aggregateEntity(query, options).toArray();
    }

    // create Needs
    public async create(objective: Needs): Promise<Needs> {
        return await this.needsRepository.save(objective);
    }

    // update Needs
    public async update(query: any, newValue: any): Promise<any> {
        return await this.needsRepository.updateOne(query, newValue);
    }

    // update Needs
    public async updateMany(query: any, newValue: any, options?: any): Promise<any> {
        return await this.needsRepository.updateMany(query, newValue, options);
    }

    // delete Needs
    public async delete(query: any, options?: any): Promise<any> {
        return await this.needsRepository.deleteOne(query, options);
    }

    // delete Needs
    public async deleteMany(query: any, options?: any): Promise<any> {
        return await this.needsRepository.deleteMany(query, options);
    }

    // Search Needs
    public search(filter: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy);

        if (filter.count) {
            return this.needsRepository.count(condition);
        } else {
            return this.needsRepository.find(condition);
        }
    }

    public findPostNeeds(postId: string, active?: boolean): Promise<Needs[]> {
        return this.find({ post: new ObjectID(postId), active });
    }

    public async isPostNeedsFulfilled(postId: string, active?: boolean): Promise<boolean> {
        const needs: Needs[] = await this.findPostNeeds(postId, active);

        let allFulfilled = true;
        if (needs !== undefined) {
            for (const need of needs) {
                if (need.fullfilled !== undefined) {
                    if (!need.fullfilled) {
                        allFulfilled = false;
                        break;
                    }
                } else {
                    const ffQuantity = (need.fulfillQuantity !== undefined && need.fulfillQuantity !== null) ? need.fulfillQuantity : 0;
                    const quantity = (need.quantity !== undefined && need.quantity !== null) ? need.quantity : 0;

                    if (ffQuantity < quantity) {
                        allFulfilled = false;
                        break;
                    }
                }
            }
        }

        return allFulfilled;
    }
}
