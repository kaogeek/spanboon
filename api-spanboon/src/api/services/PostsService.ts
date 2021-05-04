/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Posts } from '../models/Posts';
import { PostsRepository } from '../repositories/PostsRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';
import { UserLikeService } from '../services/UserLikeService';
import { PostsCommentService } from '../services/PostsCommentService';
import { HashTagService } from '../services/HashTagService';
import { NeedsService } from '../services/NeedsService';
import { LIKE_TYPE } from '../../constants/LikeType';
import { ObjectID } from 'mongodb';

@Service()
export class PostsService {

    constructor(@OrmRepository() private postsRepository: PostsRepository,
        private postsCommentService: PostsCommentService,
        private userLikeService: UserLikeService,
        private hashTagService: HashTagService,
        private needsService: NeedsService) { }

    // find post
    public async find(findCondition: any): Promise<Posts[]> {
        return await this.postsRepository.find(findCondition);
    }

    // find post
    public async findOne(findCondition: any): Promise<Posts> {
        return await this.postsRepository.findOne(findCondition);
    }

    // create post
    public async create(post: Posts): Promise<Posts> {
        return await this.postsRepository.save(post);
    }

    // update post
    public update(query: any, newValue: any): Promise<any> {
        return this.postsRepository.updateOne(query, newValue);
    }

    // delete post
    public async delete(query: any, options?: any): Promise<any> {
        return await this.postsRepository.deleteOne(query, options);
    }

    // aggregate post
    public async aggregate(query: any, options?: any): Promise<any[]> {
        return await this.postsRepository.aggregate(query, options).toArray();
    }

    // find Posts Agg
    public aggregateEntity(query: any, options?: any): Promise<Posts[]> {
        return this.postsRepository.aggregateEntity(query, options).toArray();
    }

    // select distinct post
    public async distinct(key: any, query: any, options?: any): Promise<any> {
        return await this.postsRepository.distinct(key, query, options);
    }

    // Search Post
    public search(search: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(search.limit, search.offset, search.select, search.relation, search.whereConditions, search.orderBy);

        if (search.count) {
            return this.postsRepository.count(search.whereConditions);
        } else {
            return this.postsRepository.find(condition);
        }
    }

    public getUserPostAction(postId: string, userId: string, showIsLike: boolean, showIsRepost: boolean, showIsComment: boolean, showIsShare: boolean, showCount?: boolean, searchAsPage?: boolean): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const result: any = {};

                if (showIsLike) {
                    result.isLike = false;
                }
                if (showIsRepost) {
                    result.isRepost = false;
                }
                if (showIsComment) {
                    result.isComment = false;
                }
                if (showIsShare) {
                    result.isShare = false;
                }

                if (postId === undefined || postId === null) {
                    resolve(result);
                    return;
                }

                if (userId === undefined || userId === null) {
                    resolve(result);
                    return;
                }

                const postObjId = new ObjectID(postId + '');
                const userObjId = new ObjectID(userId + '');

                if (showIsLike) {
                    let likeStmt: any = {
                        where: {
                            userId: userObjId, subjectId: postObjId, subjectType: LIKE_TYPE.POST,
                            $or: [
                                { likeAsPage: { $exists: false } },
                                { likeAsPage: null }
                            ]
                        }
                    };
                    if (searchAsPage) {
                        likeStmt = { where: { likeAsPage: userObjId, subjectId: postObjId, subjectType: LIKE_TYPE.POST } };
                    }
                    const postLike: any = await this.userLikeService.findOne(likeStmt);
                    if (postLike) {
                        result.isLike = true;
                    }
                }

                if (showIsRepost) {
                    let repostStmt: any = {
                        where: {
                            ownerUser: userObjId, referencePost: postObjId, deleted: false, hidden: false,
                            $or: [
                                { postAsPage: { $exists: false } },
                                { postAsPage: null }
                            ]
                        }
                    };
                    if (searchAsPage) {
                        repostStmt = { where: { postAsPage: userObjId, referencePost: postObjId, deleted: false, hidden: false } };
                    }
                    const postRepost: any = await this.findOne(repostStmt);
                    if (postRepost) {
                        result.isRepost = true;
                    }
                }

                if (showIsComment) {
                    let commentStmt: any = {
                        where: {
                            user: userObjId, post: postObjId,
                            $or: [
                                { commentAsPage: { $exists: false } },
                                { commentAsPage: null }
                            ]
                        }
                    };
                    if (searchAsPage) {
                        commentStmt = { where: { commentAsPage: userObjId, post: postObjId } };
                    }
                    const postComment: any = await this.postsCommentService.findOne(commentStmt);
                    if (postComment) {
                        result.isComment = true;
                    }
                }

                if (showIsShare) {
                    // !implement
                }

                if (showCount) {
                    const postObj = await this.findOne({ where: { _id: postObjId } });
                    if (postObj) {
                        result.commentCount = postObj.commentCount;
                        result.likeCount = postObj.likeCount;
                        result.repostCount = postObj.repostCount;
                        result.shareCount = postObj.shareCount;
                        result.viewCount = postObj.viewCount;
                    }
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    public sampleHashTags(matchStmt: any, simpleCount: number): Promise<any[]> {
        return new Promise(async (resolve, reject) => {
            try {
                let result = [];

                if (matchStmt === undefined || matchStmt === null) {
                    resolve(result);
                    return;
                }

                let countLoop = 0;
                const hashTagStringIds = [];
                const hashTagObjIds = [];

                // search until hashTagObjIds == simpleCount;
                while (hashTagStringIds.length < simpleCount) {
                    if (countLoop === 100) {
                        break;
                    }

                    const aggregateObjPost = [
                        { $match: matchStmt },
                        { $sample: { size: simpleCount } },
                    ];
                    const aggResult = await this.aggregate(aggregateObjPost);
                    for (const data of aggResult) {
                        // check if postsHashTags has data
                        if (data.postsHashTags !== undefined && data.postsHashTags.length > 0) {
                            // random hastag and get only one hashtag per post
                            const randIdx = Math.floor(Math.random() * data.postsHashTags.length);
                            const hashtag = data.postsHashTags[randIdx] + '';

                            // add in only non duplicate hashtag
                            if (hashTagStringIds.indexOf(hashtag) < 0) {
                                hashTagStringIds.push(hashtag);
                                hashTagObjIds.push(new ObjectID(hashtag));
                            }
                        }
                    }

                    countLoop++;
                }

                // search for hastag object
                if (hashTagObjIds.length > 0) {
                    result = await this.hashTagService.find({
                        _id: { $in: hashTagObjIds }
                    });
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    public samplePostNeedsItems(matchStmt: any, simpleCount: number): Promise<any[]> {
        return new Promise(async (resolve, reject) => {
            try {
                let result = [];

                if (matchStmt === undefined || matchStmt === null) {
                    resolve(result);
                    return;
                }

                const aggregateObj = [
                    { $match: matchStmt },
                    { $sample: { size: simpleCount } },
                    {
                        $project:
                        {
                            'story': 0,
                            'detail': 0
                        }
                    }
                ];

                const postResult = await this.aggregate(aggregateObj);
                for (const post of postResult) {
                    const item: any = {
                        post,
                        needs: []
                    };
                    // search needs
                    const needsList = await this.needsService.find({ post: post._id, active: true, fullfilled: false });
                    if (needsList !== undefined && needsList.length > 0) {
                        item.needs = needsList;
                        // add post and needs only if has needs
                        result.push(item);
                    }
                }

                let loopCount = 0;
                // recursive until sample was full
                while (result.length < simpleCount) {
                    // break in worst case
                    if (loopCount >= 50) {
                        break;
                    }

                    const leftSampleCount = simpleCount - result.length;
                    if (leftSampleCount <= 0) {
                        break;
                    }

                    const moreResult = await this.samplePostNeedsItems(matchStmt, leftSampleCount);
                    if (moreResult.length > 0) {
                        result = result.concat(moreResult);
                    }

                    loopCount++;
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }
}
