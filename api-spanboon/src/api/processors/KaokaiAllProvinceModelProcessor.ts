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
export class KaokaiAllProvinceModelProcessor extends AbstractSeparateSectionProcessor {
    private DEFAULT_SEARCH_LIMIT = 4;
    private DEFAULT_SEARCH_OFFSET = 0;

    constructor(
        private postsService: PostsService,
        private s3Service: S3Service,
        private userLikeService: UserLikeService,
        private kaokaiTodayService: KaokaiTodayService,
        private hashTagService: HashTagService,
        private pageService:PageService

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

                let userId = undefined;
                // get startDateTime, endDateTime
                let startDateTime: Date = undefined;
                let endDateTime: Date = undefined;
                if (this.data !== undefined && this.data !== null) {
                    startDateTime = this.data.startDateTime;
                    endDateTime = this.data.endDateTime;
                    userId = this.data.userId;
                }
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
                /* 
                historyQuery = [
                    { $match: { keyword: exp, userId: userObjId } },
                    { $sort: { createdDate: -1 } },
                    { $limit: historyLimit },
                    { $group: { _id: '$keyword', result: { $first: '$$ROOT' } } },
                    { $replaceRoot: { newRoot: '$result' } }
                ];  */

                // overide start datetime
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

                const provincePage = await this.kaokaiTodayService.findOne({ position: 3, flag: true });
                if(provincePage.type === 'page' && provincePage.field === 'province'){
                    const bucketF = [];
                    if (provincePage.buckets.length >= 0) {
                        if (provincePage.buckets[0] !== undefined && provincePage.buckets[0] !== null) {
                            for (const provincesF of provincePage.buckets[0].values) {
                                bucketF.push(String(provincesF));
                            }
                        }
                        // bucket 2 
                        if (provincePage.buckets[1] !== undefined && provincePage.buckets[1] !== null) {
                            for (const provinceS of provincePage.buckets[1].values) {
                                bucketF.push(String(provinceS));
                            }
                        }
                        // bucket 3
                        if (provincePage.buckets[2] !== undefined && provincePage.buckets[2] !== null) {
                            for (const provinceT of provincePage.buckets[2].values) {
                                bucketF.push(String(provinceT));
                            }
                        }
                    }
                    const pageStackId = [];
                    const pageStackprovince = [];
                    /* 
                    const pageProvince = await this.pageService.searchPageProvince(bucketF);
                    console.log('pageProvince',pageProvince);
                    for(const pageStack of pageProvince){
                        if(pageStack !== undefined && pageStack !== null){
                            pageStackId.push(pageStack.id);
                        }
                    } */
                    const pageProvince = await this.pageService.aggregate(
                        [
                            {
                                $match:{isOfficial: true,banned:false,province:{$in:bucketF}}
                            },
                            {
                                $limit:provincePage.limit
                            }
                        ]
                    );
                    for(const pageStack of pageProvince){
                        if(pageStack !== undefined && pageStack !== null){
                            pageStackId.push(pageStack);
                        }
                    }
                    for(const Stackprovince of pageStackId){
                        if(Stackprovince._id !== null && Stackprovince._id !== undefined){
                            pageStackprovince.push(Stackprovince._id);
                        }
                    } 

                    // set 1
                    const postAggregateSet1 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false,pageId:{$in:pageStackprovince}} },
                            { $sort: { createdDate: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$_id', '$$pageId'] }} }
                                    ],
                                    as: 'page'
                                }
                            },
                            {
                                $limit: provincePage.limit
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
                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? provincePage.title : provincePage.title;
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    for (const row of postAggregateSet1) {
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
                }else if(provincePage.type === 'page' && provincePage.field === 'group'){
                    const bucketF = [];
                    if (provincePage.buckets.length >= 0) {
                        if (provincePage.buckets[0] !== undefined && provincePage.buckets[0] !== null) {
                            for (const provincesF of provincePage.buckets[0].values) {
                                bucketF.push(String(provincesF));
                            }
                        }
                        // bucket 2 
                        if (provincePage.buckets[1] !== undefined && provincePage.buckets[1] !== null) {
                            for (const provinceS of provincePage.buckets[1].values) {
                                bucketF.push(String(provinceS));
                            }
                        }
                        // bucket 3
                        if (provincePage.buckets[2] !== undefined && provincePage.buckets[2] !== null) {
                            for (const provinceT of provincePage.buckets[2].values) {
                                bucketF.push(String(provinceT));
                            }
                        }
                    }
                    const pageStackId = [];
                    const pageStackprovince = [];
                    const pageProvince = await this.pageService.aggregate(
                        [
                            {
                                $match:{isOfficial: true,banned:false,group:{$in:bucketF}}
                            },
                            {
                                $limit:provincePage.limit
                            }
                        ]
                    );
                    for(const pageStack of pageProvince){
                        if(pageStack !== undefined && pageStack !== null){
                            pageStackId.push(pageStack);
                        }
                    }
                    for(const Stackprovince of pageStackId){
                        if(Stackprovince._id !== null && Stackprovince._id !== undefined){
                            pageStackprovince.push(Stackprovince._id);
                        }
                    } 
                    const postAggregateSet1 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false,pageId:{$in:pageStackprovince}} },
                            { $sort: { createdDate: -1 } },
                            {
                                $limit: provincePage.limit
                            },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$_id', '$$pageId'] }} },{$limit:1},
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
                                $project: { story: 0 }
                            },
                        ]
                    );
                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? provincePage.title : provincePage.title;
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
                    for (const row of postAggregateSet1) {
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
                }else if(provincePage.type === 'page' && provincePage.field === 'id'){
                    const buckets = [];
                    if (provincePage.buckets.length >= 0) {
                        if (provincePage.buckets[0] !== undefined && provincePage.buckets[0] !== null) {
                            for (const provincesF of provincePage.buckets[0].values) {
                                buckets.push(new ObjectID(provincesF));
                            }
                        }
                        // bucket 2 
                        if (provincePage.buckets[1] !== undefined && provincePage.buckets[1] !== null) {
                            for (const provinceS of provincePage.buckets[1].values) {
                                buckets.push(new ObjectID(provinceS));
                            }
                        }
                        // bucket 3
                        if (provincePage.buckets[2] !== undefined && provincePage.buckets[2] !== null) {
                            for (const provinceT of provincePage.buckets[2].values) {
                                buckets.push(new ObjectID(provinceT));
                            }
                        }
                    }

                    // set 1
                    const postAggregateSet1 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false,pageId:{$in:buckets}} },
                            { $sort: { createdDate: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$_id', '$$pageId'] }} }, { $limit: 4 }
                                    ],
                                    as: 'page'
                                }
                            },
                            {
                                $limit: provincePage.limit
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
                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? provincePage.title : provincePage.title;
                    result.subtitle = '';
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type

                    for (const row of postAggregateSet1) {
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
                }else if(provincePage.type === 'hashtag' && provincePage.field === 'count'){
                    const bucketF = [];
                    const hashTagMost = await this.hashTagService.searchHashSec();
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
                            '$limit': provincePage.limit
                        }

                    ];

                    const postAggregate = await this.postsService.aggregate(postStmt);

                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? provincePage.title :provincePage.title;
                    result.subtitle = '';
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type

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
                }else if(provincePage.type === 'post' && provincePage.field === 'emergencyEvent'){
                    const bucketF = [];
                    const postEmergen = await this.kaokaiTodayService.findOne({ position: 3, flag: true });
                    if (postEmergen.buckets.length >= 0) {
                        if (postEmergen.buckets[0] !== undefined && postEmergen.buckets[0] !== null) {
                            for (const provincesF of postEmergen.buckets[0].values) {
                                bucketF.push(new ObjectID(provincesF));
                            }
                        }
                        // bucket 2 
                        if (postEmergen.buckets[1] !== undefined && postEmergen.buckets[1] !== null) {
                            for (const provinceS of postEmergen.buckets[1].values) {
                                bucketF.push(new ObjectID(provinceS));
                            }
                        }
                        // bucket 3
                        if (postEmergen.buckets[2] !== undefined && postEmergen.buckets[2] !== null) {
                            for (const provinceT of postEmergen.buckets[2].values) {
                                bucketF.push(new ObjectID(provinceT));
                            }
                        }
                    }

                    const postStmt = [
                        { $match: { isDraft: false, deleted: false, hidden: false, emergencyEvent: { $ne: null, $in: bucketF } } },
                        { $sort: { createdDate: -1 } },

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
                            '$limit': provincePage.limit
                        }

                    ];

                    const postAggregate = await this.postsService.aggregate(postStmt);

                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? provincePage.title : provincePage.title;
                    result.subtitle = '';
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type

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
                }else if(provincePage.type === 'post' && provincePage.field === 'objective'){
                    const bucketF = [];
                    const postObjective = await this.kaokaiTodayService.findOne({ position: 3, flag: true });
                    if (postObjective.buckets.length >= 0) {
                        if (postObjective.buckets[0] !== undefined && postObjective.buckets[0] !== null) {
                            for (const provincesF of postObjective.buckets[0].values) {
                                bucketF.push(new ObjectID(provincesF));
                            }
                        }
                        // bucket 2 
                        if (postObjective.buckets[1] !== undefined && postObjective.buckets[1] !== null) {
                            for (const provinceS of postObjective.buckets[1].values) {
                                bucketF.push(new ObjectID(provinceS));
                            }
                        }
                        // bucket 3
                        if (postObjective.buckets[2] !== undefined && postObjective.buckets[2] !== null) {
                            for (const provinceT of postObjective.buckets[2].values) {
                                bucketF.push(new ObjectID(provinceT));
                            }
                        }
                    }

                    const postStmt = [
                        { $match: { isDraft: false, deleted: false, hidden: false, emergencyEvent: { $ne: null, $in: bucketF } } },
                        { $sort: { createdDate: -1 } },

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
                            '$limit': provincePage.limit
                        }

                    ];

                    const postAggregate = await this.postsService.aggregate(postStmt);

                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? provincePage.title : provincePage.title;
                    result.subtitle = '';
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type

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
                }else if(provincePage.type === 'post' && provincePage.field === 'score'){
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
                            '$limit': provincePage.limit
                        }

                    ];

                    if (searchOfficialOnly) {
                        postStmt.splice(3, 0, { $match: { 'page.isOfficial': true, 'page.banned': false } });
                    }

                    const postAggregate = await this.postsService.aggregate(postStmt);

                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? provincePage.title : provincePage.title;
                    result.subtitle = '';
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type

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
                }else if(provincePage.type === 'post' && provincePage.field === 'hashTag'){
                    const bucketF = [];
                    const postsHashTags = await this.kaokaiTodayService.findOne({ position:3, flag: true });
                    if (postsHashTags.buckets.length >= 0) {
                        if (postsHashTags.buckets[0] !== undefined && postsHashTags.buckets[0] !== null) {
                            for (const provincesF of postsHashTags.buckets[0].values) {
                                bucketF.push(provincesF);
                            }
                        }
                        // bucket 2 
                        if (postsHashTags.buckets[1] !== undefined && postsHashTags.buckets[1] !== null) {
                            for (const provinceS of postsHashTags.buckets[1].values) {
                                bucketF.push(provinceS);
                            }
                        }
                        // bucket 3
                        if (postsHashTags.buckets[2] !== undefined && postsHashTags.buckets[2] !== null) {
                            for (const provinceT of postsHashTags.buckets[2].values) {
                                bucketF.push(provinceT);
                            }
                        }
                    }
                    const hashTagStack = [];
                    const hashTagSearch = await this.hashTagService.searchHash(bucketF);
                    if (hashTagSearch.length > 0) {
                        for (const hashTag of hashTagSearch) {
                            hashTagStack.push(new ObjectID(hashTag.id));
                        }
                    }
                    const postAggregateSet1 = await this.postsService.aggregate(
                        [
                            { $match: { isDraft: false, deleted: false, hidden: false, postsHashTags: { $ne: null, $in: hashTagStack } } },
                            { $sort: { summationScore: -1 } },
                            {
                                $lookup:
                                {
                                    from: 'Page',
                                    let: { 'pageId': '$pageId' },
                                    pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$pageId'] }, isOfficial: true } }, { $limit: 1 }],
                                    as: 'page'
                                }
                            },
                            {
                                '$limit': provincePage.limit
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
                    const lastestDate = null;
                    const result: SectionModel = new SectionModel();
                    result.title = (this.config === undefined || this.config.title === undefined) ? provincePage.title : provincePage.title;
                    result.subtitle = '';
                    result.description = '';
                    result.iconUrl = '';
                    result.contents = [];
                    result.type = this.getType(); // set type by processor type
    
                    for (const row of postAggregateSet1) {
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