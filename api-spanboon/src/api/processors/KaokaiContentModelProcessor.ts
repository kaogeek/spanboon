import { AbstractSeparateSectionProcessor } from './AbstractSeparateSectionProcessor';
import { SectionModel } from '../models/SectionModel';
import { PostsService } from '../services/PostsService';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';
import { S3Service } from '../services/S3Service';
import { UserLikeService } from '../services/UserLikeService';
import { UserLike } from '../models/UserLike';
import { LIKE_TYPE } from '../../constants/LikeType';
import moment from 'moment';
import { ObjectID } from 'mongodb';
import { KaokaiTodayService } from '../services/KaokaiTodayService';
import { HashTagService } from '../services/HashTagService';
import { PageService } from '../services/PageService';
export class KaokaiContentModelProcessor extends AbstractSeparateSectionProcessor {
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

                let userId = undefined;
                let checkPosition1 = undefined;
                let checkPosition2 = undefined;
                let checkPosition3 = undefined;
                let checkPosition4 = undefined;
                // get startDateTime, endDateTime
                let startDateTime: Date = undefined;
                let endDateTime: Date = undefined;
                if (this.data !== undefined && this.data !== null) {
                    startDateTime = this.data.startDateTime;
                    endDateTime = this.data.endDateTime;
                    userId = this.data.userId;
                    checkPosition1 = this.data.checkPosition1;
                    checkPosition2 = this.data.checkPosition2;
                    checkPosition3 = this.data.checkPosition3;
                    checkPosition4 = this.data.checkPosition4;
                }
                const sortV = [];
                const negative = [];
                // const today = moment().add(month, 'month').toDate();
                for (const sort of sorts) {
                    if (sort !== undefined && sort !== null && sort > 0 && sort !== checkPosition1 && sort !== checkPosition2 && sort !== checkPosition3 && sort !== checkPosition4) {
                        sortV.push(sort);
                    } else if (sort !== undefined && sort !== null && sort < 0 && sort !== checkPosition1 && sort !== checkPosition2 && sort !== checkPosition3 && sort !== checkPosition4) {
                        negative.push(sort);
                    } else {
                        continue;
                    }
                }
                for (const nega of negative) {
                    if (nega !== undefined && nega !== null && nega !== checkPosition1 && nega !== checkPosition2 && nega !== checkPosition3 && nega !== checkPosition4) {
                        sortV.push(nega);
                    } else {
                        continue;
                    }
                }
                const ContentProcessor = await this.kaokaiTodayService.findOne({ position: sortV[0] });
                if (ContentProcessor === undefined) {
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? 'ก้าวไกลรอบด้าน' : 'ก้าวไกลรอบด้าน';
                    result.subtitle = '';
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = null;
                    // result.contents.push(contents);
                    resolve(result);
                }
                limit = (limit === undefined || limit === null) ? ContentProcessor.limit : this.DEFAULT_SEARCH_LIMIT;
                offset = (offset === undefined || offset === null) ? this.DEFAULT_SEARCH_OFFSET : offset;
                const searchFilter: SearchFilter = new SearchFilter();
                searchFilter.limit = limit;
                searchFilter.offset = offset;
                searchFilter.orderBy = {
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
                    hidden: false,

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

                if (ContentProcessor.type === 'post' && ContentProcessor.field === 'hashtag') {
                    const bucketF = [];
                    const bucketS = [];
                    const bucketT = [];
                    const postAggregateAll = [];
                    if (ContentProcessor.buckets.length >= 0) {
                        if (ContentProcessor.buckets[0] !== undefined && ContentProcessor.buckets[0] !== null) {
                            for (const provincesF of ContentProcessor.buckets[0].values) {
                                bucketF.push(provincesF);
                            }
                        }
                        // bucket 2 
                        if (ContentProcessor.buckets[1] !== undefined && ContentProcessor.buckets[1] !== null) {
                            for (const provinceS of ContentProcessor.buckets[1].values) {
                                bucketS.push(provinceS);
                            }
                        }
                        // bucket 3
                        if (ContentProcessor.buckets[2] !== undefined && ContentProcessor.buckets[2] !== null) {
                            for (const provinceT of ContentProcessor.buckets[2].values) {
                                bucketT.push(provinceT);
                            }
                        }
                    }
                    const hashTagStack1 = [];
                    const hashTagStack2 = [];
                    const hashTagStack3 = [];
                    const hashTagAll = [];
                    const hashTagSearch1 = await this.hashTagService.aggregate(
                        [
                            {
                                $match: { name: { $in: bucketF } },
                            }
                        ]);
                    const hashTagSearch2 = await this.hashTagService.aggregate(
                        [
                            {
                                $match: { name: { $in: bucketS } },
                            }
                        ]);
                    const hashTagSearch3 = await this.hashTagService.aggregate(
                        [
                            {
                                $match: { name: { $in: bucketT } },
                            }
                        ]);
                    if (hashTagSearch1.length > 0) {
                        for (const hashTag of hashTagSearch1) {
                            hashTagStack1.push(new ObjectID(hashTag._id));
                            hashTagAll.push(new ObjectID(hashTag._id));
                        }
                    }
                    if (hashTagSearch2.length > 0) {
                        for (const hashTag of hashTagSearch2) {
                            hashTagStack2.push(new ObjectID(hashTag._id));
                            hashTagAll.push(new ObjectID(hashTag._id));
                        }
                    }
                    if (hashTagSearch3.length > 0) {
                        for (const hashTag of hashTagSearch3) {
                            hashTagStack3.push(new ObjectID(hashTag._id));
                            hashTagAll.push(new ObjectID(hashTag._id));
                        }
                    }

                    const postAggregateSet1 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false, postsHashTags: { $in: hashTagStack1 }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime } } },
                            { $sort: { summationScore: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$pageId'] }, isOfficial: true } }],
                                    as: 'page'
                                }
                            },
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
                            }
                        ]
                    );
                    postAggregateAll.push(postAggregateSet1);
                    const postAggregateSet2 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false, postsHashTags: { $in: hashTagStack2 }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime } } },
                            { $sort: { summationScore: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$pageId'] }, isOfficial: true } }],
                                    as: 'page'
                                }
                            },
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
                            }
                        ]
                    );
                    postAggregateAll.push(postAggregateSet2);
                    const postAggregateSet3 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false, postsHashTags: { $in: hashTagStack3 }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime } } },
                            { $sort: { summationScore: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$pageId'] }, isOfficial: true } }],
                                    as: 'page'
                                }
                            },
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
                            }
                        ]
                    );
                    postAggregateAll.push(postAggregateSet3);
                    const stackPage = [];
                    if(postAggregateAll.length>0){
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
                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? ContentProcessor.title : 'ก้าวไกลรอบด้าน';
                    result.subtitle = '';
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = ContentProcessor.position;
                    for (const row of stackPage) {
                        const user = (row.user !== undefined && row.user.length > 0) ? row.user[0] : undefined;
                        const firstImage = (row.gallery.length > 0) ? row.gallery[0] : undefined;

                        const contents: any = {};
                        contents.coverPageUrl = (row.gallery.length > 0) ? row.gallery[0].imageURL : undefined;
                        if (firstImage !== undefined && firstImage.s3FilePath !== undefined && firstImage.s3FilePath !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3FilePath);
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
                } else if (ContentProcessor.type === 'post' && ContentProcessor.field === 'score') {
                    const postStmt = [
                        { $match: postMatchStmt },
                        { $sort: { summationScore: -1 } },

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
                    result.title = (this.config === undefined || this.config.title === undefined) ? ContentProcessor.title : 'ก้าวไกลรอบด้าน';
                    result.subtitle = '';
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = ContentProcessor.position;
                    for (const row of postAggregate) {
                        const user = (row.user !== undefined && row.user.length > 0) ? row.user[0] : undefined;
                        const firstImage = (row.gallery.length > 0) ? row.gallery[0] : undefined;

                        const contents: any = {};
                        contents.coverPageUrl = (row.gallery.length > 0) ? row.gallery[0].imageURL : undefined;
                        if (firstImage !== undefined && firstImage.s3FilePath !== undefined && firstImage.s3FilePath !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3FilePath);
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
                } else if (ContentProcessor.type === 'post' && ContentProcessor.field === 'objective') {
                    const bucketF = [];
                    const bucketS = [];
                    const bucketT = [];
                    const bucketAll = [];
                    if (ContentProcessor.buckets.length >= 0) {
                        if (ContentProcessor.buckets[0] !== undefined && ContentProcessor.buckets[0] !== null) {
                            for (const provincesF of ContentProcessor.buckets[0].values) {
                                bucketF.push(new ObjectID(provincesF));
                            }
                        }
                        // bucket 2 
                        if (ContentProcessor.buckets[1] !== undefined && ContentProcessor.buckets[1] !== null) {
                            for (const provinceS of ContentProcessor.buckets[1].values) {
                                bucketS.push(new ObjectID(provinceS));
                            }
                        }
                        // bucket 3
                        if (ContentProcessor.buckets[2] !== undefined && ContentProcessor.buckets[2] !== null) {
                            for (const provinceT of ContentProcessor.buckets[2].values) {
                                bucketT.push(new ObjectID(provinceT));
                            }
                        }
                    }

                    const postStmt = [
                        { $match: { isDraft: false, deleted: false, hidden: false, objective: { $ne: null, $in: bucketF } } },
                        { $sort: { summationScore: -1 } },

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
                    if (postAggregate.length > 0) {
                        bucketAll.push(postAggregate);
                    }
                    const postStmt2 = [
                        { $match: { isDraft: false, deleted: false, hidden: false, objective: { $ne: null, $in: bucketS } } },
                        { $sort: { summationScore: -1 } },

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
                    const postAggregate2 = await this.postsService.aggregate(postStmt2);
                    if (postAggregate2.length > 0) {
                        bucketAll.push(postAggregate2);
                    }
                    const postStmt3 = [
                        { $match: { isDraft: false, deleted: false, hidden: false, objective: { $ne: null, $in: bucketS } } },
                        { $sort: { summationScore: -1 } },

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

                    const postAggregate3 = await this.postsService.aggregate(postStmt3);
                    if (postAggregate3.length > 0) {
                        bucketAll.push(postAggregate3);
                    }
                    const stackPage = [];
                    if(bucketAll.length>0){
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
                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? ContentProcessor.title : 'ก้าวไกลรอบด้าน';
                    result.subtitle = '';
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = ContentProcessor.position;
                    for (const row of stackPage) {
                        const user = (row.user !== undefined && row.user.length > 0) ? row.user[0] : undefined;
                        const firstImage = (row.gallery.length > 0) ? row.gallery[0] : undefined;

                        const contents: any = {};
                        contents.coverPageUrl = (row.gallery.length > 0) ? row.gallery[0].imageURL : undefined;
                        if (firstImage !== undefined && firstImage.s3FilePath !== undefined && firstImage.s3FilePath !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3FilePath);
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
                } else if (ContentProcessor.type === 'post' && ContentProcessor.field === 'emergencyEvent') {
                    const bucketF = [];
                    const bucketS = [];
                    const bucketT = [];
                    const postObject = [];
                    if (ContentProcessor.buckets.length >= 0) {
                        if (ContentProcessor.buckets[0] !== undefined && ContentProcessor.buckets[0] !== null) {
                            for (const provincesF of ContentProcessor.buckets[0].values) {
                                bucketF.push(new ObjectID(provincesF));
                            }
                        }
                        // bucket 2 
                        if (ContentProcessor.buckets[1] !== undefined && ContentProcessor.buckets[1] !== null) {
                            for (const provinceS of ContentProcessor.buckets[1].values) {
                                bucketS.push(new ObjectID(provinceS));
                            }
                        }
                        // bucket 3
                        if (ContentProcessor.buckets[2] !== undefined && ContentProcessor.buckets[2] !== null) {
                            for (const provinceT of ContentProcessor.buckets[2].values) {
                                bucketT.push(new ObjectID(provinceT));
                            }
                        }
                    }

                    const postStmt1 = [
                        { $match: { isDraft: false, deleted: false, hidden: false, pageId: { $ne: null }, emergencyEvent: { $ne: null, $in: bucketF }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime } } },
                        { $sort: { summationScore: -1 } },

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

                    const postAggregate1 = await this.postsService.aggregate(postStmt1);
                    if (postAggregate1.length > 0) {
                        postObject.push(postAggregate1);
                    }

                    const postStmt2 = [
                        { $match: { isDraft: false, deleted: false, hidden: false, pageId: { $ne: null }, emergencyEvent: { $ne: null, $in: bucketS } } },
                        { $sort: { summationScore: -1 } },

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

                    const postAggregate2 = await this.postsService.aggregate(postStmt2);
                    if (postAggregate2.length > 0) {
                        postObject.push(postAggregate2);
                    }
                    const postStmt3 = [
                        { $match: { isDraft: false, deleted: false, hidden: false, pageId: { $ne: null }, emergencyEvent: { $ne: null, $in: bucketT } } },
                        { $sort: { summationScore: -1 } },

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
                    const postAggregate3 = await this.postsService.aggregate(postStmt3);
                    if (postAggregate3.length > 0) {
                        postObject.push(postAggregate3);
                    }
                    const stackPage = [];
                    if(postObject.length>0){
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
                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? ContentProcessor.title : 'ก้าวไกลรอบด้าน';
                    result.subtitle = (this.config === undefined || this.config.subtitle === undefined) ? 'โพสต์ที่เกิดขึ้นในเดือนนี้ ภายในแพลตฟอร์ม' : this.config.subtitle;
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = ContentProcessor.position;
                    for (const row of stackPage) {
                        const user = (row.user !== undefined && row.user.length > 0) ? row.user[0] : undefined;
                        const firstImage = (row.gallery.length > 0) ? row.gallery[0] : undefined;

                        const contents: any = {};
                        contents.coverPageUrl = (row.gallery.length > 0) ? row.gallery[0].imageURL : undefined;
                        if (firstImage !== undefined && firstImage.s3FilePath !== undefined && firstImage.s3FilePath !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3FilePath);
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
                } else if (ContentProcessor.type === 'page' && ContentProcessor.field === 'group') {
                    const bucketF = [];
                    const bucketS = [];
                    const bucketT = [];
                    if (ContentProcessor.buckets.length >= 0) {
                        if (ContentProcessor.buckets[0] !== undefined && ContentProcessor.buckets[0] !== null) {
                            for (const provincesF of ContentProcessor.buckets[0].values) {
                                bucketF.push(provincesF);
                            }
                        }
                        // bucket 2 
                        if (ContentProcessor.buckets[1] !== undefined && ContentProcessor.buckets[1] !== null) {
                            for (const provinceS of ContentProcessor.buckets[1].values) {
                                bucketS.push(provinceS);
                            }
                        }
                        // bucket 3
                        if (ContentProcessor.buckets[2] !== undefined && ContentProcessor.buckets[2] !== null) {
                            for (const provinceT of ContentProcessor.buckets[2].values) {
                                bucketT.push(provinceT);
                            }
                        }
                    }

                    const pageStackprovince1 = [];
                    const pageStackprovince2 = [];
                    const pageStackprovince3 = [];

                    const pageStacks = [];

                    /* 
                    const pageProvince = await this.pageService.searchPageProvince(bucketF);
                    console.log('pageProvince',pageProvince);
                    for(const pageStack of pageProvince){
                        if(pageStack !== undefined && pageStack !== null){
                            pageStackId.push(pageStack.id);
                        }
                    } */
                    const pageProvince1 = await this.pageService.aggregateP(
                        [
                            {
                                $match: { isOfficial: true, banned: false, group: { $in: bucketF } }
                            },
                            {
                                $limit: ContentProcessor.limit
                            }
                        ]
                    );
                    for (const provinces1 of pageProvince1) {
                        pageStackprovince1.push(new ObjectID(provinces1._id));
                    }
                    const pageProvince2 = await this.pageService.aggregateP(
                        [
                            {
                                $match: { isOfficial: true, banned: false, group: { $in: bucketS } }
                            },
                            {
                                $limit: ContentProcessor.limit
                            }
                        ]
                    );
                    for (const provinces2 of pageProvince2) {
                        pageStackprovince2.push(new ObjectID(provinces2._id));
                    }

                    const pageProvince3 = await this.pageService.aggregateP(
                        [
                            {
                                $match: { isOfficial: true, banned: false, group: { $in: bucketT } }
                            },
                            {
                                $limit: ContentProcessor.limit
                            }
                        ]
                    );
                    for (const provinces3 of pageProvince3) {
                        pageStackprovince3.push(new ObjectID(provinces3._id));
                    }

                    const postAggregateSet1 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false, pageId: { $in: pageStackprovince1 }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime } } },
                            { $sort: { summationScore: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$_id', '$$pageId'] } } },
                                    ],
                                    as: 'page'
                                }
                            },
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
                    const postAggregateSet2 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false, pageId: { $in: pageStackprovince2 }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime } } },
                            { $sort: { summationScore: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$_id', '$$pageId'] } } },
                                    ],
                                    as: 'page'
                                }
                            },
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
                    if (postAggregateSet2.length > 0) {
                        pageStacks.push(postAggregateSet2);
                    }
                    const postAggregateSet3 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false, pageId: { $in: pageStackprovince3 }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime } } },
                            { $sort: { summationScore: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$_id', '$$pageId'] } } },
                                    ],
                                    as: 'page'
                                }
                            },
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
                    if (postAggregateSet3.length > 0) {
                        pageStacks.push(postAggregateSet3);
                    }
                    // set 1
                    const stackPage = [];
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
                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? ContentProcessor.title : 'ก้าวไกลรอบด้าน';
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = ContentProcessor.position;
                    for (const row of stackPage) {
                        const user = (row.user !== undefined && row.user.length > 0) ? row.user[0] : undefined;
                        const firstImage = (row.gallery.length > 0) ? row.gallery[0] : undefined;

                        const contents: any = {};
                        contents.coverPageUrl = (row.gallery.length > 0) ? row.gallery[0].imageURL : undefined;
                        if (firstImage !== undefined && firstImage.s3FilePath !== undefined && firstImage.s3FilePath !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3FilePath);
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
                } else if (ContentProcessor.type === 'page' && ContentProcessor.field === 'province') {
                    const bucketF = [];
                    const bucketS = [];
                    const bucketT = [];
                    if (ContentProcessor.buckets.length >= 0) {
                        if (ContentProcessor.buckets[0] !== undefined && ContentProcessor.buckets[0] !== null) {
                            for (const provincesF of ContentProcessor.buckets[0].values) {
                                bucketF.push(provincesF);
                            }
                        }
                        // bucket 2 
                        if (ContentProcessor.buckets[1] !== undefined && ContentProcessor.buckets[1] !== null) {
                            for (const provinceS of ContentProcessor.buckets[1].values) {
                                bucketS.push(provinceS);
                            }
                        }
                        // bucket 3
                        if (ContentProcessor.buckets[2] !== undefined && ContentProcessor.buckets[2] !== null) {
                            for (const provinceT of ContentProcessor.buckets[2].values) {
                                bucketT.push(provinceT);
                            }
                        }
                    }
                    const pageStackprovince1 = [];
                    const pageStackprovince2 = [];
                    const pageStackprovince3 = [];

                    const pageStacks = [];

                    /* 
                    const pageProvince = await this.pageService.searchPageProvince(bucketF);
                    console.log('pageProvince',pageProvince);
                    for(const pageStack of pageProvince){
                        if(pageStack !== undefined && pageStack !== null){
                            pageStackId.push(pageStack.id);
                        }
                    } */
                    const pageProvince1 = await this.pageService.aggregateP(
                        [
                            {
                                $match: { isOfficial: true, banned: false, province: { $in: bucketF } }
                            },
                            {
                                $limit: ContentProcessor.limit
                            }
                        ]
                    );
                    for (const provinces1 of pageProvince1) {
                        pageStackprovince1.push(new ObjectID(provinces1._id));
                    }
                    const pageProvince2 = await this.pageService.aggregateP(
                        [
                            {
                                $match: { isOfficial: true, banned: false, province: { $in: bucketS } }
                            },
                            {
                                $limit: ContentProcessor.limit
                            }
                        ]
                    );
                    for (const provinces2 of pageProvince2) {
                        pageStackprovince2.push(new ObjectID(provinces2._id));
                    }

                    const pageProvince3 = await this.pageService.aggregateP(
                        [
                            {
                                $match: { isOfficial: true, banned: false, province: { $in: bucketT } }
                            },
                            {
                                $limit: ContentProcessor.limit
                            }
                        ]
                    );
                    for (const provinces3 of pageProvince3) {
                        pageStackprovince3.push(new ObjectID(provinces3._id));
                    }

                    const postAggregateSet1 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false, pageId: { $in: pageStackprovince1 }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime }  } },
                            { $sort: { summationScore: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$_id', '$$pageId'] } } },
                                    ],
                                    as: 'page'
                                }
                            },
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
                    const postAggregateSet2 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false, pageId: { $in: pageStackprovince2 }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime }  } },
                            { $sort: { summationScore: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$_id', '$$pageId'] } } },
                                    ],
                                    as: 'page'
                                }
                            },
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
                    if (postAggregateSet2.length > 0) {
                        pageStacks.push(postAggregateSet2);
                    }
                    const postAggregateSet3 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false, pageId: { $in: pageStackprovince3 }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime }  } },
                            { $sort: { summationScore: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$_id', '$$pageId'] } } },
                                    ],
                                    as: 'page'
                                }
                            },
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
                    if (postAggregateSet3.length > 0) {
                        pageStacks.push(postAggregateSet3);
                    }
                    // set 1
                    const stackPage = [];
                    if(pageStacks.length>0){
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
                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? ContentProcessor.title : 'ก้าวไกลรอบด้าน';
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = ContentProcessor.position;
                    for (const row of stackPage) {
                        const user = (row.user !== undefined && row.user.length > 0) ? row.user[0] : undefined;
                        const firstImage = (row.gallery.length > 0) ? row.gallery[0] : undefined;

                        const contents: any = {};
                        contents.coverPageUrl = (row.gallery.length > 0) ? row.gallery[0].imageURL : undefined;
                        if (firstImage !== undefined && firstImage.s3FilePath !== undefined && firstImage.s3FilePath !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3FilePath);
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
                } else if (ContentProcessor.type === 'page' && ContentProcessor.field === 'id') {
                    const bucketAll = [];
                    const bucketF = [];
                    const bucketS = [];
                    const bucketT = [];

                    if (ContentProcessor.buckets.length >= 0) {
                        if (ContentProcessor.buckets[0] !== undefined && ContentProcessor.buckets[0] !== null) {
                            for (const bucketFs of ContentProcessor.buckets[0].values) {
                                bucketF.push(new ObjectID(bucketFs));
                            }
                        }
                        // bucket 2 
                        if (ContentProcessor.buckets[1] !== undefined && ContentProcessor.buckets[1] !== null) {
                            for (const bucketSs of ContentProcessor.buckets[1].values) {
                                bucketS.push(new ObjectID(bucketSs));

                            }
                        }
                        // bucket 3
                        if (ContentProcessor.buckets[2] !== undefined && ContentProcessor.buckets[2] !== null) {
                            for (const bucketTs of ContentProcessor.buckets[2].values) {
                                bucketT.push(new ObjectID(bucketTs));
                            }
                        }
                    }
                    // set 1
                    const postAggregateSet1 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false, pageId: { $in: bucketF }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime } } },
                            { $sort: { summationScore: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$_id', '$$pageId'] } } }
                                    ],
                                    as: 'page'
                                }
                            },
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
                        bucketAll.push(postAggregateSet1);
                    }
                    const postAggregateSet2 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false, pageId: { $in: bucketS }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime } } },
                            { $sort: { summationScore: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$_id', '$$pageId'] } } }
                                    ],
                                    as: 'page'
                                }
                            },
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
                    if (postAggregateSet2.length) {
                        bucketAll.push(postAggregateSet2);
                    }
                    const postAggregateSet3 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false, pageId: { $in: bucketT }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime } } },
                            { $sort: { summationScore: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$_id', '$$pageId'] } } }
                                    ],
                                    as: 'page'
                                }
                            },
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
                    if (postAggregateSet3.length > 0) {
                        bucketAll.push(postAggregateSet3);
                    }
                    const stackPage = [];
                    if(bucketAll.length>0){
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
                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? ContentProcessor.title : 'ก้าวไกลรอบด้าน';
                    result.subtitle = (this.config === undefined || this.config.subtitle === undefined) ? 'โพสต์ที่เกิดขึ้นในเดือนนี้ ภายในแพลตฟอร์ม' : this.config.subtitle;
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = ContentProcessor.position;
                    for (const row of stackPage) {
                        const user = (row.user !== undefined && row.user.length > 0) ? row.user[0] : undefined;
                        const firstImage = (row.gallery.length > 0) ? row.gallery[0] : undefined;

                        const contents: any = {};
                        contents.coverPageUrl = (row.gallery.length > 0) ? row.gallery[0].imageURL : undefined;
                        if (firstImage !== undefined && firstImage.s3FilePath !== undefined && firstImage.s3FilePath !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3FilePath);
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
                } else if (ContentProcessor.type === 'hashtag' && ContentProcessor.field === 'count') {
                    const bucketF = [];
                    const hashTagMost = await this.hashTagService.searchHashSec(limit);
                    if (hashTagMost.length >= 0) {
                        for (const hashTagMostS of hashTagMost) {
                            bucketF.push(new ObjectID(hashTagMostS.id));
                        }
                    }
                    const postStmt = [
                        { $match: { isDraft: false, deleted: false, hidden: false, postsHashTags: { $ne: null, $in: bucketF } } },
                        { $sort: { summationScore: -1 } },

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
                            '$limit': ContentProcessor.limit
                        }

                    ];

                    const postAggregate = await this.postsService.aggregate(postStmt);

                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? ContentProcessor.title : 'ก้าวไกลรอบด้าน';
                    result.subtitle = '';
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = ContentProcessor.position;
                    for (const row of postAggregate) {
                        const user = (row.user !== undefined && row.user.length > 0) ? row.user[0] : undefined;
                        const firstImage = (row.gallery.length > 0) ? row.gallery[0] : undefined;

                        const contents: any = {};
                        contents.coverPageUrl = (row.gallery.length > 0) ? row.gallery[0].imageURL : undefined;
                        if (firstImage !== undefined && firstImage.s3FilePath !== undefined && firstImage.s3FilePath !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3FilePath);
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
                    result.title = (this.config === undefined || this.config.title === undefined) ? ContentProcessor.title : 'ก้าวไกลรอบด้าน';
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
                const position = [];
                const positionSequences = await this.kaokaiTodayService.find();
                for (const sequence of positionSequences) {
                    position.push(sequence.position);
                }
                const sorts = position.sort((a, b) => Math.abs(a) - Math.abs(b) || a - b);

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

                let userId = undefined;
                let checkPosition1 = undefined;
                let checkPosition2 = undefined;
                let checkPosition3 = undefined;
                let checkPosition4 = undefined;
                // get startDateTime, endDateTime
                let startDateTime: Date = undefined;
                let endDateTime: Date = undefined;
                if (this.data !== undefined && this.data !== null) {
                    startDateTime = this.data.startDateTime;
                    endDateTime = this.data.endDateTime;
                    userId = this.data.userId;
                    checkPosition1 = this.data.checkPosition1Un;
                    checkPosition2 = this.data.checkPosition2Un;
                    checkPosition3 = this.data.checkPosition3Un;
                    checkPosition4 = this.data.checkPosition4Un;
                }
                const sortV = [];
                const negative = [];
                // const today = moment().add(month, 'month').toDate();
                for (const sort of sorts) {
                    if (sort !== undefined && sort !== null && sort > 0 && sort !== checkPosition1 && sort !== checkPosition2 && sort !== checkPosition3 && sort !== checkPosition4) {
                        sortV.push(sort);
                    } else if (sort !== undefined && sort !== null && sort < 0 && sort !== checkPosition1 && sort !== checkPosition2 && sort !== checkPosition3 && sort !== checkPosition4) {
                        negative.push(sort);
                    } else {
                        continue;
                    }
                }
                for (const nega of negative) {
                    if (nega !== undefined && nega !== null && nega !== checkPosition1 && nega !== checkPosition2 && nega !== checkPosition3 && nega !== checkPosition4) {
                        sortV.push(nega);
                    } else {
                        continue;
                    }
                }
                const ContentProcessor = await this.kaokaiTodayService.findOne({ position: sortV[0] });
                if (ContentProcessor.position === null) {
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? ContentProcessor.title : 'ก้าวไกลรอบด้าน';
                    result.subtitle = '';
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = null;
                    // result.contents.push(contents);
                    resolve(result);
                }
                limit = (limit === undefined || limit === null) ? ContentProcessor.limit : this.DEFAULT_SEARCH_LIMIT;
                offset = (offset === undefined || offset === null) ? this.DEFAULT_SEARCH_OFFSET : offset;
                const searchFilter: SearchFilter = new SearchFilter();
                searchFilter.limit = limit;
                searchFilter.offset = offset;
                searchFilter.orderBy = {
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
                    hidden: false,

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

                if (ContentProcessor.type === 'post' && ContentProcessor.field === 'hashtag') {
                    const bucketF = [];
                    const bucketS = [];
                    const bucketT = [];
                    const postAggregateAll = [];
                    if (ContentProcessor.buckets.length >= 0) {
                        if (ContentProcessor.buckets[0] !== undefined && ContentProcessor.buckets[0] !== null) {
                            for (const provincesF of ContentProcessor.buckets[0].values) {
                                bucketF.push(provincesF);
                            }
                        }
                        // bucket 2 
                        if (ContentProcessor.buckets[1] !== undefined && ContentProcessor.buckets[1] !== null) {
                            for (const provinceS of ContentProcessor.buckets[1].values) {
                                bucketS.push(provinceS);
                            }
                        }
                        // bucket 3
                        if (ContentProcessor.buckets[2] !== undefined && ContentProcessor.buckets[2] !== null) {
                            for (const provinceT of ContentProcessor.buckets[2].values) {
                                bucketT.push(provinceT);
                            }
                        }
                    }
                    const hashTagStack1 = [];
                    const hashTagStack2 = [];
                    const hashTagStack3 = [];
                    const hashTagAll = [];
                    const hashTagSearch1 = await this.hashTagService.aggregate(
                        [
                            {
                                $match: { name: { $in: bucketF } },
                            }
                        ]);
                    const hashTagSearch2 = await this.hashTagService.aggregate(
                        [
                            {
                                $match: { name: { $in: bucketS } },
                            }
                        ]);
                    const hashTagSearch3 = await this.hashTagService.aggregate(
                        [
                            {
                                $match: { name: { $in: bucketT } },
                            }
                        ]);
                    if (hashTagSearch1.length > 0) {
                        for (const hashTag of hashTagSearch1) {
                            hashTagStack1.push(new ObjectID(hashTag._id));
                            hashTagAll.push(new ObjectID(hashTag._id));
                        }
                    }
                    if (hashTagSearch2.length > 0) {
                        for (const hashTag of hashTagSearch2) {
                            hashTagStack2.push(new ObjectID(hashTag._id));
                            hashTagAll.push(new ObjectID(hashTag._id));
                        }
                    }
                    if (hashTagSearch3.length > 0) {
                        for (const hashTag of hashTagSearch3) {
                            hashTagStack3.push(new ObjectID(hashTag._id));
                            hashTagAll.push(new ObjectID(hashTag._id));
                        }
                    }

                    const postAggregateSet1 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false, postsHashTags: { $in: hashTagStack1 }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime } } },
                            { $sort: { createdDate: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$pageId'] }, isOfficial: true } }],
                                    as: 'page'
                                }
                            },
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
                            }
                        ]
                    );
                    postAggregateAll.push(postAggregateSet1);
                    const postAggregateSet2 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false, postsHashTags: { $in: hashTagStack2 }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime } } },
                            { $sort: { createdDate: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$pageId'] }, isOfficial: true } }],
                                    as: 'page'
                                }
                            },
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
                            }
                        ]
                    );
                    postAggregateAll.push(postAggregateSet2);
                    const postAggregateSet3 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false, postsHashTags: { $in: hashTagStack3 }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime } } },
                            { $sort: { createdDate: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$pageId'] }, isOfficial: true } }],
                                    as: 'page'
                                }
                            },
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
                            }
                        ]
                    );
                    postAggregateAll.push(postAggregateSet3);
                    const stackPage = [];
                    for (let i = 0; i < postAggregateAll[0].length; i++) {
                        for (let j = 0; j < postAggregateAll.length; j++) {
                            if (postAggregateAll[j][i] !== undefined && postAggregateAll[j][i] !== null) {
                                stackPage.push(postAggregateAll[j][i]);
                            } else {
                                continue;
                            }
                        }
                    }

                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? ContentProcessor.title : 'ก้าวไกลรอบด้าน';
                    result.subtitle = '';
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = ContentProcessor.position;
                    for (const row of stackPage) {
                        const user = (row.user !== undefined && row.user.length > 0) ? row.user[0] : undefined;
                        const firstImage = (row.gallery.length > 0) ? row.gallery[0] : undefined;

                        const contents: any = {};
                        contents.coverPageUrl = (row.gallery.length > 0) ? row.gallery[0].imageURL : undefined;
                        if (firstImage !== undefined && firstImage.s3FilePath !== undefined && firstImage.s3FilePath !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3FilePath);
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
                } else if (ContentProcessor.type === 'post' && ContentProcessor.field === 'score') {
                    const postStmt = [
                        { $match: postMatchStmt },
                        { $sort: { summationScore: -1 } },

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
                    result.title = (this.config === undefined || this.config.title === undefined) ? ContentProcessor.title : 'ก้าวไกลรอบด้าน';
                    result.subtitle = '';
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = ContentProcessor.position;
                    for (const row of postAggregate) {
                        const user = (row.user !== undefined && row.user.length > 0) ? row.user[0] : undefined;
                        const firstImage = (row.gallery.length > 0) ? row.gallery[0] : undefined;

                        const contents: any = {};
                        contents.coverPageUrl = (row.gallery.length > 0) ? row.gallery[0].imageURL : undefined;
                        if (firstImage !== undefined && firstImage.s3FilePath !== undefined && firstImage.s3FilePath !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3FilePath);
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
                } else if (ContentProcessor.type === 'post' && ContentProcessor.field === 'objective') {
                    const bucketF = [];
                    const bucketS = [];
                    const bucketT = [];
                    const bucketAll = [];
                    if (ContentProcessor.buckets.length >= 0) {
                        if (ContentProcessor.buckets[0] !== undefined && ContentProcessor.buckets[0] !== null) {
                            for (const provincesF of ContentProcessor.buckets[0].values) {
                                bucketF.push(new ObjectID(provincesF));
                            }
                        }
                        // bucket 2 
                        if (ContentProcessor.buckets[1] !== undefined && ContentProcessor.buckets[1] !== null) {
                            for (const provinceS of ContentProcessor.buckets[1].values) {
                                bucketS.push(new ObjectID(provinceS));
                            }
                        }
                        // bucket 3
                        if (ContentProcessor.buckets[2] !== undefined && ContentProcessor.buckets[2] !== null) {
                            for (const provinceT of ContentProcessor.buckets[2].values) {
                                bucketT.push(new ObjectID(provinceT));
                            }
                        }
                    }

                    const postStmt = [
                        { $match: { isDraft: false, deleted: false, hidden: false, objective: { $ne: null, $in: bucketF } } },
                        { $sort: { summationScore: -1 } },

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
                    if (postAggregate.length > 0) {
                        bucketAll.push(postAggregate);
                    }
                    const postStmt2 = [
                        { $match: { isDraft: false, deleted: false, hidden: false, objective: { $ne: null, $in: bucketS } } },
                        { $sort: { summationScore: -1 } },

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
                    const postAggregate2 = await this.postsService.aggregate(postStmt2);
                    if (postAggregate2.length > 0) {
                        bucketAll.push(postAggregate2);
                    }
                    const postStmt3 = [
                        { $match: { isDraft: false, deleted: false, hidden: false, objective: { $ne: null, $in: bucketS } } },
                        { $sort: { summationScore: -1 } },

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

                    const postAggregate3 = await this.postsService.aggregate(postStmt3);
                    if (postAggregate3.length > 0) {
                        bucketAll.push(postAggregate3);
                    }
                    const stackPage = [];
                    for (let i = 0; i < bucketAll[0].length; i++) {
                        for (let j = 0; j < bucketAll.length; j++) {
                            if (bucketAll[j][i] !== undefined && bucketAll[j][i] !== null) {
                                stackPage.push(bucketAll[j][i]);
                            } else {
                                continue;
                            }
                        }
                    }
                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? ContentProcessor.title : 'ก้าวไกลรอบด้าน';
                    result.subtitle = '';
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = ContentProcessor.position;
                    for (const row of stackPage) {
                        const user = (row.user !== undefined && row.user.length > 0) ? row.user[0] : undefined;
                        const firstImage = (row.gallery.length > 0) ? row.gallery[0] : undefined;

                        const contents: any = {};
                        contents.coverPageUrl = (row.gallery.length > 0) ? row.gallery[0].imageURL : undefined;
                        if (firstImage !== undefined && firstImage.s3FilePath !== undefined && firstImage.s3FilePath !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3FilePath);
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
                } else if (ContentProcessor.type === 'post' && ContentProcessor.field === 'emergencyEvent') {
                    const bucketF = [];
                    const bucketS = [];
                    const bucketT = [];
                    const postObject = [];
                    if (ContentProcessor.buckets.length >= 0) {
                        if (ContentProcessor.buckets[0] !== undefined && ContentProcessor.buckets[0] !== null) {
                            for (const provincesF of ContentProcessor.buckets[0].values) {
                                bucketF.push(new ObjectID(provincesF));
                            }
                        }
                        // bucket 2 
                        if (ContentProcessor.buckets[1] !== undefined && ContentProcessor.buckets[1] !== null) {
                            for (const provinceS of ContentProcessor.buckets[1].values) {
                                bucketS.push(new ObjectID(provinceS));
                            }
                        }
                        // bucket 3
                        if (ContentProcessor.buckets[2] !== undefined && ContentProcessor.buckets[2] !== null) {
                            for (const provinceT of ContentProcessor.buckets[2].values) {
                                bucketT.push(new ObjectID(provinceT));
                            }
                        }
                    }

                    const postStmt1 = [
                        { $match: { isDraft: false, deleted: false, hidden: false, pageId: { $ne: null }, emergencyEvent: { $ne: null, $in: bucketF }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime } } },
                        { $sort: { summationScore: -1 } },

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

                    const postAggregate1 = await this.postsService.aggregate(postStmt1);
                    if (postAggregate1.length > 0) {
                        postObject.push(postAggregate1);
                    }

                    const postStmt2 = [
                        { $match: { isDraft: false, deleted: false, hidden: false, pageId: { $ne: null }, emergencyEvent: { $ne: null, $in: bucketS } } },
                        { $sort: { summationScore: -1 } },

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

                    const postAggregate2 = await this.postsService.aggregate(postStmt2);
                    if (postAggregate2.length > 0) {
                        postObject.push(postAggregate2);
                    }
                    const postStmt3 = [
                        { $match: { isDraft: false, deleted: false, hidden: false, pageId: { $ne: null }, emergencyEvent: { $ne: null, $in: bucketT } } },
                        { $sort: { summationScore: -1 } },

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
                    const postAggregate3 = await this.postsService.aggregate(postStmt3);
                    if (postAggregate3.length > 0) {
                        postObject.push(postAggregate3);
                    }
                    const stackPage = [];
                    for (let i = 0; i < postObject[0].length; i++) {
                        for (let j = 0; j < postObject.length; j++) {
                            if (postObject[j][i] !== undefined && postObject[j][i] !== null) {
                                stackPage.push(postObject[j][i]);
                            } else {
                                continue;
                            }
                        }
                    }

                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? ContentProcessor.title : 'ก้าวไกลรอบด้าน';
                    result.subtitle = (this.config === undefined || this.config.subtitle === undefined) ? 'โพสต์ที่เกิดขึ้นในเดือนนี้ ภายในแพลตฟอร์ม' : this.config.subtitle;
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = ContentProcessor.position;
                    for (const row of stackPage) {
                        const user = (row.user !== undefined && row.user.length > 0) ? row.user[0] : undefined;
                        const firstImage = (row.gallery.length > 0) ? row.gallery[0] : undefined;

                        const contents: any = {};
                        contents.coverPageUrl = (row.gallery.length > 0) ? row.gallery[0].imageURL : undefined;
                        if (firstImage !== undefined && firstImage.s3FilePath !== undefined && firstImage.s3FilePath !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3FilePath);
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
                } else if (ContentProcessor.type === 'page' && ContentProcessor.field === 'group') {
                    const bucketF = [];
                    const bucketS = [];
                    const bucketT = [];
                    if (ContentProcessor.buckets.length >= 0) {
                        if (ContentProcessor.buckets[0] !== undefined && ContentProcessor.buckets[0] !== null) {
                            for (const provincesF of ContentProcessor.buckets[0].values) {
                                bucketF.push(provincesF);
                            }
                        }
                        // bucket 2 
                        if (ContentProcessor.buckets[1] !== undefined && ContentProcessor.buckets[1] !== null) {
                            for (const provinceS of ContentProcessor.buckets[1].values) {
                                bucketS.push(provinceS);
                            }
                        }
                        // bucket 3
                        if (ContentProcessor.buckets[2] !== undefined && ContentProcessor.buckets[2] !== null) {
                            for (const provinceT of ContentProcessor.buckets[2].values) {
                                bucketT.push(provinceT);
                            }
                        }
                    }

                    const pageStackprovince1 = [];
                    const pageStackprovince2 = [];
                    const pageStackprovince3 = [];

                    const pageStacks = [];

                    /* 
                    const pageProvince = await this.pageService.searchPageProvince(bucketF);
                    console.log('pageProvince',pageProvince);
                    for(const pageStack of pageProvince){
                        if(pageStack !== undefined && pageStack !== null){
                            pageStackId.push(pageStack.id);
                        }
                    } */
                    const pageProvince1 = await this.pageService.aggregateP(
                        [
                            {
                                $match: { isOfficial: true, banned: false, group: { $in: bucketF } }
                            },
                            {
                                $limit: ContentProcessor.limit
                            }
                        ]
                    );
                    for (const provinces1 of pageProvince1) {
                        pageStackprovince1.push(new ObjectID(provinces1._id));
                    }
                    const pageProvince2 = await this.pageService.aggregateP(
                        [
                            {
                                $match: { isOfficial: true, banned: false, group: { $in: bucketS } }
                            },
                            {
                                $limit: ContentProcessor.limit
                            }
                        ]
                    );
                    for (const provinces2 of pageProvince2) {
                        pageStackprovince2.push(new ObjectID(provinces2._id));
                    }

                    const pageProvince3 = await this.pageService.aggregateP(
                        [
                            {
                                $match: { isOfficial: true, banned: false, group: { $in: bucketT } }
                            },
                            {
                                $limit: ContentProcessor.limit
                            }
                        ]
                    );
                    for (const provinces3 of pageProvince3) {
                        pageStackprovince3.push(new ObjectID(provinces3._id));
                    }

                    const postAggregateSet1 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false, pageId: { $in: pageStackprovince1 }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime }  } },
                            { $sort: { createdDate: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$_id', '$$pageId'] } } },
                                    ],
                                    as: 'page'
                                }
                            },
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
                    const postAggregateSet2 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false, pageId: { $in: pageStackprovince2 }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime }  } },
                            { $sort: { createdDate: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$_id', '$$pageId'] } } },
                                    ],
                                    as: 'page'
                                }
                            },
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
                    if (postAggregateSet2.length > 0) {
                        pageStacks.push(postAggregateSet2);
                    }
                    const postAggregateSet3 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false, pageId: { $in: pageStackprovince3 }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime }  } },
                            { $sort: { createdDate: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$_id', '$$pageId'] } } },
                                    ],
                                    as: 'page'
                                }
                            },
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
                    if (postAggregateSet3.length > 0) {
                        pageStacks.push(postAggregateSet3);
                    }
                    // set 1
                    const stackPage = [];
                    for (let i = 0; i < pageStacks[0].length; i++) {
                        for (let j = 0; j < pageStacks.length; j++) {
                            if (pageStacks[j][i] !== undefined && pageStacks[j][i] !== null) {
                                stackPage.push(pageStacks[j][i]);
                            } else {
                                continue;
                            }
                        }
                    }
                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? ContentProcessor.title : 'ก้าวไกลรอบด้าน';
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = ContentProcessor.position;
                    for (const row of stackPage) {
                        const user = (row.user !== undefined && row.user.length > 0) ? row.user[0] : undefined;
                        const firstImage = (row.gallery.length > 0) ? row.gallery[0] : undefined;

                        const contents: any = {};
                        contents.coverPageUrl = (row.gallery.length > 0) ? row.gallery[0].imageURL : undefined;
                        if (firstImage !== undefined && firstImage.s3FilePath !== undefined && firstImage.s3FilePath !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3FilePath);
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
                } else if (ContentProcessor.type === 'page' && ContentProcessor.field === 'province') {
                    const bucketF = [];
                    const bucketS = [];
                    const bucketT = [];
                    if (ContentProcessor.buckets.length >= 0) {
                        if (ContentProcessor.buckets[0] !== undefined && ContentProcessor.buckets[0] !== null) {
                            for (const provincesF of ContentProcessor.buckets[0].values) {
                                bucketF.push(provincesF);
                            }
                        }
                        // bucket 2 
                        if (ContentProcessor.buckets[1] !== undefined && ContentProcessor.buckets[1] !== null) {
                            for (const provinceS of ContentProcessor.buckets[1].values) {
                                bucketS.push(provinceS);
                            }
                        }
                        // bucket 3
                        if (ContentProcessor.buckets[2] !== undefined && ContentProcessor.buckets[2] !== null) {
                            for (const provinceT of ContentProcessor.buckets[2].values) {
                                bucketT.push(provinceT);
                            }
                        }
                    }
                    const pageStackprovince1 = [];
                    const pageStackprovince2 = [];
                    const pageStackprovince3 = [];

                    const pageStacks = [];

                    /* 
                    const pageProvince = await this.pageService.searchPageProvince(bucketF);
                    console.log('pageProvince',pageProvince);
                    for(const pageStack of pageProvince){
                        if(pageStack !== undefined && pageStack !== null){
                            pageStackId.push(pageStack.id);
                        }
                    } */
                    const pageProvince1 = await this.pageService.aggregateP(
                        [
                            {
                                $match: { isOfficial: true, banned: false, province: { $in: bucketF } }
                            },
                            {
                                $limit: ContentProcessor.limit
                            }
                        ]
                    );
                    for (const provinces1 of pageProvince1) {
                        pageStackprovince1.push(new ObjectID(provinces1._id));
                    }
                    const pageProvince2 = await this.pageService.aggregateP(
                        [
                            {
                                $match: { isOfficial: true, banned: false, province: { $in: bucketS } }
                            },
                            {
                                $limit: ContentProcessor.limit
                            }
                        ]
                    );
                    for (const provinces2 of pageProvince2) {
                        pageStackprovince2.push(new ObjectID(provinces2._id));
                    }

                    const pageProvince3 = await this.pageService.aggregateP(
                        [
                            {
                                $match: { isOfficial: true, banned: false, province: { $in: bucketT } }
                            },
                            {
                                $limit: ContentProcessor.limit
                            }
                        ]
                    );
                    for (const provinces3 of pageProvince3) {
                        pageStackprovince3.push(new ObjectID(provinces3._id));
                    }

                    const postAggregateSet1 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false, pageId: { $in: pageStackprovince1 } } },
                            { $sort: { createdDate: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$_id', '$$pageId'] } } },
                                    ],
                                    as: 'page'
                                }
                            },
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
                    const postAggregateSet2 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false, pageId: { $in: pageStackprovince2 } } },
                            { $sort: { createdDate: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$_id', '$$pageId'] } } },
                                    ],
                                    as: 'page'
                                }
                            },
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
                    if (postAggregateSet2.length > 0) {
                        pageStacks.push(postAggregateSet2);
                    }
                    const postAggregateSet3 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false, pageId: { $in: pageStackprovince3 } } },
                            { $sort: { createdDate: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$_id', '$$pageId'] } } },
                                    ],
                                    as: 'page'
                                }
                            },
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
                    if (postAggregateSet3.length > 0) {
                        pageStacks.push(postAggregateSet3);
                    }
                    // set 1
                    const stackPage = [];
                    for (let i = 0; i < pageStacks[0].length; i++) {
                        for (let j = 0; j < pageStacks.length; j++) {
                            if (pageStacks[j][i] !== undefined && pageStacks[j][i] !== null) {
                                stackPage.push(pageStacks[j][i]);
                            } else {
                                continue;
                            }
                        }
                    }
                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? ContentProcessor.title : 'ก้าวไกลรอบด้าน';
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = ContentProcessor.position;
                    for (const row of stackPage) {
                        const user = (row.user !== undefined && row.user.length > 0) ? row.user[0] : undefined;
                        const firstImage = (row.gallery.length > 0) ? row.gallery[0] : undefined;

                        const contents: any = {};
                        contents.coverPageUrl = (row.gallery.length > 0) ? row.gallery[0].imageURL : undefined;
                        if (firstImage !== undefined && firstImage.s3FilePath !== undefined && firstImage.s3FilePath !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3FilePath);
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
                } else if (ContentProcessor.type === 'page' && ContentProcessor.field === 'id') {
                    const bucketAll = [];
                    const bucketF = [];
                    const bucketS = [];
                    const bucketT = [];

                    if (ContentProcessor.buckets.length >= 0) {
                        if (ContentProcessor.buckets[0] !== undefined && ContentProcessor.buckets[0] !== null) {
                            for (const bucketFs of ContentProcessor.buckets[0].values) {
                                bucketF.push(new ObjectID(bucketFs));
                            }
                        }
                        // bucket 2 
                        if (ContentProcessor.buckets[1] !== undefined && ContentProcessor.buckets[1] !== null) {
                            for (const bucketSs of ContentProcessor.buckets[1].values) {
                                bucketS.push(new ObjectID(bucketSs));

                            }
                        }
                        // bucket 3
                        if (ContentProcessor.buckets[2] !== undefined && ContentProcessor.buckets[2] !== null) {
                            for (const bucketTs of ContentProcessor.buckets[2].values) {
                                bucketT.push(new ObjectID(bucketTs));
                            }
                        }
                    }
                    // set 1
                    const postAggregateSet1 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false, pageId: { $in: bucketF }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime } } },
                            { $sort: { createdDate: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$_id', '$$pageId'] } } }
                                    ],
                                    as: 'page'
                                }
                            },
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
                        bucketAll.push(postAggregateSet1);
                    }
                    const postAggregateSet2 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false, pageId: { $in: bucketS }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime } } },
                            { $sort: { createdDate: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$_id', '$$pageId'] } } }
                                    ],
                                    as: 'page'
                                }
                            },
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
                    if (postAggregateSet2.length) {
                        bucketAll.push(postAggregateSet2);
                    }
                    const postAggregateSet3 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false, pageId: { $in: bucketT }, startDateTime: { $gte: this.data.startDateTime, $lte: this.data.endDateTime } } },
                            { $sort: { createdDate: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$_id', '$$pageId'] } } }
                                    ],
                                    as: 'page'
                                }
                            },
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
                    if (postAggregateSet3.length > 0) {
                        bucketAll.push(postAggregateSet3);
                    }
                    const stackPage = [];
                    for (let i = 0; i < bucketAll[0].length; i++) {
                        for (let j = 0; j < bucketAll.length; j++) {
                            if (bucketAll[j][i] !== undefined && bucketAll[j][i] !== null) {
                                stackPage.push(bucketAll[j][i]);
                            } else {
                                continue;
                            }
                        }
                    }
                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? ContentProcessor.title : 'ก้าวไกลรอบด้าน';
                    result.subtitle = (this.config === undefined || this.config.subtitle === undefined) ? 'โพสต์ที่เกิดขึ้นในเดือนนี้ ภายในแพลตฟอร์ม' : this.config.subtitle;
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = ContentProcessor.position;
                    for (const row of stackPage) {
                        const user = (row.user !== undefined && row.user.length > 0) ? row.user[0] : undefined;
                        const firstImage = (row.gallery.length > 0) ? row.gallery[0] : undefined;

                        const contents: any = {};
                        contents.coverPageUrl = (row.gallery.length > 0) ? row.gallery[0].imageURL : undefined;
                        if (firstImage !== undefined && firstImage.s3FilePath !== undefined && firstImage.s3FilePath !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3FilePath);
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
                } else if (ContentProcessor.type === 'hashtag' && ContentProcessor.field === 'count') {
                    const bucketF = [];
                    const hashTagMost = await this.hashTagService.searchHashSec(limit);
                    if (hashTagMost.length >= 0) {
                        for (const hashTagMostS of hashTagMost) {
                            bucketF.push(new ObjectID(hashTagMostS.id));
                        }
                    }
                    const postStmt = [
                        { $match: { isDraft: false, deleted: false, hidden: false, postsHashTags: { $ne: null, $in: bucketF } } },
                        { $sort: { summationScore: -1 } },

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
                            '$limit': ContentProcessor.limit
                        }

                    ];

                    const postAggregate = await this.postsService.aggregate(postStmt);

                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? ContentProcessor.title : 'ก้าวไกลรอบด้าน';
                    result.subtitle = '';
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    result.position = ContentProcessor.position;
                    for (const row of postAggregate) {
                        const user = (row.user !== undefined && row.user.length > 0) ? row.user[0] : undefined;
                        const firstImage = (row.gallery.length > 0) ? row.gallery[0] : undefined;

                        const contents: any = {};
                        contents.coverPageUrl = (row.gallery.length > 0) ? row.gallery[0].imageURL : undefined;
                        if (firstImage !== undefined && firstImage.s3FilePath !== undefined && firstImage.s3FilePath !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3FilePath);
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
                    result.title = (this.config === undefined || this.config.title === undefined) ? ContentProcessor.title : 'ก้าวไกลรอบด้าน';
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