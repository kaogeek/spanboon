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
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';

export class EmergencyEventSectionProcessor extends AbstractSectionModelProcessor {

    private DEFAULT_SEARCH_LIMIT = 5;
    private DEFAULT_SEARCH_OFFSET = 0;

    constructor(
        private emergencyEvent: EmergencyEventService,
        private postsService: PostsService
    ) {
        super();
    }

    public process(): Promise<SectionModel> {
        return new Promise(async (resolve, reject) => {
            try {
                // get config
                let limit: number = undefined;
                let offset: number = undefined;
                if (this.config !== undefined && this.config !== null) {
                    if (typeof this.config.limit === 'number') {
                        limit = this.config.limit;
                    }

                    if (typeof this.config.offset === 'number') {
                        offset = this.config.offset;
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
                    isClose: false
                };
                const searchResult = await this.emergencyEvent.aggregate([
                    { $match: searchFilter.whereConditions },
                    { $sort: { createdDate: -1 } },
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
                ]);

                const searchCountFilter: SearchFilter = new SearchFilter();
                searchCountFilter.count = true;
                searchCountFilter.whereConditions = {
                    isClose: false
                };
                const countAllResult = await this.emergencyEvent.search(searchCountFilter);

                // search count all from post of emergency
                const emerEventIds = [];
                for (const row of searchResult) {
                    emerEventIds.push(row._id);
                }

                // post count
                const postCountStmt = [
                    { $match: { emergencyEvent: { $in: emerEventIds } } },
                    { $group: { _id: '$emergencyEvent', count: { $sum: 1 }, commentCount: { $sum: '$commentCount' }, repostCount: { $sum: '$repostCount' }, shareCount: { $sum: '$shareCount' }, viewCount: { $sum: '$viewCount' }, likeCount: { $sum: '$likeCount' } } }
                ];
                const groupResult = await this.postsService.aggregate(postCountStmt);
                const hashtagCountMap = {};
                for (const item of groupResult) {
                    hashtagCountMap[item._id] = item;
                }

                let lastestDate = null;
                const result: SectionModel = new SectionModel();
                result.title = (this.config === undefined || this.config.title === undefined) ? 'เหตุการณ์ด่วน' : this.config.title;
                result.subtitle = (this.config === undefined || this.config.subtitle === undefined) ? 'กำลังมองหา' : this.config.subtitle;
                result.description = '';
                result.iconUrl = '';
                result.contents = [];
                result.contentCount = countAllResult; // count of all emergency event.
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

                    let searchResults: any[] = [];

                    const lastestFilter: SearchFilter = new SearchFilter();
                    lastestFilter.limit = limit;
                    lastestFilter.offset = offset;
                    lastestFilter.orderBy = {
                        createdDate: 'DESC'
                    };

                    if (lastestFilter.whereConditions === undefined) {
                        lastestFilter.whereConditions = {};
                    }
                    lastestFilter.whereConditions.isDraft = false;
                    lastestFilter.whereConditions.deleted = false;
                    lastestFilter.whereConditions.hidden = false;
                    lastestFilter.whereConditions.emergencyEventTag = { $eq: hashtag.name };

                    const matchStmt = lastestFilter.whereConditions;

                    const postStmt = [
                        { $match: matchStmt },
                        { $limit: limit },
                        { $skip: offset },
                        { $sort: { createdDate: -1 } },
                        {
                            $project: {
                                story: 0
                            }
                        },
                        {
                            $lookup: {
                                from: 'Page',
                                localField: 'pageId',
                                foreignField: '_id',
                                as: 'page'
                            }
                        },
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

                    searchResults = await this.postsService.aggregate(postStmt);

                    const contentModel = new ContentModel();
                    contentModel.coverPageUrl = row.coverPageURL;
                    contentModel.title = hashtag === undefined ? '#' : '#' + hashtag.name;
                    contentModel.postCount = postSearchCount;
                    contentModel.post = searchResults;
                    contentModel.commentCount = postCommentCount;
                    contentModel.repostCount = postRepostCount;
                    contentModel.shareCount = postShareCount;
                    contentModel.likeCount = postLikeCount;
                    contentModel.viewCount = postViewCount;

                    contentModel.dateTime = row.createdDate;
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
