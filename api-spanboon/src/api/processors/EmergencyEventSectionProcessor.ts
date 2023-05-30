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
import { HashTagService } from '../services/HashTagService';
import { ObjectID } from 'mongodb';
export class EmergencyEventSectionProcessor extends AbstractSectionModelProcessor {

    private DEFAULT_SEARCH_LIMIT = 5;
    private DEFAULT_SEARCH_OFFSET = 0;

    constructor(
        private emergencyEvent: EmergencyEventService,
        private postsService: PostsService,
        private s3Service: S3Service,
        private hashTagService: HashTagService,
    ) {
        super();
    }

    public process(): Promise<SectionModel> {
        return new Promise(async (resolve, reject) => {
            try {
                // get config
                let limit: number = undefined;
                let offset: number = undefined;
                let searchOfficialOnly: number = undefined;
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
                searchFilter.offset = offset;
                searchFilter.limit = limit;
                searchFilter.orderBy = {
                    createdDate: 'DESC'
                };
                searchFilter.whereConditions = {
                    isClose: false,
                };

                const searchResult = await this.emergencyEvent.aggregate([
                    { $match: searchFilter.whereConditions },
                    { $sort: { isPin: -1, createdDate: -1 } },
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
                const postCountStmt = [];
                postCountStmt.push({ $match: { emergencyEvent: { $in: emerEventIds } } });

                if (searchOfficialOnly) {
                    postCountStmt.push({
                        $lookup: {
                            from: 'Page',
                            localField: 'pageId',
                            foreignField: '_id',
                            as: 'page'
                        }
                    });
                    postCountStmt.push({
                        $unwind: {
                            path: '$page',
                            preserveNullAndEmptyArrays: true
                        }
                    });
                    postCountStmt.push({ $match: { 'page.isOfficial': true, 'page.banned': false } });
                }

                postCountStmt.push({ $group: { _id: '$emergencyEvent', count: { $sum: 1 }, commentCount: { $sum: '$commentCount' }, repostCount: { $sum: '$repostCount' }, shareCount: { $sum: '$shareCount' }, viewCount: { $sum: '$viewCount' }, likeCount: { $sum: '$likeCount' } } });

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
                result.type = 'EMERGENCYEVENT';
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
                            console.log('EmergencyEventSectionProcessor: ' + error);
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

    public process2(): Promise<SectionModel> {
        return new Promise(async (resolve, reject) => {
            try {
                // get config
                let limit: number = undefined;
                let offset: number = undefined;
                let searchOfficialOnly: number = undefined;
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
                let emergencyEndDate = undefined;
                let rangeDayHashtags = undefined;
                let endDateTime: Date = undefined;
                limit = (limit === undefined || limit === null) ? this.DEFAULT_SEARCH_LIMIT : limit;
                offset = (offset === undefined || offset === null) ? this.DEFAULT_SEARCH_OFFSET : offset;
                if (this.data !== undefined && this.data !== null) {
                    emergencyEndDate = this.data.emergencyCheckEndDate;
                    rangeDayHashtags = this.data.rangeHashtags;
                    endDateTime = this.data.endDateTime;
                }
                const dateFormat = new Date();
                const dateReal = dateFormat.setDate(dateFormat.getDate() - parseInt(rangeDayHashtags, 10));
                const toDate = new Date(dateReal);
                // check Error ???
                const today = new Date();
                const timeStampToday = today.getTime();
                const timeStampSettings = Date.parse(emergencyEndDate);
                const searchFilter: SearchFilter = new SearchFilter();
                searchFilter.offset = offset;
                searchFilter.limit = limit;
                searchFilter.orderBy = {
                    ordering: 1,

                };
                searchFilter.whereConditions = {
                    isPin: true,
                    isClose: false,
                };
                if (timeStampSettings > timeStampToday) {
                    const searchResult = await this.emergencyEvent.aggregate([
                        { $match: searchFilter.whereConditions },
                        { $sort: { ordering: 1 } },
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
                    const postCountStmt = [];
                    postCountStmt.push({ $match: { emergencyEvent: { $in: emerEventIds } } });

                    if (searchOfficialOnly) {
                        postCountStmt.push({
                            $lookup: {
                                from: 'Page',
                                localField: 'pageId',
                                foreignField: '_id',
                                as: 'page'
                            }
                        });
                        postCountStmt.push({
                            $unwind: {
                                path: '$page',
                                preserveNullAndEmptyArrays: true
                            }
                        });
                        postCountStmt.push({ $match: { 'page.isOfficial': true, 'page.banned': false } });
                    }

                    postCountStmt.push({ $group: { _id: '$emergencyEvent', count: { $sum: 1 }, commentCount: { $sum: '$commentCount' }, repostCount: { $sum: '$repostCount' }, shareCount: { $sum: '$shareCount' }, viewCount: { $sum: '$viewCount' }, likeCount: { $sum: '$likeCount' } } });

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
                    result.type = 'EMERGENCYEVENT';
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
                                console.log('EmergencyEventSectionProcessor: ' + error);
                            }
                        }
                        contentModel.dateTime = row.createdDate;
                        contentModel.data = moreData;
                        result.contents.push(contentModel);
                    }
                    result.dateTime = lastestDate;

                    resolve(result);
                } else {
                    const bucketF = [];
                    const hashTagsIds = [];
                    let hashTagsNames = undefined;
                    let mirrorHashTags = undefined;
                    const hashTagMost = await this.hashTagService.searchHashSec(limit);
                    if (hashTagMost.length >= 0) {
                        for (const hashTagMostS of hashTagMost) {
                            bucketF.push(new ObjectID(hashTagMostS.id));
                        }
                    }

                    const postMatchStmt: any = {
                        isDraft: false,
                        deleted: false,
                        hidden: false,
                        postsHashTags: { $in: bucketF }
                    };
                    const dateTimeAndArray = [];
                    if (toDate !== undefined && toDate !== null) {
                        dateTimeAndArray.push({ startDateTime: { $gte: toDate } });
                    }
                    if (dateFormat !== undefined && dateFormat !== null) {
                        dateTimeAndArray.push({ startDateTime: { $lte: endDateTime } });
                    }

                    if (dateTimeAndArray.length > 0) {
                        postMatchStmt['$and'] = dateTimeAndArray;
                    } else {
                        // default if startDateTime and endDateTime is not defined.
                        postMatchStmt.startDateTime = { $lte: today };
                    }
                    // { $match: { isDraft: false, deleted: false, hidden: false, _id: { $nin: postId }, postsHashTags: { $in: bucketF } } },
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
                    let filterIds = undefined;
                    const postAggregate = await this.postsService.aggregate(postStmt);
                    if (postAggregate.length > 0) {
                        for (let i = 0; i < postAggregate.length; i++) {
                            const mapIds = postAggregate[i].postsHashTags.flat().map(ids => String(ids));
                            if (mapIds.length > 0) {
                                for (let j = 0; j < mapIds.length; j++) {
                                    if (mapIds.length > 0) {
                                        hashTagsIds.push(mapIds[j]);
                                    } else {
                                        continue;
                                    }
                                }
                            }
                        }
                    }
                    if (hashTagsIds.length > 0) {
                        filterIds = hashTagsIds.filter((element, index) => {
                            return hashTagsIds.indexOf(element) === index;
                        });
                        const objIds = filterIds.flat().map(ids => new ObjectID(ids));
                        if (objIds.length > 0) {
                            hashTagsNames = await this.hashTagService.aggregate(
                                [
                                    {
                                        $match: {
                                            _id: { $in: objIds }
                                        }
                                    },
                                    {
                                        $sort: {
                                            count: -1
                                        }
                                    },
                                    {
                                        $project: {
                                            _id: 1,
                                            name: 1
                                        }
                                    },
                                    {
                                        $limit:limit
                                    }
                                ]
                            );
                        }
                    }
                    if (hashTagsNames !== undefined) {
                        const objIds = hashTagsNames.flat().map(ids => new ObjectID(ids._id));
                        if (objIds.length > 0) {
                            mirrorHashTags = await this.hashTagService.aggregate([
                                {
                                    $match: { _id: { $nin: objIds } }
                                },
                                {
                                    $project: {
                                        _id: 0,
                                        name: 1
                                    }
                                },
                                {
                                    $limit:limit
                                }
                            ]);
                        }
                    }
                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? 'HashTags ติดกระแส' : this.config.title;
                    result.subtitle = (this.config === undefined || this.config.subtitle === undefined) ? 'HashTags ติดกระแส' : this.config.subtitle;
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = 'RangeOfHashTags'; // set type by processor type
                    result.majorTrendHashTags = hashTagsNames;
                    result.mirrorTrends = mirrorHashTags;
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
                }
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