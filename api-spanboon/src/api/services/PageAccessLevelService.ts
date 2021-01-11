/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { PageAccessLevel } from '../models/PageAccessLevel';
import { PageAccessLevelRepository } from '../repositories/PageAccessLevelRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';
import { ObjectID } from 'mongodb';

@Service()
export class PageAccessLevelService {

    constructor(@OrmRepository() private pageAccessLevelRepository: PageAccessLevelRepository, @Logger(__filename) private log: LoggerInterface) { }

    // find PageAccessLevel
    public findOne(findCondition: any): Promise<any> {
        this.log.info('Find all PageAccessLevel');
        return this.pageAccessLevelRepository.findOne(findCondition);
    }

    // create PageAccessLevel
    public async create(pageAccessLevel: PageAccessLevel): Promise<PageAccessLevel> {
        return await this.pageAccessLevelRepository.save(pageAccessLevel);
    }

    // update PageAccessLevel
    public update(query: any, newValue: any): Promise<any> {
        return this.pageAccessLevelRepository.updateOne(query, newValue);
    }

    // delete PageAccessLevel
    public async delete(query: any, options?: any): Promise<any> {
        this.log.info('Delete a PageAccessLevel');
        return await this.pageAccessLevelRepository.deleteOne(query, options);
    }

    // find PageAccessLevel
    public findAll(): Promise<any> {
        this.log.info('Find all pages');
        return this.pageAccessLevelRepository.find();
    }

    // Search Post
    public search(search: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(search.limit, search.offset, search.select, search.relation, search.whereConditions, search.orderBy);

        if (search.count) {
            return this.pageAccessLevelRepository.count();
        } else {
            return this.pageAccessLevelRepository.find(condition);
        }
    }

    public find(findCondition: any): Promise<PageAccessLevel[]> {
        return this.pageAccessLevelRepository.find(findCondition);
    }

    public getUserAccessByPage(userId: string, pageId: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (userId === undefined || userId === null || userId === '') {
                resolve([]);
                return;
            }

            if (pageId === undefined || pageId === null || pageId === '') {
                resolve([]);
                return;
            }

            try {
                const accSearchFilter = new SearchFilter();
                accSearchFilter.whereConditions = { user: new ObjectID(userId), page: new ObjectID(pageId) };
                const pageAccessResult: any[] = await this.search(accSearchFilter);

                resolve(pageAccessResult);
            } catch (error) {
                reject(error);
            }
        });
    }

    public getUserPageAccessLV(userId: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (userId === undefined || userId === null || userId === '') {
                resolve([]);
                return;
            }

            try {
                const accSearchFilter = new SearchFilter();
                accSearchFilter.whereConditions = { user: new ObjectID(userId) };
                const pageAccessResult: any[] = await this.search(accSearchFilter);

                resolve(pageAccessResult);
            } catch (error) {
                reject(error);
            }
        });
    }

    public getAllPageUserAccess(pageId: string, levels?: string[]): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (pageId === undefined || pageId === null || pageId === '') {
                resolve([]);
                return;
            }

            try {
                const accSearchFilter = new SearchFilter();
                accSearchFilter.whereConditions = { page: new ObjectID(pageId) };
                if (levels !== undefined && levels.length > 0) {
                    accSearchFilter.whereConditions.level = {
                        $in: levels
                    };
                }
                const pageAccessResult: any[] = await this.search(accSearchFilter);

                resolve(pageAccessResult);
            } catch (error) {
                reject(error);
            }
        });
    }

    public isUserHasAccessPage(userId: string, pageId: string, levels: string[]): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            if (pageId === undefined || pageId === null || pageId === '') {
                reject('Page Id was Required');
                return;
            }

            if (userId === undefined || userId === null || userId === '') {
                reject('User Id was Required');
                return;
            }

            if (levels === undefined || levels === null || levels.length <= 0) {
                resolve(false);
                return;
            }

            let canAccess = false;
            const userAccessList: PageAccessLevel[] = await this.getUserAccessByPage(userId, pageId);
            for (const access of userAccessList) {
                if (levels.indexOf(access.level) >= 0) {
                    canAccess = true;
                    break;
                }
            }

            resolve(canAccess);
        });
    }
}
