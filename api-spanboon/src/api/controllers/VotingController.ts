import { JsonController, Res, Post, Body, Req, Authorized, Param, Delete, Put, Get } from 'routing-controllers';
import { VotingEventRequest } from './requests/VotingEventRequest';
import { VoteItemRequest } from './requests/VoteItemRequest';
// import { UserSupportRequest } from './requests/UserSupportRequest';
import { SupportRequest } from './requests/SupportRequest';
import { FindVoteRequest } from './requests/FindVoteRequest';
import { VotedRequest } from './requests/VotedRequest';
import { VotingEventService } from '../services/VotingEventService';
import { VoteItemService } from '../services/VoteItemService';
import { VoteChoiceService } from '../services/VoteChoiceService';
import { AssetService } from '../services/AssetService';
import { UserService } from '../services/UserService';
import { UserSupportService } from '../services/UserSupportService';
import { VotingEventModel } from '../models/VotingEventModel';
// import { RetrieveVotingOptionsModel } from '../models/RetrieveVotingOptionsModel';
import { UserSupport as UserSupportModel } from '../models/UserSupportModel';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { ObjectID } from 'mongodb';
import { PageService } from '../services/PageService';
import moment from 'moment';
// import { RetrieveVoteService } from '../services/RetrieveVotingOptionService';
import { Page } from '../models/Page';
import { ObjectUtil } from '../../utils/ObjectUtil';
import { SearchFilter } from './requests/SearchFilterRequest';
import {
    DEFAULT_MIN_SUPPORT,
    MIN_SUPPORT
} from '../../constants/SystemConfig';
import { ConfigService } from '../services/ConfigService';
import { VoteItem as VoteItemModel } from '../models/VoteItemModel';
import { VoteChoice as VoteChoiceModel } from '../models/VoteChoiceModel';
import { VotedService } from '../services/VotedService';
import { Voted as VotedModel } from '../models/VotedModel';
import { PageAccessLevelService } from '../services/PageAccessLevelService';
import { PAGE_ACCESS_LEVEL } from '../../constants/PageAccessLevel';

@JsonController('/voting')
export class VotingController {
    constructor(
        private votingEventService: VotingEventService,
        private configService: ConfigService,
        private voteItemService: VoteItemService,
        private voteChoiceService: VoteChoiceService,
        private votedService: VotedService,
        private userSupportService: UserSupportService,
        private userService: UserService,
        private pageService: PageService,
        private pageAccessLevelService: PageAccessLevelService,
        private assetService: AssetService,
        // private retrieveVoteService: RetrieveVoteService
    ) { }

    @Post('/vote/search/')
    public async searchVoted(@Body({ validate: true }) search: FindVoteRequest, @Res() res: any, @Req() req: any): Promise<any> {
        if (ObjectUtil.isObjectEmpty(search)) {
            return res.status(200).send([]);
        }
        const whereConditions = search.whereConditions;
        let filter: any = search.filter;
        if (filter === undefined) {
            filter = new SearchFilter();
        }
        const keywords = search.keyword;
        const exp = { $regex: '.*' + keywords + '.*', $options: 'si' };
        const take = filter.limit ? filter.limit : 10;
        const offset = filter.offset ? filter.offset : 0;
        const matchVoteEvent: any = {};

        if (whereConditions.approved !== undefined && whereConditions.approved !== null) {
            matchVoteEvent.approved = whereConditions.approved;
        }

        if (whereConditions.closed !== undefined && whereConditions.closed !== null) {
            matchVoteEvent.closed = whereConditions.closed;
        }

        if (whereConditions.status !== undefined && whereConditions.status !== null) {
            matchVoteEvent.status = whereConditions.status;
        }

        if (whereConditions.type !== undefined && whereConditions.type !== null) {
            matchVoteEvent.type = whereConditions.type;
        }

        if (whereConditions.pin !== undefined && whereConditions.pin !== null) {
            matchVoteEvent.pin = whereConditions.pin;
        }

        if (whereConditions.showed !== undefined && whereConditions.showed !== null) {
            matchVoteEvent.showVoteResult = whereConditions.showVoteResult;
        }

        if (keywords !== undefined && keywords !== null && keywords !== '') {
            matchVoteEvent.title = exp;
        }
        const voteEventAggr: any = await this.votingEventService.aggregate(
            [
                {
                    $project: {
                        _id: 1,
                        createdDate: 1,
                        title: 1,
                        detail: 1,
                        assertId: 1,
                        coverPageURL: 1,
                        s3CoverPageURL: 1,
                        userId: 1,
                        approved: 1,
                        closed: 1,
                        minSupport: 1,
                        countSupport: 1,
                        startVoteDatetime: 1,
                        endVoteDatetime: 1,
                        approveDatetime: 1,
                        approveUsername: 1,
                        updateDatetime: 1,
                        status: 1,
                        createAsPage: 1,
                        type: 1,
                        public: 1,
                        pin: 1,
                        showVoterName: 1,
                        showVoteResult: 1,
                        checkListName: {
                            $cond: [
                                {
                                    $eq: ['$showVoterName', true]  // Check if 'showVoterName' is true
                                },
                                'Yes',
                                'No'
                            ]
                        }
                    }
                },
                {
                    $facet: {
                        showVoterName: [
                            {
                                $match: {
                                    checkListName: 'Yes'
                                }
                            },
                            {
                                $lookup: {
                                    from: 'Voted',
                                    let: { 'id': '$_id' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $eq: ['$$id', '$votingId']
                                                }
                                            },

                                        },
                                        {
                                            $lookup: {
                                                from: 'User',
                                                let: { 'userId': '$userId' },
                                                pipeline: [
                                                    {
                                                        $match: {
                                                            $expr: {
                                                                $eq: ['$$userId', '$_id']
                                                            }
                                                        },
                                                    },
                                                    {
                                                        $project: {
                                                            _id: 1,
                                                            username: 1,
                                                            firstName: 1,
                                                            lastName: 1,
                                                            imageURL: 1,
                                                            s3ImageURL: 1
                                                        }
                                                    }
                                                ],
                                                as: 'user'
                                            }
                                        },
                                        {
                                            $unwind: {
                                                path: '$user'
                                            }
                                        }
                                    ],
                                    as: 'voted'
                                }
                            },
                        ],
                        notShowVoterName: [
                            {
                                $match: {
                                    checkListName: 'No'
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        combinedResults: {
                            $concatArrays: ['$showVoterName', '$notShowVoterName'],
                        }
                    }
                },
                {
                    $unwind: {
                        path: '$combinedResults',
                    },
                },
                {
                    $replaceRoot: {
                        newRoot: '$combinedResults',
                    },
                },
                {
                    $project:{
                        _id: 1,
                        createdDate: 1,
                        title: 1,
                        detail: 1,
                        assertId: 1,
                        coverPageURL: 1,
                        s3CoverPageURL: 1,
                        userId: 1,
                        approved: 1,
                        closed: 1,
                        minSupport: 1,
                        countSupport: 1,
                        startVoteDatetime: 1,
                        endVoteDatetime: 1,
                        approveDatetime: 1,
                        approveUsername: 1,
                        updateDatetime: 1,
                        status: 1,
                        createAsPage: 1,
                        type: 1,
                        public: 1,
                        pin: 1,
                        showVoterName: 1,
                        showVoteResult: 1,
                        voted:1,
                        createPage: {
                            $cond: [
                                {
                                    $ne: ['$createAsPage', null]  // Check if 'showVoterName' is true
                                },
                                'Yes',
                                'No',
                            ]
                        }
                    }
                },
                {
                    $facet: {
                        showVoterName: [
                            {
                                $match: {
                                    createPage: 'Yes'
                                },
                                
                            },
                            {
                                $lookup: {
                                    from: 'Page',
                                    let: { 'createAsPage': '$createAsPage' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $eq: ['$$createAsPage', '$_id']
                                                }
                                            },
                                        },
                                        {
                                            $project: {
                                                _id: 1,
                                                name: 1,
                                                pageUsername: 1,
                                                isOfficial: 1,
                                                imageURL: 1,
                                                s3ImageURL: 1,
                                                banned:1
                                            }
                                        }
                                    ],
                                    as: 'page'
                                }
                            },
                            {
                                $unwind: {
                                    path: '$page'
                                }
                            }
                        ],
                        notShowVoterName: [
                            {
                                $match: {
                                    createPage: 'No'
                                }
                            },
                            {
                                $lookup:{
                                    from:'User',
                                    let:{userId:'$userId'},
                                    pipeline:[
                                        {
                                            $match:{
                                                $expr:
                                                {
                                                    $eq:['$$userId','$_id']
                                                }
                                            }
                                        },
                                        {
                                            $project: {
                                                _id: 1,
                                                username: 1,
                                                firstName: 1,
                                                lastName: 1,
                                                imageURL: 1,
                                                s3ImageURL: 1
                                            }
                                        }
                                    ],
                                    as:'user'
                                }
                            },
                            {
                                $unwind:{
                                    path:'$user'
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        combinedResults: {
                            $concatArrays: ['$showVoterName', '$notShowVoterName'],
                        }
                    }
                },
                {
                    $unwind: {
                        path: '$combinedResults',
                    },
                },
                {
                    $replaceRoot: {
                        newRoot: '$combinedResults',
                    },
                },
                {
                    $project:{
                        _id:1,
                        createdDate:1,
                        title:1,
                        detail:1,
                        coverPageURL:1,
                        s3CoverPageURL:1,
                        userId:1,
                        approved:1,
                        closed:1,
                        minSupport:1,
                        countSupport:1,
                        startVoteDatetime:1,
                        endVoteDatetime:1,
                        status:1,
                        type:1,
                        pin:1,
                        showVoterName:1,
                        showVoteResult:1,
                        voted:1,
                        page:1,
                        user:1
                    }
                },
                {
                    $match: matchVoteEvent
                },
                {
                    $sort: {
                        createdDate: -1
                    }
                },
                {
                    $limit: take
                },
                {
                    $skip: offset
                }
            ]
        );
        if (voteEventAggr.length > 0) {
            const successResponse = ResponseUtil.getSuccessResponse('Search lists any vote is succesful.', voteEventAggr);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find any lists vote.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/own/search/')
    @Authorized('user')
    public async searchVotedOwner(@Body({ validate: true }) search: FindVoteRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        if (ObjectUtil.isObjectEmpty(search)) {
            return res.status(200).send([]);
        }
        const whereConditions = search.whereConditions;
        let filter: any = search.filter;
        if (filter === undefined) {
            filter = new SearchFilter();
        }
        const keywords = search.keyword;
        const exp = { $regex: '.*' + keywords + '.*', $options: 'si' };
        const take = filter.limit ? filter.limit : 10;
        const offset = filter.offset ? filter.offset : 0;
        const matchVoteEvent: any = {};
        if (whereConditions.approved !== undefined && whereConditions.approved !== null) {
            matchVoteEvent.approved = whereConditions.approved;
        }

        if (whereConditions.closed !== undefined && whereConditions.closed !== null) {
            matchVoteEvent.closed = whereConditions.closed;
        }

        if (whereConditions.status !== undefined && whereConditions.status !== null) {
            matchVoteEvent.status = whereConditions.status;
        }

        if (whereConditions.type !== undefined && whereConditions.type !== null) {
            matchVoteEvent.type = whereConditions.type;
        }

        if (whereConditions.pin !== undefined && whereConditions.pin !== null) {
            matchVoteEvent.pin = whereConditions.pin;
        }

        if (whereConditions.showed !== undefined && whereConditions.showed !== null) {
            matchVoteEvent.showVoteResult = whereConditions.showVoteResult;
        }

        if (userObjId !== undefined && userObjId !== null) {
            matchVoteEvent.userId = userObjId;
        }

        if (keywords !== undefined && keywords !== null && keywords !== '') {
            matchVoteEvent.title = exp;
        }

        const voteEventAggr = await this.votingEventService.aggregate(
            [
                {
                    $project: {
                        _id: 1,
                        createdDate: 1,
                        title: 1,
                        detail: 1,
                        assertId: 1,
                        coverPageURL: 1,
                        s3CoverPageURL: 1,
                        userId: 1,
                        approved: 1,
                        closed: 1,
                        minSupport: 1,
                        countSupport: 1,
                        startVoteDatetime: 1,
                        endVoteDatetime: 1,
                        approveDatetime: 1,
                        approveUsername: 1,
                        updateDatetime: 1,
                        status: 1,
                        createAsPage: 1,
                        type: 1,
                        public: 1,
                        pin: 1,
                        showVoterName: 1,
                        showVoteResult: 1,
                        checkListName: {
                            $cond: [
                                {
                                    $eq: ['$showVoterName', true]  // Check if 'showVoterName' is true
                                },
                                'Yes',
                                'No'
                            ]
                        }
                    }
                },
                {
                    $facet: {
                        showVoterName: [
                            {
                                $match: {
                                    checkListName: 'Yes'
                                }
                            },
                            {
                                $lookup: {
                                    from: 'Voted',
                                    let: { 'id': '$_id' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $eq: ['$$id', '$votingId']
                                                }
                                            },

                                        },
                                        {
                                            $lookup: {
                                                from: 'User',
                                                let: { 'userId': '$userId' },
                                                pipeline: [
                                                    {
                                                        $match: {
                                                            $expr: {
                                                                $eq: ['$$userId', '$_id']
                                                            }
                                                        },
                                                    },
                                                    {
                                                        $project: {
                                                            _id: 1,
                                                            username: 1,
                                                            firstName: 1,
                                                            lastName: 1,
                                                            imageURL: 1,
                                                            s3ImageURL: 1
                                                        }
                                                    }
                                                ],
                                                as: 'user'
                                            }
                                        },
                                        {
                                            $unwind: {
                                                path: '$user'
                                            }
                                        }
                                    ],
                                    as: 'voted'
                                }
                            },
                        ],
                        notShowVoterName: [
                            {
                                $match: {
                                    checkListName: 'No'
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        combinedResults: {
                            $concatArrays: ['$showVoterName', '$notShowVoterName'],
                        }
                    }
                },
                {
                    $unwind: {
                        path: '$combinedResults',
                    },
                },
                {
                    $replaceRoot: {
                        newRoot: '$combinedResults',
                    },
                },
                {
                    $project:{
                        _id: 1,
                        createdDate: 1,
                        title: 1,
                        detail: 1,
                        assertId: 1,
                        coverPageURL: 1,
                        s3CoverPageURL: 1,
                        userId: 1,
                        approved: 1,
                        closed: 1,
                        minSupport: 1,
                        countSupport: 1,
                        startVoteDatetime: 1,
                        endVoteDatetime: 1,
                        approveDatetime: 1,
                        approveUsername: 1,
                        updateDatetime: 1,
                        status: 1,
                        createAsPage: 1,
                        type: 1,
                        public: 1,
                        pin: 1,
                        showVoterName: 1,
                        showVoteResult: 1,
                        voted:1,
                        createPage: {
                            $cond: [
                                {
                                    $ne: ['$createAsPage', null]  // Check if 'showVoterName' is true
                                },
                                'Yes',
                                'No',
                            ]
                        }
                    }
                },
                {
                    $facet: {
                        showVoterName: [
                            {
                                $match: {
                                    createPage: 'Yes'
                                },
                                
                            },
                            {
                                $lookup: {
                                    from: 'Page',
                                    let: { 'createAsPage': '$createAsPage' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $eq: ['$$createAsPage', '$_id']
                                                }
                                            },
                                        },
                                        {
                                            $project: {
                                                _id: 1,
                                                name: 1,
                                                pageUsername: 1,
                                                isOfficial: 1,
                                                imageURL: 1,
                                                s3ImageURL: 1,
                                                banned:1
                                            }
                                        }
                                    ],
                                    as: 'page'
                                }
                            },
                            {
                                $unwind: {
                                    path: '$page'
                                }
                            }
                        ],
                        notShowVoterName: [
                            {
                                $match: {
                                    createPage: 'No'
                                }
                            },
                            {
                                $lookup:{
                                    from:'User',
                                    let:{userId:'$userId'},
                                    pipeline:[
                                        {
                                            $match:{
                                                $expr:
                                                {
                                                    $eq:['$$userId','$_id']
                                                }
                                            }
                                        },
                                        {
                                            $project: {
                                                _id: 1,
                                                username: 1,
                                                firstName: 1,
                                                lastName: 1,
                                                imageURL: 1,
                                                s3ImageURL: 1
                                            }
                                        }
                                    ],
                                    as:'user'
                                }
                            },
                            {
                                $unwind:{
                                    path:'$user'
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        combinedResults: {
                            $concatArrays: ['$showVoterName', '$notShowVoterName'],
                        }
                    }
                },
                {
                    $unwind: {
                        path: '$combinedResults',
                    },
                },
                {
                    $replaceRoot: {
                        newRoot: '$combinedResults',
                    },
                },
                {
                    $match: matchVoteEvent
                },
                {
                    $sort: {
                        createdDate: -1
                    }
                },
                {
                    $limit: take
                },
                {
                    $skip: offset
                }
            ]
        );
        if (voteEventAggr.length > 0) {
            const successResponse = ResponseUtil.getSuccessResponse('Search lists any vote is succesful.', voteEventAggr);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find any lists vote.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Voted.
    @Post('/votes/cast/search')
    @Authorized('user')
    public async searchVoteAction(@Body({ validate: true }) search: FindVoteRequest,@Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        if (ObjectUtil.isObjectEmpty(search)) {
            return res.status(200).send([]);
        }
        let filter: any = search.filter;
        if (filter === undefined) {
            filter = new SearchFilter();
        }
        const keywords = search.keyword;
        const exp = { $regex: '.*' + keywords + '.*', $options: 'si' };
        const take = filter.limit ? filter.limit : 10;
        const offset = filter.offset ? filter.offset : 0;
        const matchVoteEvent: any = {};

        if (userObjId !== undefined && userObjId !== null) {
            matchVoteEvent.userId = userObjId;
        }

        const voteAggr = await this.votedService.aggregate(
            [
                {
                    $match: matchVoteEvent
                },
                {
                    $lookup:{
                        from: 'VotingEvent',
                        let: {votingId:'$votingId'},
                        pipeline:[
                            {
                                $match:{
                                    $expr:
                                    {
                                        $eq:['$$votingId','$_id']
                                    }
                                }
                            },
                            {
                                $project:{
                                    _id: 1,
                                    createdDate: 1,
                                    title: 1,
                                    detail: 1,
                                    assertId: 1,
                                    coverPageURL: 1,
                                    s3CoverPageURL: 1,
                                    userId: 1,
                                    approved: 1,
                                    closed: 1,
                                    minSupport: 1,
                                    countSupport: 1,
                                    startVoteDatetime: 1,
                                    endVoteDatetime: 1,
                                    approveDatetime: 1,
                                    approveUsername: 1,
                                    updateDatetime: 1,
                                    status: 1,
                                    createAsPage: 1,
                                    type: 1,
                                    public: 1,
                                    pin: 1,
                                    showVoterName: 1,
                                    showVoteResult: 1,
                                    createPage:{
                                        $cond:[
                                            {
                                                $ne:['$createAsPage', null]
                                            },
                                            'Yes',
                                            'No'
                                        ]
                                    }
                                }
                            },
                            {
                                $facet: {
                                    showVoterName: [
                                        {
                                            $match: {
                                                createPage: 'Yes'
                                            },
                                            
                                        },
                                        {
                                            $lookup: {
                                                from: 'Page',
                                                let: { 'createAsPage': '$createAsPage' },
                                                pipeline: [
                                                    {
                                                        $match: {
                                                            $expr: {
                                                                $eq: ['$$createAsPage', '$_id']
                                                            }
                                                        },
                                                    },
                                                    {
                                                        $project: {
                                                            _id: 1,
                                                            name: 1,
                                                            pageUsername: 1,
                                                            isOfficial: 1,
                                                            imageURL: 1,
                                                            s3ImageURL: 1,
                                                            banned:1
                                                        }
                                                    }
                                                ],
                                                as: 'page'
                                            }
                                        },
                                        {
                                            $unwind: {
                                                path: '$page'
                                            }
                                        }
                                    ],
                                    notShowVoterName: [
                                        {
                                            $match: {
                                                createPage: 'No'
                                            }
                                        },
                                        {
                                            $lookup:{
                                                from:'User',
                                                let:{userId:'$userId'},
                                                pipeline:[
                                                    {
                                                        $match:{
                                                            $expr:
                                                            {
                                                                $eq:['$$userId','$_id']
                                                            }
                                                        }
                                                    },
                                                    {
                                                        $project: {
                                                            _id: 1,
                                                            username: 1,
                                                            firstName: 1,
                                                            lastName: 1,
                                                            imageURL: 1,
                                                            s3ImageURL: 1
                                                        }
                                                    }
                                                ],
                                                as:'user'
                                            }
                                        },
                                        {
                                            $unwind:{
                                                path:'$user'
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $addFields: {
                                    combinedResults: {
                                        $concatArrays: ['$showVoterName', '$notShowVoterName'],
                                    }
                                }
                            },
                            {
                                $unwind: {
                                    path: '$combinedResults',
                                },
                            },
                            {
                                $replaceRoot: {
                                    newRoot: '$combinedResults',
                                },
                            },
                            {
                                $project:{
                                    _id:1,
                                    createdDate:1,
                                    title:1,
                                    detail:1,
                                    coverPageURL:1,
                                    s3CoverPageURL:1,
                                    userId:1,
                                    approved:1,
                                    closed:1,
                                    minSupport:1,
                                    countSupport:1,
                                    startVoteDatetime:1,
                                    endVoteDatetime:1,
                                    status:1,
                                    type:1,
                                    pin:1,
                                    showVoterName:1,
                                    showVoteResult:1,
                                    voted:1,
                                    page:1,
                                    user:1
                                }
                            },
                        ],
                        as:'votingEvent'
                    }
                },
                {
                    $unwind: {
                        path: '$votingEvent',
                    },
                },
                {
                    $match:{
                        'votingEvent.title':exp
                    }
                },
                {
                    $sort: {
                        createdDate: -1
                    }
                },
                {
                    $limit: take
                },
                {
                    $skip: offset
                }

            ]
        );
        if (voteAggr.length > 0) {
            const successResponse = ResponseUtil.getSuccessResponse('Votes cast in the past.', voteAggr);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Not found the votes.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // get Item
    @Get('/item/vote/:votingId')
    public async getItemVote(@Param('votingId') votingId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const voteObjId = new ObjectID(votingId);
        // check exist?
        const user = await this.userService.findOne({ _id: userObjId });
        if (user !== undefined && user !== null && user.banned === true) {
            const errorResponse = ResponseUtil.getErrorResponse('You have been banned.', undefined);
            return res.status(400).send(errorResponse);
        }
        if (user === undefined && user === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Not found the user.', undefined);
            return res.status(400).send(errorResponse);
        }
        const voteObj = await this.votingEventService.findOne({ _id: voteObjId, userId: userObjId });
        if (voteObj === undefined && voteObj === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find a vote.', undefined);
            return res.status(400).send(errorResponse);
        }
        const voteItem = await this.voteItemService.aggregate([
          {
            $match: {
              votingId: voteObjId,
            },
          },
          {
            $lookup: {
              from: 'VoteChoice',
              let: { id: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$$id', '$voteItemId'],
                    },
                  },
                },
              ],
              as: 'voteChoice',
            },
          },
          {
            $sort:{
                ordering:-1
            }
          }
        ]);
        if (voteItem.length>0) {
            const successResponse = ResponseUtil.getSuccessResponse('Get VoteItem is success.', voteItem);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Not found Vote Item.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Put('/own/:votingId')
    @Authorized('user')
    public async updateVoteingEventOwner(@Body({ validate: true }) votingEventRequest: VotingEventRequest, @Param('votingId') votingId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const voteObjId = new ObjectID(votingId);
        const today = moment().toDate();
        // check exist?
        const user = await this.userService.findOne({ _id: userObjId });
        if (user !== undefined && user !== null && user.banned === true) {
            const errorResponse = ResponseUtil.getErrorResponse('You have been banned.', undefined);
            return res.status(400).send(errorResponse);
        }
        if (user === undefined && user === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Not found the user.', undefined);
            return res.status(400).send(errorResponse);
        }
        const voteObj = await this.votingEventService.findOne({ _id: voteObjId, userId: userObjId });
        if (voteObj === undefined && voteObj === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find a vote.', undefined);
            return res.status(400).send(errorResponse);
        }
        
        const query = { _id: voteObjId, userId: userObjId };
        const newValues = {
            $set: {
                title: votingEventRequest.title,
                detail: votingEventRequest.detail,
                coverPageURL: votingEventRequest.coverPageURL,
                s3CoverPageURL: votingEventRequest.s3CoverPageURL,
                updateDatetime: today,
                type: votingEventRequest.type,
                showVoteResult: votingEventRequest.showVoteResult,
                showVoterName: votingEventRequest.showVoterName
            }
        };
        const update = await this.votingEventService.update(query, newValues);
        if (update) {
            const successResponse = ResponseUtil.getSuccessResponse('Update vote event is success.', undefined);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot update a VoteEvent.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Put('/own/item/:votingId/:voteItemId')
    @Authorized('user')
    public async updateVoteItemOwner(@Body({ validate: true }) voteItemRequest: VoteItemRequest, @Param('votingId') votingId: string, @Param('voteItemId') voteItemId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const voteObjId = new ObjectID(votingId);
        const voteItemObjId = new ObjectID(voteItemId);
        const voteItemObj = await this.voteItemService.findOne({_id:voteItemObjId});
        // check exist?
        const user = await this.userService.findOne({ _id: userObjId });
        if (user !== undefined && user !== null && user.banned === true) {
            const errorResponse = ResponseUtil.getErrorResponse('You have been banned.', undefined);
            return res.status(400).send(errorResponse);
        }
        if (user === undefined && user === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Not found the user.', undefined);
            return res.status(400).send(errorResponse);
        }
        const voteObj = await this.votingEventService.findOne({ _id: voteObjId, userId: userObjId });
        if (voteObj === undefined && voteObj === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find a vote.', undefined);
            return res.status(400).send(errorResponse);
        }

        if(voteItemObj.type !== voteItemRequest.type){
            const errorResponse = ResponseUtil.getErrorResponse('Cannot chance the type VoteChoice.', undefined);
            return res.status(400).send(errorResponse);
        }

        const query = { _id: voteItemObjId, votingId: voteObjId };
        const newValues = {
            $set: {
                ordering: voteItemRequest.ordering,
                title: voteItemRequest.title,
                coverPageURL: voteItemRequest.coverPageURL,
                s3CoverPageURL: voteItemRequest.s3CoverPageURL
            }
        };
        const update = await this.voteItemService.update(query, newValues);
        if (update) {
            const successResponse = ResponseUtil.getSuccessResponse('Update vote item is success.', undefined);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot update a Vote item.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Put('/own/choice/:votingId/:voteItemId/:voteChoiceId')
    @Authorized('user')
    public async updateVoteChoiceOwner(@Body({ validate: true }) voteItemRequest: VoteItemRequest, @Param('votingId') votingId: string, @Param('voteItemId') voteItemId: string, @Param('voteChoiceId') voteChoiceId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const voteIngObjId = new ObjectID(votingId);
        const voteItemObjId = new ObjectID(voteItemId);
        const voteChoice = new ObjectID(voteChoiceId);
        // check exist?
        const user = await this.userService.findOne({ _id: userObjId });
        if (user !== undefined && user !== null && user.banned === true) {
            const errorResponse = ResponseUtil.getErrorResponse('You have been banned.', undefined);
            return res.status(400).send(errorResponse);
        }
        if (user === undefined && user === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Not found the user.', undefined);
            return res.status(400).send(errorResponse);
        }
        const voteObj = await this.votingEventService.findOne({ _id: voteIngObjId, userId: userObjId });
        if (voteObj === undefined && voteObj === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find a vote.', undefined);
            return res.status(400).send(errorResponse);
        }

        // check item
        const voteItemObj = await this.voteItemService.findOne({_id:voteItemObjId});
        if(voteItemObj === undefined){
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find a voteItem.', undefined);
            return res.status(400).send(errorResponse);
        }
        // check voteChoice
        const voteChoiceItem = await this.voteChoiceService.findOne({_id:voteChoice});
        if(voteChoiceItem === undefined){
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find a voteItem.', undefined);
            return res.status(400).send(errorResponse);
        }

        const query = { _id: voteChoice, voteItemId: voteItemObjId };
        const newValues = {
            $set: {
                title: voteItemRequest.title,
                coverPageURL: voteItemRequest.coverPageURL,
                s3CoverPageURL: voteItemRequest.s3CoverPageURL
            }
        };
        const update = await this.voteChoiceService.update(query, newValues);
        if (update) {
            const updateVoted = await this.votedService.updateMany(
                {
                    voting: voteIngObjId,
                    voteItemId: voteItemObjId,
                    voteChoiceId: voteChoice
                },
                { $set: { title: voteItemRequest.title } });
            if (updateVoted) {
                const successResponse = ResponseUtil.getSuccessResponse('Update vote choice event is success.', undefined);
                return res.status(200).send(successResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Cannot update a Vote choice.', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot update a Vote choice.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Delete('/own/:votingId')
    @Authorized('user')
    public async deleteVoteingEventOwner(@Param('votingId') votingId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const voteObjId = new ObjectID(votingId);
        // check exist?

        const voteObj = await this.votingEventService.findOne({ _id: voteObjId, userId: userObjId });
        if (voteObj === undefined && voteObj === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find a vote.', undefined);
            return res.status(400).send(errorResponse);
        }
        const voteItemObj = await this.voteItemService.findOne({ votingId: voteObj.id });
        const voteItems = await this.voteItemService.find({ votingId: voteObj.id });
        if (voteItems.length > 0) {
            for (const voteItem of voteItems) {
                await this.assetService.delete({ _id: voteItem.assetId });
                const voteChoiceList = await this.voteChoiceService.findOne({ voteItemId: voteItem.id });
                await this.assetService.delete({ _id: voteChoiceList.assetId });
            }
        }

        const deleteVoteEvent = await this.votingEventService.delete({ _id: voteObjId, userId: userObjId });
        const deleteVoteItem = await this.voteItemService.deleteMany({ votingId: voteObj.id });
        if (voteItemObj !== undefined && voteItemObj !== null) {
            await this.voteChoiceService.deleteMany({ voteItemId: voteItemObj.id });
        }
        const deleteVoted = await this.votedService.deleteMany({ votingId: voteObj.id });
        const deleteUserSupport = await this.userSupportService.deleteMany({ votingId: voteObj.id });
        if (deleteVoteEvent &&
            deleteVoteItem &&
            deleteVoted &&
            deleteUserSupport
        ) {
            const successResponse = ResponseUtil.getSuccessResponse('delete vote event is success.', undefined);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot delete a VoteEvent.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Delete('/own/item/:votingId/:voteItem')
    @Authorized('user')
    public async deleteVoteItemtOwner(@Param('votingId') votingId: string, @Param('voteItem') voteItem: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const voteObjId = new ObjectID(votingId);
        const voteItemObjId = new ObjectID(voteItem);
        // check exist?

        const voteObj = await this.votingEventService.findOne({ _id: voteObjId, userId: userObjId });
        if (voteObj === undefined && voteObj === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find a vote.', undefined);
            return res.status(400).send(errorResponse);
        }
        const voteItemObj = await this.voteItemService.findOne({ _id: voteItemObjId, votingId: voteObj.id });
        const voteChoices = await this.voteChoiceService.find({ voteItemId: voteItemObj.id });
        if (voteChoices.length > 0) {
            for (const voteChoice of voteChoices) {
                await this.assetService.delete({ _id: voteChoice.assetId });
                await this.votedService.delete({ votingId: voteObj.id, voteItemId: voteItemObj.id, voteChoiceId: voteChoice.id });
            }
        }

        const deleteAsset = await this.assetService.delete({ _id: voteItemObj.assetId });
        const deleteVoteItem = await this.voteItemService.delete({ _id: voteItemObjId });
        const deleteVoteChoice = await this.voteChoiceService.deleteMany({ voteItemId: voteItemObjId });
        if (
            deleteVoteItem &&
            deleteAsset &&
            deleteVoteChoice
        ) {
            const successResponse = ResponseUtil.getSuccessResponse('Delete vote item is success.', undefined);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot delete a Vote imte.', undefined);
            return res.status(400).send(errorResponse);
        }
    }
    @Delete('/own/choice/:voteItem/:voteChoice')
    @Authorized('user')
    public async deleteVoteChoiceOwner(@Param('voteItem') voteItem: string, @Param('voteChoice') voteChoice: string, @Res() res: any, @Req() req: any): Promise<any> {
        const voteChoiceObjId = new ObjectID(voteChoice);
        const voteItemObjId = new ObjectID(voteItem);
        // check exist?

        const voteItemObj = await this.voteItemService.findOne({ _id: voteItemObjId });
        if (voteItemObj === undefined && voteItemObj === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find a vote.', undefined);
            return res.status(400).send(errorResponse);
        }
        const voteChoiceObj = await this.voteChoiceService.findOne({ _id: voteChoiceObjId, voteItemId: voteItemObjId });
        await this.assetService.delete({ _id: voteChoiceObj.assetId });
        await this.votedService.delete({ votingId: voteItemObj.votingId, voteItemId: voteItemObj.id, voteChoiceId: voteChoiceObjId });

        const deleteAsset = await this.assetService.delete({ _id: voteItemObj.assetId });
        const deleteVoteChoice = await this.voteChoiceService.delete({ voteItemId: voteItemObj.id });
        if (
            deleteAsset &&
            deleteVoteChoice
        ) {
            const successResponse = ResponseUtil.getSuccessResponse('delete vote choice is success.', undefined);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot delete a Vote choice.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/own')
    @Authorized('user')
    public async CreateVotingEventOwn(@Body({ validate: true }) votingEventRequest: VotingEventRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const today = moment().toDate();
        let minSupportValue = DEFAULT_MIN_SUPPORT;
        const configMinSupport = await this.configService.getConfig(MIN_SUPPORT);
        if (configMinSupport) {
            minSupportValue = parseInt(configMinSupport.value, 10);
        }
        // const adminIn = new ObjectID(votingEventRequest.adminId);
        // const needed = votingEventRequest.needed;
        const pin = votingEventRequest.pin ? votingEventRequest.pin : false;
        const status = votingEventRequest.status;
        const type = votingEventRequest.type;
        const title = votingEventRequest.title;
        const detail = votingEventRequest.detail;
        const coverImage = votingEventRequest.coverPageURL;
        const approve = votingEventRequest.approved ? votingEventRequest.approved : false;
        const close = votingEventRequest.closed ? votingEventRequest.closed : false;
        const minSupport = votingEventRequest.minSupport ? votingEventRequest.minSupport : minSupportValue;
        const startVoteDateTime = moment(votingEventRequest.startVoteDatetime).toDate();
        const endVoteDateTime = moment(votingEventRequest.endVoteDatetime).toDate();
        const showed = votingEventRequest.showVoterName ? votingEventRequest.showVoterName : false;

        if (approve === true) {
            const errorResponse = ResponseUtil.getErrorResponse('You are trying to do something badly cannot manual the API to approve TRUE! By yourself', undefined);
            return res.status(400).send(errorResponse);
        }
        if (close === true) {
            const errorResponse = ResponseUtil.getErrorResponse('The default Close vote should be false!', undefined);
            return res.status(400).send(errorResponse);
        }

        if (votingEventRequest.approveDatetime !== null && votingEventRequest.approveDatetime !== undefined) {
            const errorResponse = ResponseUtil.getErrorResponse('ApproveDatetime should be NULL!', undefined);
            return res.status(400).send(errorResponse);
        }

        if (votingEventRequest.approveUsername !== null && votingEventRequest.approveUsername !== undefined) {
            const errorResponse = ResponseUtil.getErrorResponse('ApproveUsername should be null', undefined);
            return res.status(400).send(errorResponse);
        }
        // check ban 
        const user = await this.userService.findOne({ _id: userObjId });
        if (user !== undefined && user !== null && user.banned === true) {
            const errorResponse = ResponseUtil.getErrorResponse('You have been banned.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (title === undefined && title === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Title is required.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (detail === undefined && detail === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Detail is required.', undefined);
            return res.status(400).send(errorResponse);
        }
        /* 
        if (coverImage === undefined && coverImage === null) {
            const errorResponse = ResponseUtil.getErrorResponse('coverImage is required.', undefined);
            return res.status(400).send(errorResponse);
        }
        */
        if (status === undefined && status === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Status is undefined.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (type === undefined && type === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Type is undefined.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (minSupport === undefined && minSupport === null) {
            const errorResponse = ResponseUtil.getErrorResponse('minSupport is null or undefined.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (startVoteDateTime === undefined && startVoteDateTime === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Start Vote Datetime is null or undefined.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (endVoteDateTime === undefined && endVoteDateTime === null && endVoteDateTime >= today) {
            const errorResponse = ResponseUtil.getErrorResponse('End Vote Datetime is null or undefined.', undefined);
            return res.status(400).send(errorResponse);
        }

        const todayTimeStamp = today.getTime();
        const endVoteTimeStamp = endVoteDateTime.getTime();
        if ( todayTimeStamp > endVoteTimeStamp ){
            const errorResponse = ResponseUtil.getErrorResponse('End vote date is less than today.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (pin === true) {
            const errorResponse = ResponseUtil.getErrorResponse('Pin should be false.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (status !== 'support') {
            const errorResponse = ResponseUtil.getErrorResponse('Status should be support.', undefined);
            return res.status(400).send(errorResponse);
        }

        const votingEvent = new VotingEventModel();
        votingEvent.title = title;
        votingEvent.detail = detail;
        votingEvent.assetId = votingEventRequest.assetId;
        votingEvent.coverPageURL = coverImage;
        votingEvent.s3CoverPageURL = votingEventRequest.s3CoverPageURL;
        // votingEvent.needed = needed;
        votingEvent.userId = userObjId;
        votingEvent.approved = approve;
        votingEvent.closed = close;
        votingEvent.minSupport = minSupport;
        votingEvent.countSupport = 0;
        votingEvent.startVoteDatetime = startVoteDateTime;
        votingEvent.endVoteDatetime = endVoteDateTime;
        votingEvent.approveDatetime = null;
        votingEvent.approveUsername = null;
        votingEvent.updateDatetime = today;
        // votingEvent.create_user = new ObjectID(votingEventRequest.create_user);
        votingEvent.status = status;
        votingEvent.createAsPage = null;
        votingEvent.type = type;
        votingEvent.pin = pin;
        votingEvent.showVoterName = showed;
        votingEvent.showVoteResult = votingEventRequest.showVoteResult;

        const result = await this.votingEventService.create(votingEvent);
        if (result) {
            const voteItem = new VoteItemModel();
            voteItem.votingId = result.id;
            voteItem.ordering = votingEventRequest.ordering;
            voteItem.type = votingEventRequest.typeChoice;
            voteItem.title = votingEventRequest.titleItem;
            voteItem.assetId = votingEventRequest.assetIdItem;
            voteItem.coverPageURL = votingEventRequest.coverPageURLItem;
            voteItem.s3CoverPageURL = votingEventRequest.s3CoverPageURLItem;
            const createItem = await this.voteItemService.create(voteItem);
            if (createItem) {
                const voteChoiceObj = votingEventRequest.voteChoice;
                if (voteChoiceObj.length > 0) {
                    for (const voteChoicePiece of voteChoiceObj) {
                        const voteChoice = new VoteChoiceModel();
                        voteChoice.voteItemId = new ObjectID(createItem.id);
                        voteChoice.coverPageURL = voteChoicePiece.coverPageURL;
                        voteChoice.s3coverPageURL = voteChoicePiece.s3CoverPageURL;
                        voteChoice.title = voteChoicePiece.title;
                        voteChoice.assetId = voteChoicePiece.assetId;
                        await this.voteChoiceService.create(voteChoice);
                    }
                    const response: any = {};
                    response.id = result.id;
                    response.title = result.title;
                    response.detail = result.detail;
                    response.assetId = result.assetId;
                    response.coverPageURL = result.coverPageURL;
                    response.s3CoverPageURL = result.s3CoverPageURL;
                    response.userId = result.userId;
                    response.approved = result.approved;
                    response.closed = result.closed;
                    response.minSupport = result.minSupport;
                    response.countSupport = result.countSupport;
                    response.startVoteDatetime = result.startVoteDatetime;
                    response.endVoteDatetime = result.endVoteDatetime;
                    response.approveDatetime = result.approveDatetime;
                    response.approveUsername = result.approveUsername;
                    response.updateDatetime = result.updateDatetime;
                    response.status = result.status;
                    response.createAsPage = result.createAsPage;
                    response.type = result.type;
                    response.pin = result.pin;
                    response.showVoterName = result.showVoterName;
                    response.showVoteResult = result.showVoteResult;
                    response.ordering = createItem.ordering;
                    response.typeItem = createItem.type;
                    response.titleItem = createItem.title;
                    response.assetIdItem = createItem.assetId;
                    response.coverPageURLItem = createItem.coverPageURL;
                    response.s3CoverPageURLItem = createItem.s3CoverPageURL;
                    response.voteChoice = voteChoiceObj;

                    const successResponse = ResponseUtil.getSuccessResponse('Successfully create Voting Event.', response);
                    return res.status(200).send(successResponse);
                } else {
                    const errorResponse = ResponseUtil.getErrorResponse('Cannot create a voting Item, Vote Choice is empty.', undefined);
                    return res.status(400).send(errorResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Cannot create a voting Item.', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot create a voting event.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/:pageId/page')
    @Authorized('user')
    public async CreateVotingEvent(@Body({ validate: true }) votingEventRequest: VotingEventRequest, @Param('pageId') pageId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        let pageObjId = null;
        let pageData: Page[];
        const today = moment().toDate();
        let minSupportValue = DEFAULT_MIN_SUPPORT;
        const configMinSupport = await this.configService.getConfig(MIN_SUPPORT);
        if (configMinSupport) {
            minSupportValue = parseInt(configMinSupport.value, 10);
        }
        // const adminIn = new ObjectID(votingEventRequest.adminId);
        // const needed = votingEventRequest.needed;
        const pin = votingEventRequest.pin ? votingEventRequest.pin : false;
        const status = votingEventRequest.status;
        const type = votingEventRequest.type;
        const title = votingEventRequest.title;
        const detail = votingEventRequest.detail;
        const coverImage = votingEventRequest.coverPageURL;
        const approve = votingEventRequest.approved ? votingEventRequest.approved : false;
        const close = votingEventRequest.closed ? votingEventRequest.closed : false;
        const minSupport = votingEventRequest.minSupport ? votingEventRequest.minSupport : minSupportValue;
        const startVoteDateTime = moment(votingEventRequest.startVoteDatetime).toDate();
        const endVoteDateTime = moment(votingEventRequest.endVoteDatetime).toDate();
        const showed = votingEventRequest.showVoterName ? votingEventRequest.showVoterName : false;
        if (approve === true) {
            const errorResponse = ResponseUtil.getErrorResponse('You are trying to do something badly cannot manual the API to approve TRUE! By yourself', undefined);
            return res.status(400).send(errorResponse);
        }
        if (close === true) {
            const errorResponse = ResponseUtil.getErrorResponse('The default Close vote should be false!', undefined);
            return res.status(400).send(errorResponse);
        }

        if (votingEventRequest.approveDatetime !== null && votingEventRequest.approveDatetime !== undefined) {
            const errorResponse = ResponseUtil.getErrorResponse('ApproveDatetime should be NULL!', undefined);
            return res.status(400).send(errorResponse);
        }

        if (votingEventRequest.approveUsername !== null && votingEventRequest.approveUsername !== undefined) {
            const errorResponse = ResponseUtil.getErrorResponse('ApproveUsername should be null', undefined);
            return res.status(400).send(errorResponse);
        }
        // check ban 

        if (pageId === 'null' || pageId === null || pageId === 'undefined' || pageId === undefined) {
            pageData = await this.pageService.find({ where: { pageId: null, ownerUser: userObjId } });
        } else {
            pageObjId = new ObjectID(pageId);
            pageData = await this.pageService.find({ where: { _id: pageObjId } });

            if (pageData === undefined) {
                return res.status(400).send(ResponseUtil.getErrorResponse('Page was not found.', undefined));
            }

            // Check PageAccess
            const accessLevels = [PAGE_ACCESS_LEVEL.OWNER, PAGE_ACCESS_LEVEL.ADMIN, PAGE_ACCESS_LEVEL.MODERATOR, PAGE_ACCESS_LEVEL.POST_MODERATOR];
            const canAccess: boolean = await this.pageAccessLevelService.isUserHasAccessPage(req.user.id + '', pageId, accessLevels);
            if (!canAccess) {
                return res.status(401).send(ResponseUtil.getErrorResponse('You cannot edit vote event of this page.', undefined));
            }
        }
        const user = await this.userService.findOne({ _id: userObjId });
        if (user !== undefined && user !== null && user.banned === true) {
            const errorResponse = ResponseUtil.getErrorResponse('You have been banned.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (title === undefined && title === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Title is required.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (detail === undefined && detail === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Detail is required.', undefined);
            return res.status(400).send(errorResponse);
        }
        /*
        if (coverImage === undefined && coverImage === null) {
            const errorResponse = ResponseUtil.getErrorResponse('coverImage is required.', undefined);
            return res.status(400).send(errorResponse);
        } */

        if (status === undefined && status === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Status is undefined.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (type === undefined && type === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Type is undefined.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (minSupport === undefined && minSupport === null) {
            const errorResponse = ResponseUtil.getErrorResponse('minSupport is null or undefined.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (startVoteDateTime === undefined && startVoteDateTime === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Start Vote Datetime is null or undefined.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (endVoteDateTime === undefined && endVoteDateTime === null) {
            const errorResponse = ResponseUtil.getErrorResponse('End Vote Datetime is null or undefined.', undefined);
            return res.status(400).send(errorResponse);
        }

        const todayTimeStamp = today.getTime();
        const endVoteTimeStamp = endVoteDateTime.getTime();
        if ( todayTimeStamp > endVoteTimeStamp ){
            const errorResponse = ResponseUtil.getErrorResponse('End vote date is less than today.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (pin === true) {
            const errorResponse = ResponseUtil.getErrorResponse('Pin should be false.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (status !== 'support') {
            const errorResponse = ResponseUtil.getErrorResponse('Status should be support.', undefined);
            return res.status(400).send(errorResponse);
        }

        const votingEvent = new VotingEventModel();
        votingEvent.title = title;
        votingEvent.detail = detail;
        votingEvent.assetId = votingEventRequest.assetId;
        votingEvent.coverPageURL = coverImage;
        votingEvent.s3CoverPageURL = votingEventRequest.s3CoverPageURL;
        // votingEvent.needed = needed;
        votingEvent.userId = userObjId;
        votingEvent.approved = approve;
        votingEvent.closed = close;
        votingEvent.minSupport = minSupport;
        votingEvent.countSupport = 0;
        votingEvent.startVoteDatetime = startVoteDateTime;
        votingEvent.endVoteDatetime = endVoteDateTime;
        votingEvent.approveDatetime = null;
        votingEvent.approveUsername = null;
        votingEvent.updateDatetime = today;
        // votingEvent.create_user = new ObjectID(votingEventRequest.create_user);
        votingEvent.status = status;
        votingEvent.createAsPage = pageObjId;
        votingEvent.type = type;
        votingEvent.pin = pin;
        votingEvent.showVoterName = showed;
        votingEvent.showVoteResult = votingEventRequest.showVoteResult;

        const result = await this.votingEventService.create(votingEvent);
        if (result) {
            const voteItem = new VoteItemModel();
            voteItem.votingId = result.id;
            voteItem.ordering = votingEventRequest.ordering;
            voteItem.type = votingEventRequest.typeChoice;
            voteItem.title = votingEventRequest.titleItem;
            voteItem.assetId = votingEventRequest.assetIdItem;
            voteItem.coverPageURL = votingEventRequest.coverPageURLItem;
            voteItem.s3CoverPageURL = votingEventRequest.s3CoverPageURLItem;
            const createItem = await this.voteItemService.create(voteItem);
            if (createItem) {
                const voteChoiceObj = votingEventRequest.voteChoice;
                if (voteChoiceObj.length > 0) {
                    for (const voteChoicePiece of voteChoiceObj) {
                        const voteChoice = new VoteChoiceModel();
                        voteChoice.voteItemId = new ObjectID(createItem.id);
                        voteChoice.coverPageURL = voteChoicePiece.coverPageURL;
                        voteChoice.s3coverPageURL = voteChoicePiece.s3CoverPageURL;
                        voteChoice.title = voteChoicePiece.title;
                        voteChoice.assetId = voteChoicePiece.assetId;
                        await this.voteChoiceService.create(voteChoice);
                    }

                    const response: any = {};
                    response.id = result.id;
                    response.title = result.title;
                    response.detail = result.detail;
                    response.assetId = result.assetId;
                    response.coverPageURL = result.coverPageURL;
                    response.s3CoverPageURL = result.s3CoverPageURL;
                    response.userId = result.userId;
                    response.approved = result.approved;
                    response.closed = result.closed;
                    response.minSupport = result.minSupport;
                    response.countSupport = result.countSupport;
                    response.startVoteDatetime = result.startVoteDatetime;
                    response.endVoteDatetime = result.endVoteDatetime;
                    response.approveDatetime = result.approveDatetime;
                    response.approveUsername = result.approveUsername;
                    response.updateDatetime = result.updateDatetime;
                    response.status = result.status;
                    response.createAsPage = result.createAsPage;
                    response.type = result.type;
                    response.pin = result.pin;
                    response.showVoterName = result.showVoterName;
                    response.showVoteResult = result.showVoteResult;
                    response.ordering = createItem.ordering;
                    response.typeItem = createItem.type;
                    response.titleItem = createItem.title;
                    response.assetIdItem = createItem.assetId;
                    response.coverPageURLItem = createItem.coverPageURL;
                    response.s3CoverPageURLItem = createItem.s3CoverPageURL;
                    response.voteChoice = voteChoiceObj;

                    const successResponse = ResponseUtil.getSuccessResponse('Successfully create Voting Event.', response);
                    return res.status(200).send(successResponse);
                } else {
                    const errorResponse = ResponseUtil.getErrorResponse('Cannot create a voting Item, Vote Choice is empty.', undefined);
                    return res.status(400).send(errorResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Cannot create a voting Item.', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot create a voting event.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // VoteEvent
    @Post('/voted/:votingId')
    @Authorized('user')
    public async Voted(@Body({ validate: true }) votedRequest: VotedRequest, @Param('votingId') votingId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const votingObjId = new ObjectID(votingId);
        const userObjId = new ObjectID(req.user.id);
        const voteItemObjId = new ObjectID(votedRequest.voteItemId);
        const voteChoiceObjId = new ObjectID(votedRequest.voteChoiceId);
        const voteEventObj = await this.votingEventService.findOne({ _id: votingObjId });
        const votedObj = await this.votedService.findOne({ votingId: votingObjId, userId: userObjId,voteItemId:voteItemObjId,voteChoiceId:voteChoiceObjId });

        if (votedObj !== undefined && votedObj !== null) {
            const errorResponse = ResponseUtil.getErrorResponse('You have been already voted.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (voteEventObj !== undefined && voteEventObj !== null && voteEventObj.approved === false) {
            const errorResponse = ResponseUtil.getErrorResponse('Status approve is false.', undefined);
            return res.status(400).send(errorResponse);
        }

        const voteItemObj = await this.voteItemService.findOne({ _id: voteItemObjId });
        if (voteItemObj === undefined && voteItemObj === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find the VoteItem.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (voteEventObj.status === 'support') {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot Vote this vote status is support.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (voteEventObj.status === 'close') {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot Vote this vote status is close.', undefined);
            return res.status(400).send(errorResponse);
        }

        // check ban 
        const user = await this.userService.findOne({ _id: userObjId });
        if (user !== undefined && user !== null && user.banned === true) {
            const errorResponse = ResponseUtil.getErrorResponse('You have been banned.', undefined);
            return res.status(400).send(errorResponse);
        }

        const voted = new VotedModel();
        voted.votingId = votingObjId;
        voted.userId = userObjId;
        voted.answer = votedRequest.answer;
        voted.voteItemId = voteItemObjId;
        voted.voteChoiceId = voteChoiceObjId;

        const create = await this.votedService.create(voted);
        if (create) {
            const successResponse = ResponseUtil.getSuccessResponse('Create vote is success.', create);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot create vote.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Unvote
    @Post('/unvoted/:votingId')
    @Authorized('user')
    public async Unvoted(@Body({ validate: true }) votedRequest: VotedRequest, @Param('votingId') votingId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const votingObjId = new ObjectID(votingId);
        const userObjId = new ObjectID(req.user.id);
        const voteItemObjId = new ObjectID(votedRequest.voteItemId);
        const voteEventObj = await this.votingEventService.findOne({ _id: votingObjId });

        if (voteEventObj !== undefined && voteEventObj !== null && voteEventObj.approved === false) {
            const errorResponse = ResponseUtil.getErrorResponse('Status approve is false.', undefined);
            return res.status(400).send(errorResponse);
        }

        const voteItemObj = await this.voteItemService.findOne({ _id: voteItemObjId });
        if (voteItemObj === undefined && voteItemObj === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find the VoteItem.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (voteEventObj.status === 'support') {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot Vote this vote status is support.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (voteEventObj.status === 'close') {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot Vote this vote status is close.', undefined);
            return res.status(400).send(errorResponse);
        }

        // check ban 
        const user = await this.userService.findOne({ _id: userObjId });
        if (user !== undefined && user !== null && user.banned === true) {
            const errorResponse = ResponseUtil.getErrorResponse('You have been banned.', undefined);
            return res.status(400).send(errorResponse);
        }
        const deleteVoted = await this.votedService.delete({ votingId: votingObjId, userId: userObjId });
        if (deleteVoted) {
            const successResponse = ResponseUtil.getSuccessResponse('Update Unvote is successfully.', undefined);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Update Unvote is not success.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/support/:votingId')
    @Authorized('user')
    public async UserSupport(@Param('votingId') votingId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const votingObjId = new ObjectID(votingId);
        const userObjId = new ObjectID(req.user.id);

        const votingObj = await this.votingEventService.findOne({ _id: votingObjId });
        if (votingObj === undefined && votingObj === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Not Found the Voting Object.', undefined);
            return res.status(400).send(errorResponse);
        }

        if(votingObj.status !== 'support') {
            const errorResponse = ResponseUtil.getErrorResponse('You cannot support this vote, The vote status isn`t support anymore.', undefined);
            return res.status(400).send(errorResponse);
        }

        // check ban 
        const user = await this.userService.findOne({ _id: userObjId });
        if (user !== undefined && user !== null && user.banned === true) {
            const errorResponse = ResponseUtil.getErrorResponse('You have been banned.', undefined);
            return res.status(400).send(errorResponse);
        }

        // check spam support
        const checkUserSupport = await this.userSupportService.findOne({ userId: userObjId, votingId: votingObjId });
        if (checkUserSupport !== undefined && checkUserSupport !== null) {
            const errorResponse = ResponseUtil.getErrorResponse('You have been supported.', undefined);
            return res.status(400).send(errorResponse);
        }

        const userSupport = new UserSupportModel();
        userSupport.userId = userObjId;
        userSupport.votingId = votingObjId;

        const create = await this.userSupportService.create(userSupport);
        if (create) {
            const userSupports = await this.userSupportService.find({ votingId: votingObjId });
            const query = { _id: votingObjId };
            const newValue = { $set: { countSupport: userSupports.length + 1 } };
            const update = await this.votingEventService.update(query, newValue);
            if (update) {
                const successResponse = ResponseUtil.getSuccessResponse('Successfully create User Support.', create);
                return res.status(200).send(successResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Cannot create a user support.', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot create a user support.', undefined);
            return res.status(400).send(errorResponse);
        }
    }
    // RetrieveVotingOptions ## Unsupport
    /*
    const query = {_id:votingObjId};
    const newValues = {$set:{countSupport:voteEventObj.countSupport + 1}};
    await this.votingEventService.update(query,newValues);
    */

    @Post('/unsupport/:userSupportId/')
    @Authorized('user')
    public async Unsupport(@Body({ validate: true }) supportRequest: SupportRequest, @Param('userSupportId') userSupportId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userSupportObjId = new ObjectID(userSupportId);
        const votingObjId = new ObjectID(supportRequest.votingId);
        const userObjId = new ObjectID(req.user.id);

        const voteEventObj = await this.votingEventService.findOne({ _id: votingObjId });

        if (votingObjId !== undefined && votingObjId !== null && votingObjId.approved === false) {
            const errorResponse = ResponseUtil.getErrorResponse('VotingEvent Id is undefined.', undefined);
            return res.status(400).send(errorResponse);
        }
        const userSupportObj = await this.userSupportService.findOne({_id:userSupportObjId ,votingId: votingObjId, userId: userObjId });
        if(userSupportObj === undefined) {
            const errorResponse = ResponseUtil.getErrorResponse('Not found user support.', undefined);
            return res.status(400).send(errorResponse);
        }

        if(voteEventObj.status !== 'support') {
            const errorResponse = ResponseUtil.getErrorResponse('You cannot support this vote, The vote status isn`t support anymore.', undefined);
            return res.status(400).send(errorResponse);
        }

        const unsupport = await this.userSupportService.delete({_id:userSupportObjId ,votingId: votingObjId, userId: userObjId });
        if (unsupport) {
            const query = { _id: votingObjId };
            const newValues = { $set: { countSupport: voteEventObj.countSupport - 1 } };
            await this.votingEventService.update(query, newValues);
            const successResponse = ResponseUtil.getSuccessResponse('Unsupport is success.', undefined);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot support vote.', undefined);
            return res.status(400).send(errorResponse);
        }
    }
}