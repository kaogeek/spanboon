/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { AbstractSectionModelProcessor } from './AbstractSectionModelProcessor';
import { SectionModel } from '../models/SectionModel';
import { ContentModel } from '../models/ContentModel';
import { PostsService } from '../services/PostsService';
import { NeedsService } from '../services/NeedsService';
import { UserFollowService } from '../services/UserFollowService';
import { LastestLookingProcessorData } from './data/LastestLookingProcessorData';
import { SUBJECT_TYPE } from '../../constants/FollowType';
import { S3Service } from '../services/S3Service';
import moment from 'moment';
import { ObjectID } from 'mongodb';

/* 
* Search The lasted Looking from database 
*/
export class LastestLookingSectionProcessor extends AbstractSectionModelProcessor {

    private DEFAULT_SEARCH_LIMIT = 4;
    private DEFAULT_SEARCH_OFFSET = 0;

    constructor(
        private postsService: PostsService,
        private needsService: NeedsService,
        private userFollowService: UserFollowService,
        private s3Service: S3Service
    ) {
        super();
    }

    public setData(data: LastestLookingProcessorData): void {
        this.data = data;
    }

    public process(): Promise<SectionModel> {
        return new Promise(async (resolve, reject) => {
            try {
                // get data
                let userId: string = undefined;
                let userObjId: ObjectID = undefined;

                if (this.data !== undefined && this.data !== null) {
                    userId = this.data.userId;
                }

                // get config
                let limit: number = undefined;
                let offset: number = undefined;
                let searchOfficialOnly: number = undefined;
                let showUserAction = false;

                if (this.config !== undefined && this.config !== null) {
                    if (typeof this.config.limit === 'number') {
                        limit = this.config.limit;
                    }

                    if (typeof this.config.offset === 'number') {
                        offset = this.config.offset;
                    }

                    if (typeof this.config.showUserAction === 'boolean') {
                        showUserAction = this.config.showUserAction;
                    }

                    if (typeof this.config.searchOfficialOnly === 'boolean') {
                        searchOfficialOnly = this.config.searchOfficialOnly;
                    }
                }

                limit = (limit === undefined || limit === null) ? this.DEFAULT_SEARCH_LIMIT : limit;
                offset = (offset === undefined || offset === null) ? this.DEFAULT_SEARCH_OFFSET : offset;

                // get startDateTime, endDateTime
                let startDateTime: Date = undefined;
                let endDateTime: Date = undefined;
                if (this.data !== undefined && this.data !== null) {
                    startDateTime = this.data.startDateTime;
                    endDateTime = this.data.endDateTime;
                }

                const today = moment().toDate();
                // overide start datetime
                const needDateTimeAndArray = [];
                if (startDateTime !== undefined && startDateTime !== null) {
                    needDateTimeAndArray.push({ createdDate: { $gte: startDateTime } });
                }
                if (endDateTime !== undefined && endDateTime !== null) {
                    needDateTimeAndArray.push({ createdDate: { $lte: endDateTime } });
                }

                let needMatchStmt = {};
                if (needDateTimeAndArray.length > 0) {
                    needMatchStmt = { $and: needDateTimeAndArray };
                } else {
                    // default if startDateTime and endDateTime is not defined.
                    needMatchStmt = { createdDate: { $lte: today } };
                }

                const needStmt: any[] = [
                    { $match: needMatchStmt },
                    { $sample: { size: limit } }, // random post
                    { $group: { '_id': { 'post': '$post' } } },
                    { $sort: { createdDate: -1 } },
                    { $skip: offset },
                    { $limit: limit }
                ];

                const postIds: any[] = [];
                const needSearchResult = await this.needsService.aggregate(needStmt);
                for (const row of needSearchResult) {
                    postIds.push(row._id.post);
                }

                const postStmt: any = [
                    { $match: { _id: { $in: postIds }, isDraft: false, deleted: false, hidden: false } },
                    {
                        $lookup: {
                            from: 'Page',
                            localField: 'pageId',
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
                    { $sample: { size: limit } }, // random post
                    { $sort: { startDateTime: -1 } },
                    {
                        $lookup: {
                            from: 'User',
                            localField: 'ownerUser',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },
                    {
                        $lookup: {
                            from: 'PostsGallery',
                            localField: '_id',
                            foreignField: 'post',
                            as: 'gallery'
                        }
                    }
                ];

                // overide search Official
                if (searchOfficialOnly) {
                    postStmt.splice(3, 0, { $match: { 'page.isOfficial': true, 'page.banned': false } });
                }

                // overide start datetime
                const dateTimeAndArray = [];
                if (startDateTime !== undefined && startDateTime !== null) {
                    dateTimeAndArray.push({ startDateTime: { $gte: startDateTime } });
                }
                if (endDateTime !== undefined && endDateTime !== null) {
                    dateTimeAndArray.push({ startDateTime: { $lte: endDateTime } });
                }

                if (dateTimeAndArray.length > 0) {
                    postStmt[0]['$match']['$and'] = dateTimeAndArray;
                } else {
                    // default if startDateTime and endDateTime is not defined.
                    postStmt[0]['$match']['startDateTime'] = { $lte: today };
                }

                const searchResult = await this.postsService.aggregate(postStmt);

                let lastestDate = null;
                const result: SectionModel = new SectionModel();
                result.title = 'กำลังมองหาล่าสุด';
                result.subtitle = 'กำลังมองหา';
                result.description = '';
                result.iconUrl = '';
                result.type = 'LASTEST';
                result.contents = [];

                for (const row of searchResult) {
                    const pageString = (row.pageId) ? row.pageId + '' : undefined;
                    if (pageString === undefined) {
                        continue;
                    }
                    const page = row.page;

                    if (lastestDate === null) {
                        lastestDate = row.createdDate;
                    }

                    const coverImageUrl = (row.coverImage) ? row.coverImage : undefined;

                    const contentModel = new ContentModel();

                    if (page !== null && page !== undefined) {
                        const folStmt = { subjectId: page._id, subjectType: SUBJECT_TYPE.PAGE };
                        const followUserCount = await this.userFollowService.search(undefined, undefined, undefined, undefined, folStmt, undefined, true);

                        contentModel.commentCount = row.commentCount;
                        contentModel.repostCount = row.repostCount;
                        contentModel.shareCount = row.shareCount;
                        contentModel.likeCount = row.likeCount;
                        contentModel.viewCount = row.viewCount;
                        contentModel.followUserCount = followUserCount; // count all userfollow
                        contentModel.post = row;
                        contentModel.coverPageUrl = coverImageUrl;
                        contentModel.dateTime = row.createdDate;
                        contentModel.owner = this.parsePageField(page);

                        if (row.s3CoverImage !== undefined && row.s3CoverImage !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(row.s3CoverImage);
                                contentModel.coverPageSignUrl = signUrl;
                            } catch (error) {
                                console.log('LastestLookingSectionProcessor: ' + error);
                            }
                        }

                        if (userId !== null && userId !== undefined && userId !== '') {
                            userObjId = new ObjectID(userId);

                            const currentUserFollowStmt = { userId: userObjId, subjectId: page._id, subjectType: SUBJECT_TYPE.PAGE };
                            const currentUserFollow = await this.userFollowService.findOne(currentUserFollowStmt);

                            if (currentUserFollow !== null && currentUserFollow !== undefined) {
                                contentModel.isFollow = true;
                            } else {
                                contentModel.isFollow = false;
                            }
                        } else {
                            contentModel.isFollow = false;
                        }
                    }

                    if (showUserAction) {
                        const userAction: any = await this.postsService.getUserPostAction(row._id + '', userId, true, true, true, true);
                        contentModel.isLike = userAction.isLike;
                        contentModel.isRepost = userAction.isRepost;
                        contentModel.isComment = userAction.isComment;
                        contentModel.isShare = userAction.isShare;
                    }

                    delete contentModel.post.story;
                    delete contentModel.post.page;

                    result.contents.push(contentModel);
                }
                result.dateTime = lastestDate;

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    private parsePageField(page: any): any {
        const pageResult: any = {};

        if (page !== undefined) {
            pageResult.id = page._id;
            pageResult.name = page.name;
            pageResult.imageURL = page.imageURL;
            pageResult.isOfficial = page.isOfficial;
            pageResult.uniqueId = page.pageUsername;
            pageResult.type = 'PAGE';
        }

        return pageResult;
    }
}
