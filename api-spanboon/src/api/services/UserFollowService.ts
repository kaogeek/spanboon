/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { UserFollow } from '../models/UserFollow';
import { UserFollowRepository } from '../repositories/UserFollowRepository';
import { SearchUtil } from '../../utils/SearchUtil';

@Service()
export class UserFollowService {

    constructor(@OrmRepository() private userFollowRepository: UserFollowRepository) { }

    // find userFollow
    public async find(findCondition: any): Promise<UserFollow[]> {
        return this.userFollowRepository.find(findCondition);
    }

    // find userFollow
    public findOne(findCondition: any): Promise<UserFollow> {
        return this.userFollowRepository.findOne(findCondition);
    }

    // create userFollow
    public async create(userFollow: UserFollow): Promise<UserFollow> {
        return await this.userFollowRepository.save(userFollow);
    }

    // update userFollow
    public async update(query: any, newValue: any): Promise<any> {
        return await this.userFollowRepository.updateOne(query, newValue);
    }

    // delete userFollow
    public async delete(query: any, options?: any): Promise<any> {
        return await this.userFollowRepository.deleteOne(query, options);
    }

    // aggregate userFollow
    public aggregate(query: any, options?: any): Promise<any[]> {
        return this.userFollowRepository.aggregate(query, options).toArray();
    }

    // Search UserFollow
    public search(limit: number, offset: number, select: any[], relation: any, whereConditions: any, orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);

        if (count) {
            return this.userFollowRepository.count(whereConditions);
        } else {
            return this.userFollowRepository.find(condition);
        }
    }

    public sampleUserFollow(id: string, subjectType: string, simpleCount: number): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const result = {
                    count: 0,
                    followers: []
                };

                if (id === undefined || id === null) {
                    resolve(result);
                    return;
                }

                const folStmt = { subjectId: id, subjectType };
                result.count = await this.search(undefined, undefined, undefined, undefined, folStmt, undefined, true);

                const folFiveStmt = [
                    { $match: { subjectId: id, subjectType } },
                    { $sample: { size: simpleCount } },
                    {
                        $lookup: {
                            from: 'User',
                            localField: 'userId',
                            foreignField: '_id',
                            as: 'user'
                        }
                    }
                ];
                const folFive = await this.aggregate(folFiveStmt);
                for (const fol of folFive) {
                    result.followers.push(this.parseUserField(fol.user[0]));
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    private parseUserField(user: any): any {
        const userResult: any = {};

        if (user !== undefined) {
            userResult.id = user._id;
            userResult.displayName = user.displayName;
            userResult.imageURL = user.imageURL;
            userResult.email = user.email;
            userResult.isAdmin = user.isAdmin;
            userResult.uniqueId = user.uniqueId;
            userResult.type = 'USER';
        }

        return userResult;
    }
}
