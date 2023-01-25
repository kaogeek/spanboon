/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { AbstractSectionModelProcessor } from './AbstractSectionModelProcessor';
import { SectionModel } from '../models/SectionModel';
import { ContentModel } from '../models/ContentModel';
import { EmergencyEventService } from '../services/EmergencyEventService';
import { PostsService } from '../services/PostsService';
import { S3Service } from '../services/S3Service';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';

export class EmergencyEventPinProcessor extends AbstractSectionModelProcessor {

    private DEFAULT_SEARCH_LIMIT = 1;
    private DEFAULT_SEARCH_OFFSET = 0;

    constructor(
        private emergencyEvent: EmergencyEventService,
        private postsService: PostsService,
        private s3Service: S3Service
    ) {
        super();
    }

    public process(): Promise<SectionModel> {
        return new Promise(async (resolve, reject) => {
            try {
                // get config
                let limit: number = undefined;
                let offset: number = undefined;
                let searchOfficialOnly = undefined;

                if (this.config !== undefined && this.config !== null) {
                    if (typeof this.config.limit === 'number') {
                        limit = this.config.limit;
                    }

                    if (typeof this.config.offset === 'number') {
                        offset = this.config.offset;
                    }

                    if (typeof this.config.searchOfficialOnly === 'boolean') {
                        searchOfficialOnly = this.config.searchOfficialOnly;
                    }
                }

                limit = (limit === undefined || limit === null) ? this.DEFAULT_SEARCH_LIMIT : limit;
                offset = (offset === undefined || offset === null) ? this.DEFAULT_SEARCH_OFFSET : offset;

                const searchFilter: SearchFilter = new SearchFilter();
                searchFilter.limit = limit;
                searchFilter.offset = offset;
                searchFilter.orderBy = {
                    createdDate: 'DESC'
                };
                searchFilter.whereConditions = {
                    isClose: false,
                    isPin: true
                };
                const emergencyAggregateArray = [
                    { $match: searchFilter.whereConditions },
                    { $sort: { createdDate: -1 } },
                    // open if u want to search only emergency event that has post
                    { // sample post for one
                        $lookup: {
                            from: 'Posts',
                            let: { 'id': '$_id' },
                            pipeline: [
                                { $match: { $expr: { $eq: ['$$id', '$emergencyEvent'] }, 'deleted': false } },
                                { $limit: 1 }
                            ],
                            as: 'samplePost'
                        }
                    },
                    {
                        $match: {
                            'samplePost.0': { $exists: true }
                        }
                    },
                    { $skip: offset },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: 'HashTag',
                            localField: 'hashTag',
                            foreignField: '_id',
                            as: 'hashTagObj'
                        }
                    }
                ];
                const searchResult = await this.emergencyEvent.aggregate(emergencyAggregateArray);
                // search count all from post of emergency
                const emerEventIds = [];
                for (const row of searchResult) {
                    emerEventIds.push(row._id);
                }

                // post count
                const postCountStmt: any = [
                    { $match: { emergencyEvent: { $in: emerEventIds } } },
                    {
                        $group: {
                            _id: '$emergencyEvent', count: { $sum: 1 }, commentCount: { $sum: '$commentCount' }, repostCount: { $sum: '$repostCount' }, shareCount: { $sum: '$shareCount' },
                            viewCount: { $sum: '$viewCount' }, likeCount: { $sum: '$likeCount' }
                        }
                    }
                ];

                // overide search Official
                if (searchOfficialOnly) {
                    postCountStmt.splice(1, 0, {
                        $lookup: {
                            from: 'Page',
                            localField: 'pageId',
                            foreignField: '_id',
                            as: 'page'
                        }
                    });
                    postCountStmt.splice(2, 0, {
                        $unwind: {
                            path: '$page',
                            preserveNullAndEmptyArrays: true
                        }
                    });
                    postCountStmt.splice(3, 0, { $match: { 'page.isOfficial': true, 'page.banned': false } });
                }

                const groupResult = await this.postsService.aggregate(postCountStmt);
                const hashtagCountMap = {};
                for (const item of groupResult) {
                    hashtagCountMap[item._id] = item;
                }

                let lastestDate = null;
                const result: SectionModel = new SectionModel();
                result.title = '';
                result.subtitle = '';
                result.description = '';
                result.iconUrl = '';
                result.contents = [];
                for (const row of searchResult) {
                    if (lastestDate === null) {
                        lastestDate = row.createdDate;
                    }

                    let postSearchCount = 0;
                    let postCommentCount = 0;
                    let postRepostCount = 0;
                    let postShareCount = 0;
                    let postViewCount = 0;
                    let postLikeCount = 0;
                    if (row._id !== null && row._id !== undefined && hashtagCountMap[row._id] !== undefined) {
                        const countObj = hashtagCountMap[row._id];
                        postSearchCount = countObj.count;
                        postCommentCount = countObj.commentCount;
                        postRepostCount = countObj.repostCount;
                        postShareCount = countObj.shareCount;
                        postViewCount = countObj.viewCount;
                        postLikeCount = countObj.likeCount;
                    }
                    const hashtag = (row.hashTagObj !== undefined && row.hashTagObj.length > 0) ? row.hashTagObj[0] : undefined;

                    const moreData: any = {};
                    moreData.emergencyEventId = row._id;

                    const contentModel = new ContentModel();
                    contentModel.coverPageUrl = row.coverPageURL;
                    contentModel.title = hashtag === undefined ? '#' : '#' + hashtag.name;
                    contentModel.description = row.detail;
                    contentModel.postCount = postSearchCount;
                    contentModel.commentCount = postCommentCount;
                    contentModel.repostCount = postRepostCount;
                    contentModel.shareCount = postShareCount;
                    contentModel.likeCount = postLikeCount;
                    contentModel.viewCount = postViewCount;

                    if (row.s3CoverPageURL !== undefined && row.s3CoverPageURL !== '') {
                        try {
                            const signUrl = await this.s3Service.getConfigedSignedUrl(row.s3CoverPageURL);
                            contentModel.coverPageSignUrl = signUrl;
                        } catch (error) {
                            console.log('EmergencyEventPinProcessor: ' + error);
                        }
                    }

                    contentModel.dateTime = row.createdDate;
                    contentModel.data = moreData;

                    result.contents.push(contentModel);
                }
                result.dateTime = lastestDate;
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }
}
