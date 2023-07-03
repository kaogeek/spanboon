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
import { SUBJECT_TYPE } from '../../constants/FollowType';
import { ObjectID } from 'mongodb';
import { S3Service } from './S3Service';

@Service()
export class UserFollowService {

    constructor(
        @OrmRepository() private userFollowRepository: UserFollowRepository,
        private s3Service: S3Service
    ) { }

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
    // delete Many
    public async deleteMany(query: any, options?: any): Promise<any> {
        return await this.userFollowRepository.deleteMany(query, options);
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

    public sampleUserFollow(id: any, subjectType: string, simpleCount: number): Promise<any> {
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
                    if (!!fol.s3ImageURL) {
                        const signUrl = await this.s3Service.getConfigedSignedUrl(fol.s3ImageURL);
                        Object.assign(fol, { imageSignURL: (signUrl ? signUrl : '') });
                        delete fol.s3ImageURL;
                    }

                    if (!!fol.s3CoverURL) {
                        const signUrl = await this.s3Service.getConfigedSignedUrl(fol.s3CoverURL);
                        Object.assign(fol, { coverSignURL: (signUrl ? signUrl : '') });
                        delete fol.s3CoverURL;
                    }

                    result.followers.push(this.parseUserField(fol.user[0]));
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    public getTopInfluencerUserFollow(topCount: number): Promise<any[]> {
        if (topCount === undefined) {
            topCount = 5;
        }

        return new Promise(async (resolve, reject) => {
            try {
                const aggregateStmt = [
                    { $match: { subjectType: SUBJECT_TYPE.USER } },
                    { $group: { _id: '$subjectId', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: topCount },
                    {
                        $lookup: {
                            from: 'User',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },
                    {
                        $unwind: {
                            path: '$user',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            'user.password': 0,
                            'user.coverPosition': 0,
                            'user.birthdate': 0,
                            'user.coverURL': 0,
                        }
                    }
                ];

                const result = await this.aggregate(aggregateStmt);

                for (const res of result) {
                    if (!!res.user) {
                        if (!!res.user.s3ImageURL) {
                            const signUrl = await this.s3Service.getConfigedSignedUrl(res.user.s3ImageURL);
                            Object.assign(res.user, { imageSignURL: (signUrl ? signUrl : '') });
                            delete res.user.s3ImageURL;
                        }

                        if (!!res.user.s3CoverURL) {
                            const signUrl = await this.s3Service.getConfigedSignedUrl(res.user.s3CoverURL);
                            Object.assign(res.user, { coverSignURL: (signUrl ? signUrl : '') });
                            delete res.user.s3CoverURL;
                        }
                    }
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    public getUserFollower(followedUser: ObjectID, limit?: number): Promise<any[]> {
        return this.getFollower(followedUser, SUBJECT_TYPE.USER, limit);
    }

    public getPageUserFollower(pageId: ObjectID, limit?: number): Promise<any[]> {
        return this.getFollower(pageId, SUBJECT_TYPE.PAGE, limit);
    }

    public getFollower(pageId: ObjectID, followType: string, limit?: number): Promise<any[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const aggregateStmt: any[] = [
                    { $match: { subjectId: pageId, subjectType: followType } },
                    {
                        $lookup: {
                            from: 'User',
                            localField: 'userId',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },
                    {
                        $unwind: {
                            path: '$user',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            'user.password': 0,
                            'user.coverPosition': 0,
                            'user.birthdate': 0,
                            'user.coverURL': 0,
                        }
                    }
                ];

                if (limit !== undefined) {
                    aggregateStmt.splice(1, 0, { $limit: limit });
                }

                const result = await this.aggregate(aggregateStmt);

                for (const res of result) {
                    if (!!res.user) {
                        if (!!res.user.s3ImageURL) {
                            const signUrl = await this.s3Service.getConfigedSignedUrl(res.user.s3ImageURL);
                            Object.assign(res.user, { imageSignURL: (signUrl ? signUrl : '') });
                            delete res.user.s3ImageURL;
                        }

                        if (!!res.user.s3CoverURL) {
                            const signUrl = await this.s3Service.getConfigedSignedUrl(res.user.s3CoverURL);
                            Object.assign(res.user, { coverSignURL: (signUrl ? signUrl : '') });
                            delete res.user.s3CoverURL;
                        }
                    }
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    public getFollowed(userId: ObjectID, subjectType?: string, limit?: number): Promise<any[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const matchStmt: any = {
                    userId
                };

                if (subjectType !== undefined && subjectType !== null && subjectType !== '') {
                    matchStmt.subjectType = subjectType;
                }

                const aggregateStmt: any[] = [
                    { $match: matchStmt },
                    {
                        $lookup: {
                            from: 'User',
                            localField: 'userId',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },
                    {
                        $unwind: {
                            path: '$user',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            'user.password': 0,
                            'user.coverPosition': 0,
                            'user.birthdate': 0,
                            'user.coverURL': 0,
                        }
                    }
                ];

                if (limit !== undefined) {
                    aggregateStmt.splice(1, 0, { $limit: limit });
                }

                const result = await this.aggregate(aggregateStmt);

                for (const res of result) {
                    if (!!res.user) {
                        if (!!res.user.s3ImageURL) {
                            const signUrl = await this.s3Service.getConfigedSignedUrl(res.user.s3ImageURL);
                            Object.assign(res.user, { imageSignURL: (signUrl ? signUrl : '') });
                            delete res.user.s3ImageURL;
                        }

                        if (!!res.user.s3CoverURL) {
                            const signUrl = await this.s3Service.getConfigedSignedUrl(res.user.s3CoverURL);
                            Object.assign(res.user, { coverSignURL: (signUrl ? signUrl : '') });
                            delete res.user.s3CoverURL;
                        }
                    }
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    public getTopInfluencerPageFollow(topCount: number): Promise<any[]> {
        if (topCount === undefined) {
            topCount = 5;
        }

        return new Promise(async (resolve, reject) => {
            try {
                const aggregateStmt = [
                    { $match: { subjectType: SUBJECT_TYPE.PAGE } },
                    { $group: { _id: '$subjectId', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: topCount },
                    {
                        $lookup: {
                            from: 'Page',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'page'
                        }
                    },
                    {
                        $unwind: {
                            path: '$page',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            'page.coverPosition': 0
                        }
                    }
                ];

                const result = await this.aggregate(aggregateStmt);

                for (const res of result) {
                    if (!!res.page) {
                        if (!!res.page.s3ImageURL) {
                            const signUrl = await this.s3Service.getConfigedSignedUrl(res.page.s3ImageURL);
                            Object.assign(res.page, { imageSignURL: (signUrl ? signUrl : '') });
                            delete res.page.s3ImageURL;
                        }

                        if (!!res.page.s3CoverURL) {
                            const signUrl = await this.s3Service.getConfigedSignedUrl(res.page.s3CoverURL);
                            Object.assign(res.page, { coverSignURL: (signUrl ? signUrl : '') });
                            delete res.page.s3CoverURL;
                        }
                    }
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    private async parseUserField(user: any): Promise<any> {
        const userResult: any = {};

        if (!!user) {
            let imageSignURL;
            let coverSignURL;

            if (!!user.s3ImageURL) {
                imageSignURL = await this.s3Service.getConfigedSignedUrl(user.s3ImageURL);
            }

            if (!!user.s3CoverURL) {
                coverSignURL = await this.s3Service.getConfigedSignedUrl(user.s3CoverURL);
            }

            userResult.id = user._id;
            userResult.displayName = user.displayName;
            userResult.imageURL = user.imageURL;
            userResult.coverURL = user.coverURL;
            userResult.imageSignURL = imageSignURL;
            userResult.coverURL = coverSignURL;
            userResult.email = user.email;
            userResult.isAdmin = user.isAdmin;
            userResult.uniqueId = user.uniqueId;
            userResult.type = 'USER';
        }

        return userResult;
    }
}
