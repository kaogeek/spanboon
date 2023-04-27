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
import { UserLikeService } from '../services/UserLikeService';
import { UserLike } from '../models/UserLike';
import { LIKE_TYPE } from '../../constants/LikeType';
import { ObjectID } from 'mongodb';
import { KaokaiTodayService } from '../services/KaokaiTodayService';
import moment from 'moment';
import { HashTagService } from '../services/HashTagService';
import { PageService } from '../services/PageService';

export class MajorTrendSectionModelProcessor extends AbstractSeparateSectionProcessor {
    private DEFAULT_SEARCH_LIMIT = 10;
    private DEFAULT_SEARCH_OFFSET = 0;
    constructor(
        private postsService: PostsService,
        private s3Service: S3Service,
        private userLikeService: UserLikeService,
        private kaokaiTodayService: KaokaiTodayService,
        private hashTagService: HashTagService,
        private pageService: PageService
    ) {
        super();
    }

    public process(): Promise<SectionModel> {
        return new Promise(async (resolve, reject) => {
            try {
                // get config
                const position = [];
                const positionSequences = await this.kaokaiTodayService.find();
                for (const sequence of positionSequences) {
                    position.push(sequence.position);
                }
                const sorts = position.sort((a, b) => Math.abs(a) - Math.abs(b) || a - b);
                let checkPosition = undefined;

                let userId = undefined;
                let filterContentsRobin = undefined;
                // get startDateTime, endDateTime
                let startDateTime: Date = undefined;
                let endDateTime: Date = undefined;
                if (this.data !== undefined && this.data !== null) {
                    startDateTime = this.data.startDateTime;
                    endDateTime = this.data.endDateTime;
                    userId = this.data.userId;
                    filterContentsRobin = this.data.filterContentsRobin;
                    checkPosition = this.data.checkPosition1;
                }
                const postId = [];
                const sortV = [];
                const negative = [];
                // const today = moment().add(month, 'month').toDate();
                for (const sort of sorts) {
                    if (sort !== undefined && sort !== null && sort > 0 && sort !== checkPosition) {
                        sortV.push(sort);
                    } else if (sort !== undefined && sort !== null && sort < 0) {
                        negative.push(sort);
                    } else {
                        continue;
                    }
                }
                for (const nega of negative) {
                    if (nega !== undefined && nega !== null && nega !== checkPosition) {
                        sortV.push(nega);
                    } else {
                        continue;
                    }
                }
                if (filterContentsRobin.length > 0) {
                    for (const contents of filterContentsRobin) {
                        postId.push(new ObjectID(contents.post._id));
                    }
                }
                const majorTrend = await this.kaokaiTodayService.findOne({ position: sortV[0] });
                if (majorTrend === undefined) {
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? 'เกาะกระแส' : 'เกาะกระแส';
                    result.subtitle = '';
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = null;
                    // result.contents.push(contents);
                    resolve(result);
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
                }

                limit = (limit === undefined || limit === null) ? majorTrend.limit : this.DEFAULT_SEARCH_LIMIT;
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
                const today = moment().toDate();
                const postMatchStmt: any = {
                    isDraft: false,
                    deleted: false,
                    hidden: false
                };
                const dateTimeAndArray = [];
                if (startDateTime !== undefined && startDateTime !== null) {
                    dateTimeAndArray.push({ startDateTime: { $gte: startDateTime } });
                }
                if (endDateTime !== undefined && endDateTime !== null) {
                    dateTimeAndArray.push({ startDateTime: { $lte: endDateTime } });
                }

                if (dateTimeAndArray.length > 0) {
                    postMatchStmt['$and'] = dateTimeAndArray;
                } else {
                    // default if startDateTime and endDateTime is not defined.
                    postMatchStmt.startDateTime = { $lte: today };
                }
                /*
                historyQuery = [
                    { $match: { keyword: exp, userId: userObjId } },
                    { $sort: { createdDate: -1 } },
                    { $limit: historyLimit },
                    { $group: { _id: '$keyword', result: { $first: '$$ROOT' } } },
                    { $replaceRoot: { newRoot: '$result' } }
                ]; */

                // overide start datetime
                if (majorTrend === undefined) {
                    resolve(undefined);
                }
                if (majorTrend.type === 'post' && majorTrend.field === 'score') {
                    const postStmt = [
                        {
                            $lookup:
                            {
                                from: 'Page',
                                let: { 'pageId': '$pageId' },
                                pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$pageId'] }, isOfficial: true } },
                                { $project: { email: 0 } }
                                ],
                                as: 'page'
                            }
                        },
                        { $match: { isDraft: false, deleted: false, hidden: false, _id: { $nin: postId }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime } } },
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
                    const postAggregate = await this.postsService.aggregate(postStmt);
                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? majorTrend.title : this.config.title;
                    result.subtitle = '';
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = majorTrend.position;
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
                        if (userId !== undefined && userId !== undefined && userId !== '') {
                            const userLikes: UserLike[] = await this.userLikeService.find({ userId: new ObjectID(userId), subjectId: row._id, subjectType: LIKE_TYPE.POST });
                            if (userLikes.length > 0) {
                                row.isLike = true;
                            }
                        }

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
                } else if (majorTrend.type === 'post' && majorTrend.field === 'objective') {
                    const bucketSAll = [];
                    const postObject = [];
                    const chunkSizes = [];
                    if (majorTrend.buckets.length >= 0) {
                        for (const pageGroups of majorTrend.buckets) {
                            bucketSAll.push(pageGroups.values);
                        }
                    }
                    if (bucketSAll.length > 0) {
                        for (let i = 0; i < bucketSAll[0].length; i++) {
                            chunkSizes.push(bucketSAll[i].length);
                        }
                    }
                    const groups = [];
                    if (bucketSAll.length > 0 && chunkSizes.length > 0) {
                        const allIds = bucketSAll.flat().map(id => new ObjectID(id));
                        let startIndex = 0;
                        for (let i = 0; i < chunkSizes.length; i++) {
                            const endIndex = startIndex + chunkSizes[i];
                            groups.push(allIds.slice(startIndex, endIndex));
                            startIndex = endIndex;
                        }
                    }
                    if (groups.length > 0) {
                        for (const group of groups) {
                            const postAggregate1 = await this.postsService.aggregate([
                                {
                                    $lookup:
                                    {
                                        from: 'Page',
                                        let: { 'pageId': '$pageId' },
                                        pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$pageId'] }, isOfficial: true } },
                                        { $project: { email: 0 } }
                                        ],
                                        as: 'page'
                                    }
                                },
                                { $match: { isDraft: false, deleted: false, hidden: false, _id: { $nin: postId }, objective: { $ne: null, $in: group }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime } } },
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
                            ]);
                            if (postAggregate1.length > 0) {
                                postObject.push(postAggregate1);
                            }
                        }
                    }
                    const stackPage = [];
                    const switchSort = majorTrend.flag;
                    let sortSummationScore = undefined;
                    if (switchSort === true) {
                        if (postObject.length > 0) {
                            sortSummationScore = postObject.sort((a, b) => b[0].summationScore - a[0].summationScore);
                        }
                        if (sortSummationScore.length > 0) {
                            for (let i = 0; i < sortSummationScore[0].length; i++) {
                                for (let j = 0; j < sortSummationScore.length; j++) {
                                    if (sortSummationScore[j][i] !== undefined && sortSummationScore[j][i] !== null) {
                                        stackPage.push(sortSummationScore[j][i]);
                                    } else {
                                        continue;
                                    }
                                }
                            }
                        }
                    } else {
                        if (postObject.length > 0) {
                            for (let i = 0; i < postObject[0].length; i++) {
                                for (let j = 0; j < postObject.length; j++) {
                                    if (postObject[j][i] !== undefined && postObject[j][i] !== null) {
                                        stackPage.push(postObject[j][i]);
                                    } else {
                                        continue;
                                    }
                                }
                            }
                        }
                    }
                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? majorTrend.title : majorTrend.title;
                    result.subtitle = undefined;
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = majorTrend.position;
                    for (const row of stackPage) {
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
                        if (userId !== undefined && userId !== undefined && userId !== '') {
                            const userLikes: UserLike[] = await this.userLikeService.find({ userId: new ObjectID(userId), subjectId: row._id, subjectType: LIKE_TYPE.POST });
                            if (userLikes.length > 0) {
                                row.isLike = true;
                            }
                        }

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
                        if (contents.owner.isOfficial === true) {
                            result.contents.push(contents);
                        }
                    }
                    result.dateTime = lastestDate;
                    resolve(result);
                } else if (majorTrend.type === 'post' && majorTrend.field === 'emergencyEvent') {
                    const bucketSAll = [];
                    const postObject = [];
                    const chunkSizes = [];
                    if (majorTrend.buckets.length >= 0) {
                        for (const pageGroups of majorTrend.buckets) {
                            bucketSAll.push(pageGroups.values);
                        }
                    }
                    if (bucketSAll.length > 0) {
                        for (let i = 0; i < bucketSAll[0].length; i++) {
                            chunkSizes.push(bucketSAll[i].length);
                        }
                    }
                    const groups = [];
                    if (bucketSAll.length > 0 && chunkSizes.length > 0) {
                        const allIds = bucketSAll.flat().map(id => new ObjectID(id));
                        let startIndex = 0;
                        for (let i = 0; i < chunkSizes.length; i++) {
                            const endIndex = startIndex + chunkSizes[i];
                            groups.push(allIds.slice(startIndex, endIndex));
                            startIndex = endIndex;
                        }
                    }
                    // bucketSAll = [[],[],[]]

                    if (groups.length > 0) {
                        for (const group of groups) {
                            const postAggregate1 = await this.postsService.aggregate([
                                {
                                    $lookup:
                                    {
                                        from: 'Page',
                                        let: { 'pageId': '$pageId' },
                                        pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$pageId'] }, isOfficial: true } },
                                        { $project: { email: 0 } }
                                        ],
                                        as: 'page'
                                    }
                                },
                                { $match: { isDraft: false, deleted: false, hidden: false, _id: { $nin: postId }, pageId: { $ne: null }, emergencyEvent: { $ne: null, $in: group }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime } } },
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
                                    '$limit': majorTrend.limit
                                }
                            ]);
                            if (postAggregate1.length > 0) {
                                postObject.push(postAggregate1);
                            }
                        }
                    }
                    const stackPage = [];
                    const switchSort = majorTrend.flag;
                    let sortSummationScore = undefined;
                    if (switchSort === true) {
                        if (postObject.length > 0) {
                            sortSummationScore = postObject.sort((a, b) => b[0].summationScore - a[0].summationScore);
                        }
                        if (sortSummationScore.length > 0) {
                            for (let i = 0; i < sortSummationScore[0].length; i++) {
                                for (let j = 0; j < sortSummationScore.length; j++) {
                                    if (sortSummationScore[j][i] !== undefined && sortSummationScore[j][i] !== null) {
                                        stackPage.push(sortSummationScore[j][i]);
                                    } else {
                                        continue;
                                    }
                                }
                            }
                        }
                    } else {
                        if (postObject.length > 0) {
                            for (let i = 0; i < postObject[0].length; i++) {
                                for (let j = 0; j < postObject.length; j++) {
                                    if (postObject[j][i] !== undefined && postObject[j][i] !== null) {
                                        stackPage.push(postObject[j][i]);
                                    } else {
                                        continue;
                                    }
                                }
                            }
                        }
                    }
                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? majorTrend.title : this.config.title;
                    result.subtitle = (this.config === undefined || this.config.subtitle === undefined) ? 'โพสต์ที่เกิดขึ้นในเดือนนี้ ภายในแพลตฟอร์ม' : this.config.subtitle;
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = majorTrend.position;
                    for (const row of stackPage) {
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
                        if (userId !== undefined && userId !== undefined && userId !== '') {
                            const userLikes: UserLike[] = await this.userLikeService.find({ userId: new ObjectID(userId), subjectId: row._id, subjectType: LIKE_TYPE.POST });
                            if (userLikes.length > 0) {
                                row.isLike = true;
                            }
                        }

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
                } else if (majorTrend.type === 'post' && majorTrend.field === 'hashtag') {
                    const bucketSAll = [];
                    const postAggregateAll = [];
                    const chunkSizes = [];
                    if (majorTrend.buckets.length >= 0) {
                        for (const hashTags of majorTrend.buckets) {
                            bucketSAll.push(hashTags.values);
                        }
                    }
                    const stackHashTags = [];
                    if (bucketSAll.length > 0) {
                        for (const hashTag of bucketSAll) {
                            const hashTags = await this.hashTagService.aggregate(
                                [
                                    {
                                        $match: { name: { $in: hashTag } },
                                    },
                                    {
                                        $project: {
                                            _id: 1
                                        }
                                    }
                                ]
                            );
                            stackHashTags.push(hashTags);
                        }
                    }
                    const IdshashTags = [];
                    if (stackHashTags.length > 0) {
                        for (let i = 0; i < stackHashTags.length; i++) {
                            chunkSizes.push(stackHashTags[i].length);
                        }
                    }
                    if (stackHashTags.length > 0 && chunkSizes.length > 0) {
                        const allIds = stackHashTags.flat().map(id => new ObjectID(id._id));
                        let startIndex = 0;
                        for (let i = 0; i < chunkSizes.length; i++) {
                            const endIndex = startIndex + chunkSizes[i];
                            IdshashTags.push(allIds.slice(startIndex, endIndex));
                            startIndex = endIndex;
                        }
                    }
                    if (stackHashTags.length > 0) {
                        for (const stackHashTag of IdshashTags) {
                            const postAggregateSet1 = await this.postsService.aggregate(
                                [
                                    {
                                        $lookup:
                                        {
                                            from: 'Page',
                                            let: { 'pageId': '$pageId' },
                                            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$pageId'] }, isOfficial: true } },
                                            { $project: { email: 0 } }
                                            ],
                                            as: 'page'
                                        }
                                    },
                                    { $match: { isDraft: false, deleted: false, hidden: false, _id: { $nin: postId }, postsHashTags: { $in: stackHashTag }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime } } },
                                    { $sort: { summationScore: -1 } },
                                    {
                                        $limit: majorTrend.limit
                                    },
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
                                    }
                                ]
                            );
                            if (postAggregateSet1.length > 0) {
                                postAggregateAll.push(postAggregateSet1);
                            }
                        }
                    }
                    const stackPage = [];
                    const switchSort = majorTrend.flag;
                    let sortSummationScore = undefined;
                    if (switchSort === true) {
                        if (postAggregateAll.length > 0) {
                            sortSummationScore = postAggregateAll.sort((a, b) => b[0].summationScore - a[0].summationScore);
                        }
                        if (sortSummationScore.length > 0) {
                            for (let i = 0; i < sortSummationScore[0].length; i++) {
                                for (let j = 0; j < sortSummationScore.length; j++) {
                                    if (sortSummationScore[j][i] !== undefined && sortSummationScore[j][i] !== null) {
                                        stackPage.push(sortSummationScore[j][i]);
                                    } else {
                                        continue;
                                    }
                                }
                            }
                        }
                    } else {
                        if (postAggregateAll.length > 0) {
                            for (let i = 0; i < postAggregateAll[0].length; i++) {
                                for (let j = 0; j < postAggregateAll.length; j++) {
                                    if (postAggregateAll[j][i] !== undefined && postAggregateAll[j][i] !== null) {
                                        stackPage.push(postAggregateAll[j][i]);
                                    } else {
                                        continue;
                                    }
                                }
                            }
                        }
                    }
                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? majorTrend.title : majorTrend.title;
                    result.subtitle = '';
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = majorTrend.position;
                    for (const row of stackPage) {
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
                        if (userId !== undefined && userId !== undefined && userId !== '') {
                            const userLikes: UserLike[] = await this.userLikeService.find({ userId: new ObjectID(userId), subjectId: row._id, subjectType: LIKE_TYPE.POST });
                            if (userLikes.length > 0) {
                                row.isLike = true;
                            }
                        }

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
                } else if (majorTrend.type === 'hashtag' && majorTrend.field === 'count') {
                    const bucketF = [];
                    const hashTagMost = await this.hashTagService.searchHashSec(limit);
                    if (hashTagMost.length >= 0) {
                        for (const hashTagMostS of hashTagMost) {
                            bucketF.push(new ObjectID(hashTagMostS.id));
                        }
                    }
                    const postStmt = [
                        {
                            $lookup:
                            {
                                from: 'Page',
                                let: { 'pageId': '$pageId' },
                                pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$pageId'] }, isOfficial: true } },
                                { $project: { email: 0 } }
                                ],
                                as: 'page'
                            }
                        },
                        { $match: { isDraft: false, deleted: false, hidden: false, _id: { $nin: postId }, postsHashTags: { $in: bucketF } } },
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
                            '$limit': majorTrend.limit
                        }

                    ];

                    const postAggregate = await this.postsService.aggregate(postStmt);
                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? majorTrend.title : this.config.title;
                    result.subtitle = '';
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = majorTrend.position;
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
                        if (userId !== undefined && userId !== undefined && userId !== '') {
                            const userLikes: UserLike[] = await this.userLikeService.find({ userId: new ObjectID(userId), subjectId: row._id, subjectType: LIKE_TYPE.POST });
                            if (userLikes.length > 0) {
                                row.isLike = true;
                            }
                        }

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
                } else if (majorTrend.type === 'page' && majorTrend.field === 'group') {
                    const bucketSAll = [];
                    const pageStacksId = [];
                    const pageStacks = [];
                    if (majorTrend.buckets.length >= 0) {
                        for (const pageGroups of majorTrend.buckets) {
                            bucketSAll.push(pageGroups.values);
                        }
                    }
                    if (bucketSAll.length > 0) {
                        for (let i = 0; i < bucketSAll.length; i++) {
                            if (bucketSAll[i].length > 0) {
                                const pageProvinceZ = await this.pageService.aggregateP(
                                    [
                                        {
                                            $match: { isOfficial: true, banned: false, group: { $in: bucketSAll[i] } }
                                        },
                                        {
                                            $limit: majorTrend.limit
                                        },
                                        {
                                            $project: {
                                                _id: 1
                                            }
                                        }

                                    ]
                                );
                                if (pageProvinceZ.length > 0) {
                                    pageStacksId.push(pageProvinceZ);
                                }
                            } else {
                                continue;
                            }
                        }
                    }
                    /* 
                    const pageProvince = await this.pageService.searchPageProvince(bucketF);
                    console.log('pageProvince',pageProvince);
                    for(const pageStack of pageProvince){
                        if(pageStack !== undefined && pageStack !== null){
                            pageStackId.push(pageStack.id);
                        }
                    } */
                    let pageIds = undefined;
                    if (pageStacksId.length > 0) {
                        pageIds = pageStacksId.map(subArr => subArr.map(obj => Object.values(obj)[0]));
                    }
                    if (pageIds.length > 0) {
                        for (const pageId of pageIds) {
                            const postAggregateSet1 = await this.postsService.aggregate(
                                [
                                    {
                                        $lookup:
                                        {
                                            from: 'Page',
                                            let: { 'pageId': '$pageId' },
                                            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$pageId'] }, isOfficial: true } },
                                            { $project: { email: 0 } }
                                            ],
                                            as: 'page'
                                        }
                                    },
                                    { $match: { isDraft: false, deleted: false, hidden: false, _id: { $nin: postId }, pageId: { $in: pageId }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime } } },
                                    { $sort: { summationScore: -1 } },
                                    {
                                        $limit: limit
                                    },
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
                                        $project: { story: 0 }
                                    },
                                ]
                            );
                            if (postAggregateSet1.length > 0) {
                                pageStacks.push(postAggregateSet1);
                            }
                        }
                    }
                    // set 1
                    const stackPage = [];
                    const switchSort = majorTrend.flag;
                    let sortSummationScore = undefined;
                    if (switchSort === true) {
                        if (pageStacks.length > 0) {
                            sortSummationScore = pageStacks.sort((a, b) => b[0].summationScore - a[0].summationScore);
                        }
                        if (sortSummationScore.length > 0) {
                            for (let i = 0; i < sortSummationScore[0].length; i++) {
                                for (let j = 0; j < sortSummationScore.length; j++) {
                                    if (sortSummationScore[j][i] !== undefined && sortSummationScore[j][i] !== null) {
                                        stackPage.push(sortSummationScore[j][i]);
                                    } else {
                                        continue;
                                    }
                                }
                            }
                        }
                    } else {
                        if (pageStacks.length > 0) {
                            for (let i = 0; i < pageStacks[0].length; i++) {
                                for (let j = 0; j < pageStacks.length; j++) {
                                    if (pageStacks[j][i] !== undefined && pageStacks[j][i] !== null) {
                                        stackPage.push(pageStacks[j][i]);
                                    } else {
                                        continue;
                                    }
                                }
                            }
                        }
                    }
                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? majorTrend.title : majorTrend.title;
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = majorTrend.position;
                    for (const row of stackPage) {
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
                        if (userId !== undefined && userId !== undefined && userId !== '') {
                            const userLikes: UserLike[] = await this.userLikeService.find({ userId: new ObjectID(userId), subjectId: row._id, subjectType: LIKE_TYPE.POST });
                            if (userLikes.length > 0) {
                                row.isLike = true;
                            }
                        }

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
                } else if (majorTrend.type === 'page' && majorTrend.field === 'province') {
                    const bucketAll = [];
                    if (majorTrend.buckets.length >= 0) {
                        for (const provinceAll of majorTrend.buckets) {
                            bucketAll.push(provinceAll.values);
                        }
                    }
                    const pageStacksId = [];
                    const postsProvince = [];
                    /* 
                    const pageProvince = await this.pageService.searchPageProvince(bucketF);
                    console.log('pageProvince',pageProvince);
                    for(const pageStack of pageProvince){
                        if(pageStack !== undefined && pageStack !== null){
                            pageStackId.push(pageStack.id);
                        }
                    } */
                    if (bucketAll.length > 0) {
                        for (let i = 0; i < bucketAll.length; i++) {
                            if (bucketAll[i].length > 0) {
                                const pageProvinceZ = await this.pageService.aggregateP(
                                    [
                                        {
                                            $match: { isOfficial: true, banned: false, province: { $in: bucketAll[i] } }
                                        },
                                        {
                                            $limit: majorTrend.limit
                                        },
                                        {
                                            $project: {
                                                _id: 1
                                            }
                                        }

                                    ]
                                );
                                pageStacksId.push(pageProvinceZ);
                            } else {
                                continue;
                            }
                        }
                    }
                    let pageIds = undefined;
                    if (pageStacksId.length > 0) {
                        pageIds = pageStacksId.map(subArr => subArr.map(obj => Object.values(obj)[0]));
                    }
                    if (pageIds.length > 0) {
                        for (const pageId of pageIds) {
                            const postAggregateSetZ = await this.postsService.aggregate(
                                [
                                    {
                                        $lookup:
                                        {
                                            from: 'Page',
                                            let: { 'pageId': '$pageId' },
                                            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$pageId'] }, isOfficial: true } },
                                            { $project: { email: 0 } }
                                            ],
                                            as: 'page'
                                        }
                                    },
                                    { $match: { isDraft: false, deleted: false, hidden: false, _id: { $nin: postId }, pageId: { $in: pageId }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime } } },
                                    { $sort: { summationScore: -1 } },
                                    {
                                        $limit: majorTrend.limit
                                    },
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
                                        $project: { story: 0 }
                                    },

                                ]
                            );
                            if (postAggregateSetZ.length > 0) {
                                postsProvince.push(postAggregateSetZ);
                            }
                        }
                    }
                    /* 
                    if(pageStacksId.length>0){
                        for(let i =0;i<pageStacksId.length;i++){
                            for(let j = 0;j<pageStacksId[i].length;j++){
                                console.log('pageStacksId',pageStacksId[i][j]);
                            }
                        }
                    } */
                    const stackPage = [];
                    const switchSort = majorTrend.flag;
                    let sortSummationScore = undefined;
                    if (switchSort === true) {
                        if (postsProvince.length > 0) {
                            sortSummationScore = postsProvince.sort((a, b) => b[0].summationScore - a[0].summationScore);
                        }
                        // set 1
                        if (sortSummationScore.length > 0) {
                            for (let i = 0; i < sortSummationScore[0].length; i++) {
                                for (let j = 0; j < sortSummationScore.length; j++) {
                                    if (sortSummationScore[j][i] !== undefined && sortSummationScore[j][i] !== null) {
                                        stackPage.push(sortSummationScore[j][i]);
                                    } else {
                                        continue;
                                    }
                                }
                            }
                        }
                    } else {
                        if (postsProvince.length > 0) {
                            for (let i = 0; i < postsProvince[0].length; i++) {
                                for (let j = 0; j < postsProvince.length; j++) {
                                    if (postsProvince[j][i] !== undefined && postsProvince[j][i] !== null) {
                                        stackPage.push(postsProvince[j][i]);
                                    } else {
                                        continue;
                                    }
                                }
                            }
                        }
                    }
                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? majorTrend.title : majorTrend.title;
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = majorTrend.position;
                    for (const row of stackPage) {
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
                        if (userId !== undefined && userId !== undefined && userId !== '') {
                            const userLikes: UserLike[] = await this.userLikeService.find({ userId: new ObjectID(userId), subjectId: row._id, subjectType: LIKE_TYPE.POST });
                            if (userLikes.length > 0) {
                                row.isLike = true;
                            }
                        }

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
                } else if (majorTrend.type === 'page' && majorTrend.field === 'id') {
                    const bucketSAll = [];
                    const bucketAll = [];
                    const chunkSizes = [];
                    if (majorTrend.buckets.length >= 0) {
                        for (const IdAll of majorTrend.buckets) {
                            bucketSAll.push(IdAll.values);
                        }
                    }

                    if (bucketSAll.length > 0) {
                        for (let i = 0; i < bucketSAll[0].length; i++) {
                            chunkSizes.push(bucketSAll[i].length);
                        }
                    }
                    const groups = [];
                    if (bucketSAll.length > 0 && chunkSizes.length > 0) {
                        const allIds = bucketSAll.flat().map(id => new ObjectID(id));
                        let startIndex = 0;
                        for (let i = 0; i < chunkSizes.length; i++) {
                            const endIndex = startIndex + chunkSizes[i];
                            groups.push(allIds.slice(startIndex, endIndex));
                            startIndex = endIndex;
                        }
                    }
                    // set 1
                    if (groups.length > 0) {
                        for (const group of groups) {
                            const postAggregateSet = await this.postsService.aggregate(
                                [
                                    {
                                        $lookup:
                                        {
                                            from: 'Page',
                                            let: { 'pageId': '$pageId' },
                                            pipeline: [
                                                { $match: { $expr: { $eq: ['$_id', '$$pageId'] } } },
                                                { $project: { email: 0 } }
                                            ],
                                            as: 'page'
                                        }
                                    },
                                    { $match: { isDraft: false, deleted: false, hidden: false, _id: { $nin: postId }, pageId: { $in: group }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime } } },
                                    { $sort: { summationScore: -1 } },
                                    {
                                        $limit: majorTrend.limit
                                    },
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
                                ]
                            );
                            if (postAggregateSet.length > 0) {
                                bucketAll.push(postAggregateSet);
                            }
                        }
                    }
                    const stackPage = [];
                    const switchSort = majorTrend.flag;
                    let sortSummationScore = undefined;
                    if (switchSort === true) {
                        if (bucketAll.length > 0) {
                            sortSummationScore = bucketAll.sort((a, b) => b[0].summationScore - a[0].summationScore);
                        }
                        if (sortSummationScore.length > 0) {
                            for (let i = 0; i < sortSummationScore[0].length; i++) {
                                for (let j = 0; j < sortSummationScore.length; j++) {
                                    if (sortSummationScore[j][i] !== undefined && sortSummationScore[j][i] !== null) {
                                        stackPage.push(sortSummationScore[j][i]);
                                    } else {
                                        continue;
                                    }
                                }
                            }
                        }
                    } else {
                        if (bucketAll.length > 0) {
                            for (let i = 0; i < bucketAll[0].length; i++) {
                                for (let j = 0; j < bucketAll.length; j++) {
                                    if (bucketAll[j][i] !== undefined && bucketAll[j][i] !== null) {
                                        stackPage.push(bucketAll[j][i]);
                                    } else {
                                        continue;
                                    }
                                }
                            }
                        }
                    }
                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? majorTrend.title : majorTrend.title;
                    result.subtitle = (this.config === undefined || this.config.subtitle === undefined) ? 'โพสต์ที่เกิดขึ้นในเดือนนี้ ภายในแพลตฟอร์ม' : this.config.subtitle;
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = majorTrend.position;
                    for (const row of stackPage) {
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
                        if (userId !== undefined && userId !== undefined && userId !== '') {
                            const userLikes: UserLike[] = await this.userLikeService.find({ userId: new ObjectID(userId), subjectId: row._id, subjectType: LIKE_TYPE.POST });
                            if (userLikes.length > 0) {
                                row.isLike = true;
                            }
                        }

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
                } else {
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? majorTrend.title : 'เกาะกระแส';
                    result.subtitle = '';
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = null;
                    // result.contents.push(contents);
                    resolve(result);
                }
            } catch (error) {
                reject(error);
            }
        });
    }
    public processV2(): Promise<SectionModel> {
        return new Promise(async (resolve, reject) => {
            try {
                // get config

                let userId = undefined;
                // get startDateTime, endDateTime
                let startDateTime: Date = undefined;
                let endDateTime: Date = undefined;
                if (this.data !== undefined && this.data !== null) {
                    startDateTime = this.data.startDateTime;
                    endDateTime = this.data.endDateTime;
                    userId = this.data.userId;
                }
                // const today = moment().add(month, 'month').toDate();

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
                const today = moment().toDate();
                const postMatchStmt: any = {
                    isDraft: false,
                    deleted: false,
                    hidden: false
                };
                const dateTimeAndArray = [];
                if (startDateTime !== undefined && startDateTime !== null) {
                    dateTimeAndArray.push({ startDateTime: { $gte: startDateTime } });
                }
                if (endDateTime !== undefined && endDateTime !== null) {
                    dateTimeAndArray.push({ startDateTime: { $lte: endDateTime } });
                }

                if (dateTimeAndArray.length > 0) {
                    postMatchStmt['$and'] = dateTimeAndArray;
                } else {
                    // default if startDateTime and endDateTime is not defined.
                    postMatchStmt.startDateTime = { $lte: today };
                }
                /*
                historyQuery = [
                    { $match: { keyword: exp, userId: userObjId } },
                    { $sort: { createdDate: -1 } },
                    { $limit: historyLimit },
                    { $group: { _id: '$keyword', result: { $first: '$$ROOT' } } },
                    { $replaceRoot: { newRoot: '$result' } }
                ]; */

                // overide start datetime

                const postStmt = [
                    { $match: { isDraft: false, deleted: false, hidden: false, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime } } },
                    { $sort: { createdDate: -1 } },
                    {
                        $lookup:
                        {
                            from: 'Page',
                            let: { 'pageId': '$pageId' },
                            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$pageId'] }, isOfficial: true } },
                            { $project: { email: 0 } }
                            ],
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
                const postAggregate = await this.postsService.aggregate(postStmt);

                const lastestDate = null;
                const result: SectionModel = new SectionModel();
                result.title = (this.config === undefined || this.config.title === undefined) ? 'เกากระแส' : 'เกากระแส';
                result.subtitle = '';
                result.description = '';
                result.iconUrl = '';
                result.contents = [];
                result.type = this.getType(); // set type by processor type
                result.position = undefined;
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
                    if (userId !== undefined && userId !== undefined && userId !== '') {
                        const userLikes: UserLike[] = await this.userLikeService.find({ userId: new ObjectID(userId), subjectId: row._id, subjectType: LIKE_TYPE.POST });
                        if (userLikes.length > 0) {
                            row.isLike = true;
                        }
                    }

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