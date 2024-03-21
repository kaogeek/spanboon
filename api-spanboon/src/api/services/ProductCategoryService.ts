/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { ProductCategoryRepository } from '../repositories/ProductCategoryRepository';
@Service()
export class ProductCategoryService {

    constructor(
        @OrmRepository() private productCategoryRepository: ProductCategoryRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    // create Device token and find the user who is login !!!!!
    public async create(data: any): Promise<any> {
        this.log.info('Create a Product Category.');
        return await this.productCategoryRepository.save(data);
    }

    public async findOne(findCondition: any): Promise<any> {
        return await this.productCategoryRepository.findOne(findCondition);
    }

    public async findPeople(findCondition?: any): Promise<any> {
        return await this.productCategoryRepository.find(findCondition);
    }

    public async find(findCondition?: any): Promise<any> {
        return await this.productCategoryRepository.find(findCondition);
    }

    public async delete(query: any, options?: any): Promise<any> {
        this.log.info('Delete a Product Category.');
        return await this.productCategoryRepository.deleteOne(query, options);
    }
    public async deleteMany(query: any, options?: any): Promise<any> {
        return await this.productCategoryRepository.deleteMany(query, options);
    }
    public async update(query: any, newValue: any): Promise<any> {
        this.log.info('Update a Product Category.');

        return await this.productCategoryRepository.updateOne(query, newValue);
    }
    public async updateMany(query: any, newValue: any): Promise<any> {
        this.log.info('Update a Product Category.');

        return await this.productCategoryRepository.updateMany(query, newValue);
    }

    public async aggregate(query: any, options?: any): Promise<any[]> {
        return await this.productCategoryRepository.aggregate(query, options).toArray();
    }
}
