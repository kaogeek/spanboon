/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Asset } from '../models/Asset';
import { AssetRepository } from '../repositories/AssetRepository';
import { SearchUtil } from '../../utils/SearchUtil';

@Service()
export class AssetService {

    constructor(@OrmRepository() private assetRepository: AssetRepository) { }

    // find asset
    public async find(findCondition: any): Promise<any> {
        return await this.assetRepository.find(findCondition);
    }

    // find asset
    public findOne(findCondition: any): Promise<any> {
        return this.assetRepository.findOne(findCondition);
    }

    // create asset
    public async create(asset: Asset): Promise<Asset> {
        return await this.assetRepository.save(asset);
    }

    // update asset
    public async update(query: any, newValue: any): Promise<any> {
        return await this.assetRepository.updateOne(query, newValue);
    }

    // delete asset
    public async delete(query: any, options?: any): Promise<any> {
        return await this.assetRepository.deleteOne(query, options);
    }

    // find asset
    public findAll(): Promise<any> {
        return this.assetRepository.find();
    }

    // Search Asset
    public search(limit: number, offset: number, select: any[], relation: any, whereConditions: any, orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);

        if (count) {
            return this.assetRepository.count(condition);
        } else {
            return this.assetRepository.find(condition);
        }
    }

    /*
    public async createBase64Asset(fileName: string, data: string): Promise<Asset> {
        return new Promise((resolve, reject) => {
            if (!fileName) {
                reject('ไม่มีชื่อไฟล์');
            }

            resolve(undefined);
        });
    }
    */
}
