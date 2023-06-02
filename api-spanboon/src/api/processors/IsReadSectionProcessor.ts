/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { AbstractSeparateSectionProcessor } from './AbstractSeparateSectionProcessor';
import { SectionModel } from '../models/SectionModel';
import { PostsService } from '../services/PostsService';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';
import { S3Service } from '../services/S3Service';
import { ObjectID } from 'mongodb';
import moment from 'moment';

export class IsReadSectionProcessor extends AbstractSeparateSectionProcessor {
    private DEFAULT_SEARCH_LIMIT = 10;
    private DEFAULT_SEARCH_OFFSET = 0;
    constructor(
        private postsService: PostsService,
        private s3Service: S3Service,
    ) {
        super();
    }

    public process(): Promise<SectionModel> {
        return new Promise(async (resolve, reject) => {
            try {
                // get config
                let searchOfficialOnly: number = undefined;
                let isReadPostIds = undefined;
                // get startDateTime, endDateTime
                let startDateTime: Date = undefined;
                if (this.data !== undefined && this.data !== null) {
                    startDateTime = this.data.startDateTime;
                    isReadPostIds = this.data.postIds;
                }
                let limit: number = undefined;
                let offset: number = undefined;
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
                limit = (limit === undefined || limit === null) ? this.DEFAULT_SEARCH_LIMIT : this.DEFAULT_SEARCH_LIMIT;
                offset = (offset === undefined || offset === null) ? this.DEFAULT_SEARCH_OFFSET : offset;
                const searchFilter: SearchFilter = new SearchFilter();
                searchFilter.limit = limit;
                searchFilter.offset = offset;
                searchFilter.orderBy = {
                    summationScore: 1
                };
                searchFilter.whereConditions = {
                    isClose: false
                };

                const searchCountFilter: SearchFilter = new SearchFilter();
                searchCountFilter.count = true;
                searchCountFilter.whereConditions = {
                    isClose: false
                };
                // const today = moment().add(month, 'month').toDate();
                const postIds = [];
                let mapIds = undefined;
                if(isReadPostIds.length>0){
                    for(let i = 0 ; i<isReadPostIds.length;i++){
                        postIds.push(isReadPostIds[i].postId);
                    }
                }
                if(postIds.length>0){
                    for(let j = 0 ; j<postIds.length;j++){
                        mapIds = postIds.flat().map(id => new ObjectID(id));
                    }
                }
                const today = moment().toDate();

                const postMatchStmt:any = {
                    isDraft: false,
                    deleted: false,
                    hidden: false,
                    _id: { $nin: mapIds }
                };
                const dateTimeAndArray = [];
                if (startDateTime !== undefined && startDateTime !== null) {
                    dateTimeAndArray.push({ startDateTime: { $lte: startDateTime } });
                }

                if (dateTimeAndArray.length > 0) {
                    postMatchStmt['$and'] = dateTimeAndArray;
                } else {
                    // default if startDateTime and endDateTime is not defined.
                    postMatchStmt.startDateTime = { $lte: today };
                }
                const postStmt = [
                    { $match: postMatchStmt },
                    {
                        $lookup:
                        {
                            from: 'Page',
                            let: { 'pageId': '$pageId' },
                            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$pageId'] } } },
                            { $project: { email: 0 } }
                            ],
                            as: 'page'
                        }
                    },
                    { $sort: { summationScore: -1 } },
                    {
                        $unwind: {
                            path: '$page',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: 'SocialPost',
                            localField: '_id',
                            foreignField: 'postId',
                            as: 'socialPosts'
                        }
                    },
                    {
                        $project: {
                            'socialPosts': {
                                '_id': 0,
                                'pageId': 0,
                                'postId': 0,
                                'postBy': 0,
                                'postByType': 0
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'PostsGallery',
                            localField: '_id',
                            foreignField: 'post',
                            as: 'gallery'
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
                        $project: {
                            story: 0
                        }

                    },
                    {
                        '$limit': limit
                    }
                ];
                if (searchOfficialOnly) {
                    postStmt.splice(3, 0, { $match: { 'page.isOfficial': true, 'page.banned': false } });
                }
                const postAggregate = await this.postsService.aggregate(postStmt);
                const lastestDate = null;
                const result: SectionModel = new SectionModel();
                result.title = (this.config === undefined || this.config.title === undefined) ? 'เรื่องราวที่คุณอาจพลาดไป' : this.config.title;
                result.subtitle = '';
                result.description = '';
                result.iconUrl = '';
                result.contents = [];
                result.type = 'IsRead'; // set type by processor type
                for (const row of postAggregate) {
                    const user = (row.user !== undefined && row.user.length > 0) ? row.user[0] : undefined;
                    const firstImage = (row.gallery.length > 0) ? row.gallery[0] : undefined;

                    const contents: any = {};
                    contents.coverPageUrl = (row.gallery.length > 0) ? row.gallery[0].imageURL : undefined;
                    if (firstImage !== undefined && firstImage.s3ImageURL !== undefined && firstImage.s3ImageURL !== '') {
                        try {
                            const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3ImageURL);
                            contents.coverPageSignUrl = signUrl;
                        } catch (error) {
                            console.log('PostSectionProcessor: ' + error);
                        }
                    }

                    // search isLike
                    row.isLike = false;

                    contents.owner = {};
                    if (row.page !== undefined) {
                        contents.owner = this.parsePageField(row.page);
                    } else {
                        contents.owner = this.parseUserField(user);
                    }
                    // remove page agg
                    // delete row.page;
                    delete row.user;
                    contents.post = row;
                    result.contents.push(contents);
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
