/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { SectionModel } from '../models/SectionModel';
import { ContentModel } from '../models/ContentModel';
import { AbstractSectionModelProcessor } from './AbstractSectionModelProcessor';
import { UserPageLookingProcessorData } from './data/UserPageLookingProcessorData';
import { PostsService } from '../services/PostsService';
import { UserFollowService } from '../services/UserFollowService';
import { S3Service } from '../services/S3Service';
import { SUBJECT_TYPE } from '../../constants/FollowType';
import { POST_TYPE } from '../../constants/PostType';
import { ObjectID } from 'mongodb';
import moment from 'moment';
import { PLATFORM_NAME_TH } from '../../constants/SystemConfig';

export class UserPageLookingSectionProcessor extends AbstractSectionModelProcessor {

    private DEFAULT_SEARCH_LIMIT = 4;
    private DEFAULT_SEARCH_OFFSET = 0;

    constructor(
        private postsService: PostsService,
        private userFollowService: UserFollowService,
        private s3Service: S3Service
    ) {
        super();
    }

    public setData(data: UserPageLookingProcessorData): void {
        this.data = data;
    }

    // new post which user follow
    public process(): Promise<SectionModel> {
        return new Promise(async (resolve, reject) => {
            try {
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

                let userId = undefined;
                let clientId = undefined;
                let userObjId: ObjectID = undefined;
                if (this.data !== undefined && this.data !== null) {
                    userId = this.data.userId;
                    clientId = this.data.clientId;
                }

                if (userId === undefined || userId === null || userId === '') {
                    resolve(undefined);
                    return;
                }

                let pageFollow: any = undefined;
                if (userId !== undefined && userId !== '') {
                    const followStmt = [
                        { $match: { userId: new ObjectID(userId + '') } },
                        { $sample: { size: 1 } },
                        {
                            $lookup: {
                                from: 'Page',
                                localField: 'subjectId',
                                foreignField: '_id',
                                as: 'page'
                            }
                        }
                    ];
                    const followSearchResult = await this.userFollowService.aggregate(followStmt);
                    if (followSearchResult.length > 0) {
                        pageFollow = followSearchResult[0];
                    }
                } else if (clientId !== undefined) {
                    // ! impl
                }

                if (pageFollow === undefined) {
                    resolve(undefined);
                    return;
                }

                const today = moment().toDate();
                const matchStmt: any = {
                    isDraft: false,
                    deleted: false,
                    hidden: false,
                    type: POST_TYPE.NEEDS
                };
                if (pageFollow !== undefined) {
                    matchStmt.pageId = new ObjectID(pageFollow.subjectId + '');
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
                    matchStmt['$and'] = dateTimeAndArray;
                } else {
                    // default if startDateTime and endDateTime is not defined.
                    matchStmt.startDateTime = { $lte: today };
                }

                const postStmt = [
                    { $match: matchStmt },
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
                    { $sort: { createdDate: -1 } },
                    { $skip: offset },
                    { $limit: limit },
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

                const searchResult = await this.postsService.aggregate(postStmt);

                let lastestDate = null;

                const pageName: string = (pageFollow && pageFollow.page && pageFollow.page.length > 0) ? pageFollow.page[0].name : '...';
                const result: SectionModel = new SectionModel();
                result.title = 'สิ่งที่ "' + pageName + '" กำลังมองหา';
                result.iconUrl = (pageFollow && pageFollow.page && pageFollow.page.length > 0 && pageFollow.page[0].imageURL) ? pageFollow.page[0].imageURL : '';
                if (pageName === '...') {
                    result.title = 'โพสต์มองหาอื่นๆ';
                }

                if (pageFollow && pageFollow.page && pageFollow.page.length > 0) {
                    const p = pageFollow.page[0];
                    if (p) {
                        result.data = {
                            name: p.name,
                            uniqueId: p.pageUsername
                        };
                    }
                }

                result.subtitle = 'การเติมเต็ม ที่เกิดขึ้นบนแพลตฟอร์ม' + PLATFORM_NAME_TH;
                result.description = '';
                result.contents = [];
                for (const row of searchResult) {
                    const page = row.page;
                    const user = (row.user !== undefined && row.user.length > 0) ? row.user[0] : undefined;
                    const firstImg = (row.gallery !== undefined && row.gallery.length > 0) ? row.gallery[0] : undefined;

                    const contentModel = new ContentModel();
                    let followUserCount = 0;
                    let followUsers = [];
                    if (page !== null && page !== undefined) {
                        const pfSimple = await this.userFollowService.sampleUserFollow(page._id, SUBJECT_TYPE.PAGE, 5);
                        followUserCount = pfSimple.count;
                        followUsers = pfSimple.followers;

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
                    } else if (user !== null && user !== undefined) {
                        const usrSimple = await this.userFollowService.sampleUserFollow(user._id, SUBJECT_TYPE.USER, 5);
                        followUserCount = usrSimple.count;
                        followUsers = usrSimple.followers;
                    }

                    if (lastestDate === null) {
                        lastestDate = row.createdDate;
                    }

                    contentModel.commentCount = row.commentCount;
                    contentModel.repostCount = row.repostCount;
                    contentModel.shareCount = row.shareCount;
                    contentModel.likeCount = row.likeCount;
                    contentModel.viewCount = row.viewCount;
                    contentModel.followUserCount = followUserCount; // count all userfollow
                    contentModel.followUsers = followUsers; // add all userFollow // max 5

                    contentModel.post = row;
                    contentModel.dateTime = row.createdDate;

                    if (firstImg) {
                        contentModel.coverPageUrl = firstImg.imageURL;

                        if (firstImg.s3FilePath !== undefined && firstImg.s3FilePath !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(firstImg.s3FilePath);
                                contentModel.coverPageSignUrl = signUrl;
                            } catch (error) {
                                console.log('UserPageLookingSectionProcessor: ' + error);
                            }
                        }
                    }

                    if (showUserAction) {
                        const userAction: any = await this.postsService.getUserPostAction(row._id + '', userId, true, true, true, true);
                        contentModel.isLike = userAction.isLike;
                        contentModel.isRepost = userAction.isRepost;
                        contentModel.isComment = userAction.isComment;
                        contentModel.isShare = userAction.isShare;
                    }

                    contentModel.owner = {};
                    if (page !== undefined) {
                        contentModel.owner = this.parsePageField(page);
                    } else if (user !== undefined) {
                        contentModel.owner = this.parseUserField(user);
                    }

                    delete contentModel.post.story;
                    delete contentModel.post.page;
                    delete contentModel.post.user;

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

    private parseUserField(user: any): any {
        const userResult: any = {};

        if (user !== undefined) {
            userResult.id = user.id;
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
