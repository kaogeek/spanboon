import { JsonController, Res, Post, Body, Req, Authorized, Param,Delete, Put } from 'routing-controllers';
import { VotingEventRequest } from './requests/VotingEventRequest';
import { VoteItemRequest } from './requests/VoteItemRequest';
import { UserSupportRequest } from './requests/UserSupportRequest';
import { FindVoteRequest } from './requests/FindVoteRequest';
import { VotedRequest } from './requests/VotedRequest';
import { VotingEventService } from '../services/VotingEventService';
import { VoteItemService } from '../services/VoteItemService';
import { VoteChoiceService } from '../services/VoteChoiceService';
import { AssetService } from '../services/AssetService';
import { UserService } from '../services/UserService';
import { UserSupportService } from '../services/UserSupportService';
import { VotingEventModel } from '../models/VotingEventModel';
import { UserSupport as UserSupportModel } from '../models/UserSupportModel';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { ObjectID } from 'mongodb';
import { PageService } from '../services/PageService';
import moment from 'moment';
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
        private votedService:VotedService,
        private userSupportService: UserSupportService,
        private userService:UserService,
        private pageService:PageService,
        private pageAccessLevelService:PageAccessLevelService,
        private assetService:AssetService
    ) { }

    @Post('/search')
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
        const take = filter.limit ? filter.limit: 10;
        const offset = filter.offset ? filter.offset: 0;

        const voteEventAggr = await this.votingEventService.aggregate(
            [
                {
                    $match:{
                        approved:whereConditions.approved,
                        closed:whereConditions.closed,
                        status:whereConditions.status,
                        type:whereConditions.type,
                        pin:whereConditions.pin,
                        showed:whereConditions.showed,
                        title:exp
                    }
                },
                {
                    $sort:{
                        createdDate:-1
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

    @Post('/search/own')
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
        const take = filter.limit ? filter.limit: 10;
        const offset = filter.offset ? filter.offset: 0;

        const voteEventAggr = await this.votingEventService.aggregate(
            [
                {
                    $match:{
                        approved:whereConditions.approved,
                        closed:whereConditions.closed,
                        status:whereConditions.status,
                        type:whereConditions.type,
                        pin:whereConditions.pin,
                        showed:whereConditions.showed,
                        userId:userObjId,
                        title:exp
                    }
                },
                {
                    $sort:{
                        createdDate:-1
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

    @Put('/own/:votingId')
    @Authorized('user')
    public async updateVoteingEventOwner(@Body({ validate: true }) votingEventRequest: VotingEventRequest,@Param('votingId') votingId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const voteObjId = new ObjectID(votingId);
        const today = moment().toDate();
        // check exist?
        const user = await this.userService.findOne({_id:userObjId});
        if(user !== undefined && user !== null && user.banned === true){
            const errorResponse = ResponseUtil.getErrorResponse('You have been banned.', undefined);
            return res.status(400).send(errorResponse);
        }
        if(user === undefined && user === null ){
            const errorResponse = ResponseUtil.getErrorResponse('Not found the user.', undefined);
            return res.status(400).send(errorResponse);
        }
        const voteObj = await this.votingEventService.findOne({_id:voteObjId,userId:userObjId});
        if(voteObj === undefined && voteObj === null){
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find a vote.', undefined);
            return res.status(400).send(errorResponse);
        }

        const query = {_id:voteObjId,userId:userObjId};
        const newValues = {
            $set:{
                title:votingEventRequest.title,
                detail:votingEventRequest.detail,
                coverPageURL:votingEventRequest.coverPageURL,
                s3CoverPageURL:votingEventRequest.s3CoverPageURL,
                min_support:votingEventRequest.min_support,
                update_datetime:today,
                end_vote_datetime:votingEventRequest.end_vote_datetime,
                status:votingEventRequest.status,
                type:votingEventRequest.type,
                closed:votingEventRequest.closed,
                showed:votingEventRequest.showed
            }};
        const update = await this.votingEventService.update(query,newValues);
        if(update){
            const successResponse = ResponseUtil.getSuccessResponse('Update vote event is success.', undefined);
            return res.status(200).send(successResponse);
        }else{
            const errorResponse = ResponseUtil.getErrorResponse('Cannot update a VoteEvent.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Put('/own/item/:votingId/:voteItemId')
    @Authorized('user')
    public async updateVoteItemOwner(@Body({ validate: true }) voteItemRequest: VoteItemRequest,@Param('votingId') votingId: string, @Param('voteItemId') voteItemId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const voteObjId = new ObjectID(votingId);
        const voteItemObjId = new ObjectID(voteItemId);
        // check exist?
        const user = await this.userService.findOne({_id:userObjId});
        if(user !== undefined && user !== null && user.banned === true){
            const errorResponse = ResponseUtil.getErrorResponse('You have been banned.', undefined);
            return res.status(400).send(errorResponse);
        }
        if(user === undefined && user === null ){
            const errorResponse = ResponseUtil.getErrorResponse('Not found the user.', undefined);
            return res.status(400).send(errorResponse);
        }
        const voteObj = await this.votingEventService.findOne({_id:voteObjId,userId:userObjId});
        if(voteObj === undefined && voteObj === null){
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find a vote.', undefined);
            return res.status(400).send(errorResponse);
        }
        const query = {_id:voteItemObjId,votingId:voteObjId};
        const newValues = {$set:{
            ordering:voteItemRequest.ordering,
            title:voteItemRequest.title,
            coverPageURL:voteItemRequest.coverPageURL,
            s3CoverPageURL:voteItemRequest.s3CoverPageURL
        }};
        const update = await this.voteItemService.update(query,newValues);
        if(update){
            const successResponse = ResponseUtil.getSuccessResponse('Update vote item is success.', undefined);
            return res.status(200).send(successResponse);
        }else{
            const errorResponse = ResponseUtil.getErrorResponse('Cannot update a Vote item.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Put('/own/choice/:votingId/:voteItemId/:voteChoiceId')
    @Authorized('user')
    public async updateVoteChoiceOwner(@Body({ validate: true }) voteItemRequest: VoteItemRequest,@Param('votingId') votingId: string, @Param('voteItemId') voteItemId: string,@Param('voteChoiceId') voteChoiceId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const voteIngObjId = new ObjectID(votingId);
        const voteItemObjId = new ObjectID(voteItemId);
        const voteChoice = new ObjectID(voteChoiceId);
        // check exist?
        const user = await this.userService.findOne({_id:userObjId});
        if(user !== undefined && user !== null && user.banned === true){
            const errorResponse = ResponseUtil.getErrorResponse('You have been banned.', undefined);
            return res.status(400).send(errorResponse);
        }
        if(user === undefined && user === null ){
            const errorResponse = ResponseUtil.getErrorResponse('Not found the user.', undefined);
            return res.status(400).send(errorResponse);
        }
        const voteObj = await this.votingEventService.findOne({_id:voteIngObjId,userId:userObjId});
        if(voteObj === undefined && voteObj === null){
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find a vote.', undefined);
            return res.status(400).send(errorResponse);
        }
        const query = {_id:voteChoice,voteItemId:voteItemObjId};
        const newValues = {$set:{
            title:voteItemRequest.title,
            coverPageURL:voteItemRequest.coverPageURL,
            s3CoverPageURL:voteItemRequest.s3CoverPageURL
        }};
        const update = await this.voteChoiceService.update(query,newValues);
        if(update){
            const updateVoted = await this.votedService.updateMany(
                {
                 voting:voteIngObjId,
                 voteItemId:voteItemObjId,
                 voteChoiceId:voteChoice
                },
                {$set:{title:voteItemRequest.title}});
            if(updateVoted){
                const successResponse = ResponseUtil.getSuccessResponse('Update vote choice event is success.', undefined);
                return res.status(200).send(successResponse);
            }else{
                const errorResponse = ResponseUtil.getErrorResponse('Cannot update a Vote choice.', undefined);
                return res.status(400).send(errorResponse);
            }
        }else{
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

        const voteObj = await this.votingEventService.findOne({_id:voteObjId,userId:userObjId});
        if(voteObj === undefined && voteObj === null){
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find a vote.', undefined);
            return res.status(400).send(errorResponse);
        }
        const voteItemObj = await this.voteItemService.findOne({votingId:voteObj.id});
        const voteItems = await this.voteItemService.find({votingId:voteObj.id});
        if(voteItems.length>0){
            for(const voteItem of voteItems){
                await this.assetService.delete({_id:voteItem.assetId});
                const voteChoiceList = await this.voteChoiceService.findOne({voteItemId:voteItem.id});
                await this.assetService.delete({_id:voteChoiceList.assetId});
            }
        }

        const deleteVoteEvent = await this.votingEventService.delete({_id:voteObjId,userId:userObjId});
        const deleteVoteItem = await this.voteItemService.deleteMany({votingId:voteObj.id});
        if(voteItemObj !== undefined && voteItemObj !== null){
            await this.voteChoiceService.deleteMany({voteItemId:voteItemObj.id});
        }
        const deleteVoted = await this.votedService.deleteMany({votingId:voteObj.id});
        const deleteUserSupport = await this.userSupportService.deleteMany({votingId:voteObj.id});
        if(deleteVoteEvent &&  
            deleteVoteItem && 
            deleteVoted && 
            deleteUserSupport
            )
        {
            const successResponse = ResponseUtil.getSuccessResponse('delete vote event is success.', undefined);
            return res.status(200).send(successResponse);
        }else{
            const errorResponse = ResponseUtil.getErrorResponse('Cannot delete a VoteEvent.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Delete('/own/item/:votingId/:voteItem')
    @Authorized('user')
    public async deleteVoteItemtOwner(@Param('votingId') votingId: string,@Param('voteItem') voteItem: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const voteObjId = new ObjectID(votingId);
        const voteItemObjId = new ObjectID(voteItem);
        // check exist?

        const voteObj = await this.votingEventService.findOne({_id:voteObjId,userId:userObjId});
        if(voteObj === undefined && voteObj === null){
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find a vote.', undefined);
            return res.status(400).send(errorResponse);
        }
        const voteItemObj = await this.voteItemService.findOne({_id:voteItemObjId,votingId:voteObj.id});
        const voteChoices = await this.voteChoiceService.find({voteItemId:voteItemObj.id});
        if(voteChoices.length>0){
            for(const voteChoice of voteChoices){
                await this.assetService.delete({_id:voteChoice.assetId});
                await this.votedService.delete({votingId:voteObj.id,voteItemId:voteItemObj.id,voteChoiceId:voteChoice.id});
            }
        }

        const deleteAsset = await this.assetService.delete({_id: voteItemObj.assetId});
        const deleteVoteItem = await this.voteItemService.delete({_id: voteItemObjId});
        const deleteVoteChoice = await this.voteChoiceService.deleteMany({voteItemId: voteItemObj.id});
        if(
            deleteVoteItem &&
            deleteAsset && 
            deleteVoteChoice  
            )
        {
            const successResponse = ResponseUtil.getSuccessResponse('Delete vote item is success.', undefined);
            return res.status(200).send(successResponse);
        }else{
            const errorResponse = ResponseUtil.getErrorResponse('Cannot delete a Vote imte.', undefined);
            return res.status(400).send(errorResponse);
        }
    }
    @Delete('/own/choice/:voteItem/:voteChoice')
    @Authorized('user')
    public async deleteVoteChoiceOwner(@Param('voteItem') voteItem: string,@Param('voteChoice') voteChoice: string, @Res() res: any, @Req() req: any): Promise<any> {
        const voteChoiceObjId = new ObjectID(voteChoice);
        const voteItemObjId = new ObjectID(voteItem);
        // check exist?

        const voteItemObj = await this.voteItemService.findOne({_id:voteItemObjId});
        if(voteItemObj === undefined && voteItemObj === null){
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find a vote.', undefined);
            return res.status(400).send(errorResponse);
        }
        const voteChoiceObj = await this.voteChoiceService.findOne({_id:voteChoiceObjId,voteItemId:voteItemObjId});
        await this.assetService.delete({_id:voteChoiceObj.assetId});
        await this.votedService.delete({votingId:voteItemObj.votingId,voteItemId:voteItemObj.id,voteChoiceId:voteChoiceObjId});

        const deleteAsset = await this.assetService.delete({_id:voteItemObj.assetId});
        const deleteVoteChoice = await this.voteChoiceService.delete({voteItemId:voteItemObj.id});
        if(
            deleteAsset && 
            deleteVoteChoice  
            )
        {
            const successResponse = ResponseUtil.getSuccessResponse('delete vote choice is success.', undefined);
            return res.status(200).send(successResponse);
        }else{
            const errorResponse = ResponseUtil.getErrorResponse('Cannot delete a Vote choice.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/:pageId')
    @Authorized('user')
    public async createVotingEvent(@Body({ validate: true }) votingEventRequest: VotingEventRequest, @Param('pageId') pageId: string, @Res() res: any, @Req() req: any): Promise<any> {
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
        const minSupport = votingEventRequest.min_support ? votingEventRequest.min_support : minSupportValue;
        const startVoteDateTime = moment(votingEventRequest.start_vote_datetime).toDate();
        const endVoteDateTime = moment(votingEventRequest.end_vote_datetime).toDate();
        const showed = votingEventRequest.showed ? votingEventRequest.showed : false;

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
        const user = await this.userService.findOne({_id:userObjId});
        if(user !== undefined && user !== null && user.banned === true){
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

        if (coverImage === undefined && coverImage === null) {
            const errorResponse = ResponseUtil.getErrorResponse('coverImage is required.', undefined);
            return res.status(400).send(errorResponse);
        }
        /* 
        if (adminIn === undefined && adminIn === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Provider is undefined.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (needed === undefined && needed === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Maximun support is undefined.', undefined);
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

        if (endVoteDateTime === undefined && endVoteDateTime === null) {
            const errorResponse = ResponseUtil.getErrorResponse('End Vote Datetime is null or undefined.', undefined);
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
        votingEvent.min_support = minSupport;
        votingEvent.count_support = votingEventRequest.count_support;
        votingEvent.start_vote_datetime = startVoteDateTime;
        votingEvent.end_vote_datetime = endVoteDateTime;
        votingEvent.approve_datetime = votingEventRequest.approve_datetime;
        votingEvent.approve_name = votingEventRequest.approve_name;
        votingEvent.update_datetime = today;
        // votingEvent.create_user = new ObjectID(votingEventRequest.create_user);
        votingEvent.status = status;
        votingEvent.create_as_page = pageObjId;
        votingEvent.type = type;
        votingEvent.pin = pin;
        votingEvent.showed = showed;

        const result = await this.votingEventService.create(votingEvent);
        if (result) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully create Voting Event.', result);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot create a voting event.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/item/:votingId')
    @Authorized('user')
    public async voteItem(@Body({ validate: true }) voteItemRequest: VoteItemRequest, @Param('votingId') votingId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const votingObjId = new ObjectID(votingId);
        // check ban 
        const user = await this.userService.findOne({_id:userObjId});
        if(user !== undefined && user !== null && user.banned === true){
            const errorResponse = ResponseUtil.getErrorResponse('You have been banned.', undefined);
            return res.status(400).send(errorResponse);
        }
        // Create vote Item and vote Choice.
        if (votingObjId === undefined && votingObjId === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Voting Id is undefined or null.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (voteItemRequest.ordering === undefined && voteItemRequest.ordering === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Ordering is undefined or null.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (voteItemRequest.type === undefined && voteItemRequest.type === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Type is undefined or null.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (voteItemRequest.title === undefined && voteItemRequest.title === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Title is undefined or null.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (voteItemRequest.coverPageURL === undefined && voteItemRequest.coverPageURL === null) {
            const errorResponse = ResponseUtil.getErrorResponse('CoverPageURL is undefined or null.', undefined);
            return res.status(400).send(errorResponse);
        }

        const votingObj = new ObjectID(votingObjId);

        const voteEventObj = await this.votingEventService.findOne({ _id: votingObj });

        if (voteEventObj === undefined && voteEventObj === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Not Found the Voting Object.', undefined);
            return res.status(400).send(errorResponse);
        }

        const voteItem = new VoteItemModel();
        voteItem.votingId = voteEventObj.id;
        voteItem.ordering = voteItemRequest.ordering;
        voteItem.type = voteItemRequest.type;
        voteItem.title = voteItemRequest.title;
        voteItem.assetId = voteItemRequest.assetId;
        voteItem.coverPageURL = voteItemRequest.coverPageURL;
        voteItem.s3CoverPageURL = voteItemRequest.s3CoverPageURL;

        const result = await this.voteItemService.create(voteItem);
        if (result) {
            const voteChoiceObj = voteItemRequest.voteChoice;
            if (voteChoiceObj.length > 0) {
                for (const voteChoicePiece of voteChoiceObj) {
                    const voteChoice = new VoteChoiceModel();
                    voteChoice.voteItemId = new ObjectID(result.id);
                    voteChoice.coverPageURL = voteChoicePiece.coverPageURL;
                    voteChoice.s3coverPageURL = voteChoicePiece.s3CoverPageURL;
                    voteChoice.title = voteChoicePiece.title;
                    voteChoice.assetId = voteChoicePiece.assetId;
                    await this.voteChoiceService.create(voteChoice);
                }
                const successResponse = ResponseUtil.getSuccessResponse('Successfully create Voting Item.', result);
                return res.status(200).send(successResponse);
            } else {
                const deleteVoteItem = await this.voteItemService.delete({ _id: result.id });
                if (deleteVoteItem) {
                    const errorResponse = ResponseUtil.getErrorResponse('Cannot create a voting Item, Vote Choice is empty.', undefined);
                    return res.status(400).send(errorResponse);
                }
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot create a voting Item.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/support/:votingId')
    @Authorized('user')
    public async userSupport(@Body({ validate: true }) userSupportRequest: UserSupportRequest, @Param('votingId') votingId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const votingObjId = new ObjectID(votingId);
        const userObjId = new ObjectID(req.user.id);

        const votingObj = await this.votingEventService.findOne({ _id: votingObjId });
        if (votingObj === undefined && votingObj === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Not Found the Voting Object.', undefined);
            return res.status(400).send(errorResponse);
        }

        // check ban 
        const user = await this.userService.findOne({_id:userObjId});
        if(user !== undefined && user !== null && user.banned === true){
            const errorResponse = ResponseUtil.getErrorResponse('You have been banned.', undefined);
            return res.status(400).send(errorResponse);
        }

        const userSupport = new UserSupportModel();
        userSupport.userId = userObjId;
        userSupport.votingId = votingObjId;

        const create = await this.userSupportService.create(userSupport);
        if (create) {
            const query = {_id:votingObjId};
            const newValue = {$set:{count_support: votingObj.count_support + 1 }};
            const update = await this.votingEventService.update(query,newValue);
            if(update){
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

    @Post('/voted/:votingId')
    @Authorized('user')
    public async Voted(@Body({ validate: true }) votedRequest: VotedRequest, @Param('votingId') votingId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const votingObjId = new ObjectID(votingId);
        const userObjId = new ObjectID(req.user.id);
        const voteItemObjId = new ObjectID(votedRequest.voteItemId);
        const voteChoiceObjId = new ObjectID(votedRequest.voteChoiceId);
        const voteEventObj = await this.votingEventService.findOne({_id:votingObjId});
        const voteObj = await this.votedService.findOne({_id:votingObjId});
        if(voteObj === undefined && voteObj === null){
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find the VoteEvent.', undefined);
            return res.status(400).send(errorResponse);
        }
        if(voteEventObj !== undefined && voteEventObj !== null && voteEventObj.approved === false){
            const errorResponse = ResponseUtil.getErrorResponse('Status approve is false.', undefined);
            return res.status(400).send(errorResponse);
        }

        const voteItemObj = await this.voteItemService.findOne({_id:voteItemObjId});
        if(voteItemObj === undefined && voteItemObj === null){
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find the VoteItem.', undefined);
            return res.status(400).send(errorResponse);
        }
        // check ban 
        const user = await this.userService.findOne({_id:userObjId});
        if(user !== undefined && user !== null && user.banned === true){
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
        if(create){
            const successResponse = ResponseUtil.getSuccessResponse('Create vote is success.', create);
            return res.status(200).send(successResponse);
        }else{
            const errorResponse = ResponseUtil.getErrorResponse('Cannot create vote.', undefined);
            return res.status(400).send(errorResponse);
        }
    }
}