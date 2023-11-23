import { JsonController, Res, Param, Post, Body, Req, Authorized, Put, Delete } from 'routing-controllers';
import { VotingEventRequest } from '../requests/VotingEventRequest';
import { VotingEventService } from '../../services/VotingEventService';
import { VoteItemService } from '../../services/VoteItemService';
import { VoteChoiceService } from '../../services/VoteChoiceService';
import { VotedService } from '../../services/VotedService';
import { AssetService } from '../../services/AssetService';
import { UserSupportService } from '../../services/UserSupportService';
import { UserService } from '../../services/UserService';
// import { VotingEventModel } from '../../models/VotingEventModel';
import { ResponseUtil } from '../../../utils/ResponseUtil';
import { ObjectID } from 'mongodb';
// import moment from 'moment';
import { SearchFilter } from '../requests/SearchFilterRequest';
import { FindVoteRequest } from '../requests/FindVoteRequest';
import { ObjectUtil } from '../../../utils/ObjectUtil';
import moment from 'moment';

@JsonController('/admin/voted')
export class AdminVotedController {
    constructor(
        private votingEventService: VotingEventService,
        private voteItemService:VoteItemService,
        private voteChoiceService:VoteChoiceService,
        private votedService:VotedService,
        private userSupportService:UserSupportService,
        private userService:UserService,
        private assetService:AssetService
    ) { }

    @Post('/all/search/')
    @Authorized('')
    public async searchVoteEvents(@Body({ validate: true }) search: FindVoteRequest,@Res() res: any, @Req() req: any): Promise<any> {
        if (ObjectUtil.isObjectEmpty(search)) {
            return res.status(200).send([]);
        }

        let filter: any = search.filter;
        if (filter === undefined) {
            filter = new SearchFilter();
        }
        const take = filter.limit ? filter.limit: 10;
        const offset = filter.offset ? filter.offset: 0;
        const voteEventAggr = await this.votingEventService.aggregate(
            [
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
            const successResponse = ResponseUtil.getSuccessResponse('Search lists vote is succesful.', voteEventAggr);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find any lists vote.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/search')
    @Authorized('')
    public async searchVoteEvent(@Body({ validate: true }) search: FindVoteRequest,@Res() res: any, @Req() req: any): Promise<any> {
        const keywords = search.keyword;
        const exp = { $regex: '.*' + keywords + '.*', $options: 'si' };
        if (ObjectUtil.isObjectEmpty(search)) {
            return res.status(200).send([]);
        }

        let filter: any = search.filter;
        if (filter === undefined) {
            filter = new SearchFilter();
        }
        const take = filter.limit ? filter.limit: 10;
        const offset = filter.offset ? filter.offset: 0;
        const voteEventAggr = await this.votingEventService.aggregate(
            [
                {
                    $match:{
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
            const successResponse = ResponseUtil.getSuccessResponse('Search lists vote is succesful.', voteEventAggr);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find any lists vote.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Put('/:id')
    @Authorized('')
    public async updateVoteEvent(@Body({ validate: true }) votingEventRequest: VotingEventRequest, @Param('id') id: string,@Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const voteObjId = new ObjectID(id);
        const today = moment().toDate();
        // check exist?
        const user = await this.userService.findOne({_id:userObjId});

        const voteObj = await this.votingEventService.findOne({_id:voteObjId});
        if(voteObj === undefined && voteObj === null){
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find a vote.', undefined);
            return res.status(400).send(errorResponse);
        }
        let voteApproved = votingEventRequest.approved;
        let votePin = votingEventRequest.pin;
        let voteShowed = votingEventRequest.showVoteResult;

        if (voteApproved === null || voteApproved === undefined) {
            voteApproved = voteObj.approved;
        }

        if (votePin === null || votePin === undefined) {
            votePin = voteObj.pin;
        }
        if (voteShowed === null || voteShowed === undefined) {
            voteShowed = voteObj.showVoteResult;

        }

        if(votingEventRequest.closed === true){
            const errorResponse = ResponseUtil.getErrorResponse('Close vote should be false.', undefined);
            return res.status(400).send(errorResponse);
        }

        if(voteApproved === false){
            const errorResponse = ResponseUtil.getErrorResponse('Approve vote should be true', undefined);
            return res.status(400).send(errorResponse);
        }
        const query = {_id:voteObjId};
        const newValues = {
            $set:{
                closed:votingEventRequest.closed,
                closeDate: null,
                approved:voteApproved,
                approveUsername:user.displayName,
                approveDatetime:today,
                pin:votePin,
                showVoteResult:votingEventRequest.showVoteResult,
                status: votingEventRequest.status
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
    @Delete('/:id')
    @Authorized('')
    public async deleteVoteEvent(@Param('id') id: string,@Res() res: any, @Req() req: any): Promise<any> {
        const voteObjId = new ObjectID(id);
        // check exist?

        const voteObj = await this.votingEventService.findOne({_id:voteObjId});
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

        const deleteVoteEvent = await this.votingEventService.delete({_id:voteObjId});
        if(voteItemObj !== undefined && voteItemObj !== null){
            await this.assetService.delete({_id:voteItemObj.assetId});
        }
        const deleteVoteItem = await this.voteItemService.deleteMany({votingId:voteObj.id});
        if(voteItemObj !== undefined && voteItemObj !== null){
            await this.voteChoiceService.deleteMany({voteItemId:voteItemObj.id});
        }
        const deleteVoted = await this.votedService.deleteMany({votingId:voteObj.id});
        const deleteUserSupport = await this.userSupportService.deleteMany({votingId:voteObj.id});

        if(
            deleteVoteEvent && 
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

    // reject
    @Post('/reject/:id')
    @Authorized('')
    public async RejectVoted(@Body({ validate: true }) votingEventRequest: VotingEventRequest, @Param('id') id: string,@Res() res: any, @Req() req: any): Promise<any> {
        const voteObjId = new ObjectID(id);
        const today = moment().toDate();
        // check exist?

        const voteObj = await this.votingEventService.findOne({_id:voteObjId});
        if(voteObj === undefined && voteObj === null){
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find a vote.', undefined);
            return res.status(400).send(errorResponse);
        }
        let voteApproved = votingEventRequest.approved;
        let votePin = votingEventRequest.pin;
        let voteShowed = votingEventRequest.showVoteResult;

        if (voteApproved === null || voteApproved === undefined) {
            voteApproved = voteObj.approved;
        }

        if (votePin === null || votePin === undefined) {
            votePin = voteObj.pin;
        }
        if (voteShowed === null || voteShowed === undefined) {
            voteShowed = voteObj.showVoteResult;
        }

        if(votingEventRequest.closed === false){
            const errorResponse = ResponseUtil.getErrorResponse('Close vote should be true.', undefined);
            return res.status(400).send(errorResponse);
        }

        if(votingEventRequest.endVoteDatetime > today){
            const errorResponse = ResponseUtil.getErrorResponse('Close Data should be null or today.', undefined);
            return res.status(400).send(errorResponse);
        }

        if(voteApproved === true){
            const errorResponse = ResponseUtil.getErrorResponse('Approve vote should be false', undefined);
            return res.status(400).send(errorResponse);
        }

        if(votingEventRequest.status !== 'close'){
            const errorResponse = ResponseUtil.getErrorResponse('Reject vote Status should be closed.', undefined);
            return res.status(400).send(errorResponse);
        }

        if(votePin !== false){
            const errorResponse = ResponseUtil.getErrorResponse('Pin should be false.', undefined);
            return res.status(400).send(errorResponse);
        }

        const query = {_id:voteObjId};
        const newValues = {
            $set:{
                closed:votingEventRequest.closed,
                closeDate: today,
                approved:voteApproved,              
                approveUsername:null,
                approveDatetime:null,
                pin:false,
                status:votingEventRequest.status
            }};

        const update = await this.votingEventService.update(query,newValues);
        if(update){
                const successResponse = ResponseUtil.getSuccessResponse('Reject VoteEvent is Successful.', undefined);
                return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Error Cannot Reject a VoteEvent.', undefined);
            return res.status(400).send(errorResponse);
        }
    }
    // unreject
    @Post('/cancel/:id')
    @Authorized('')
    public async CancelVote(@Body({ validate: true }) votingEventRequest: VotingEventRequest, @Param('id') id: string,@Res() res: any, @Req() req: any): Promise<any> {
        const voteObjId = new ObjectID(id);
        const today = moment().toDate();
        // check exist?

        const voteObj = await this.votingEventService.findOne({_id:voteObjId});
        if(voteObj === undefined && voteObj === null){
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find a vote.', undefined);
            return res.status(400).send(errorResponse);
        }
        let voteApproved = votingEventRequest.approved;
        let votePin = votingEventRequest.pin;
        let voteShowed = votingEventRequest.showVoteResult;

        if (voteApproved === null || voteApproved === undefined) {
            voteApproved = voteObj.approved;
        }

        if (votePin === null || votePin === undefined) {
            votePin = voteObj.pin;
        }
        if (voteShowed === null || voteShowed === undefined) {
            voteShowed = voteObj.showVoteResult;
        }

        if(votingEventRequest.closed === true){
            const errorResponse = ResponseUtil.getErrorResponse('Close vote should be false.', undefined);
            return res.status(400).send(errorResponse);
        }

        if(votingEventRequest.endVoteDatetime > today){
            const errorResponse = ResponseUtil.getErrorResponse('Close Data should be null or today.', undefined);
            return res.status(400).send(errorResponse);
        }

        if(voteApproved === true){
            const errorResponse = ResponseUtil.getErrorResponse('Approve vote should be false', undefined);
            return res.status(400).send(errorResponse);
        }

        if(votingEventRequest.status !== 'support'){
            const errorResponse = ResponseUtil.getErrorResponse('Reject vote Status should be closed.', undefined);
            return res.status(400).send(errorResponse);
        }

        if(votePin !== false){
            const errorResponse = ResponseUtil.getErrorResponse('Pin should be false.', undefined);
            return res.status(400).send(errorResponse);
        }
        const query = {_id:voteObjId};
        const newValues = {
            $set:{
                closed:votingEventRequest.closed,
                closeDate: null,
                approved:voteApproved,              
                approveUsername:null,
                approveDatetime:null,
                pin:votePin,
                status:votingEventRequest.status
            }};

        const update = await this.votingEventService.update(query,newValues);
        if(update){
                const successResponse = ResponseUtil.getSuccessResponse('Reject VoteEvent is Successful.', undefined);
                return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Error Cannot Reject a VoteEvent.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // auto approve
    @Post('/auto/approve')
    @Authorized('')
    public async AutoApprove(@Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const user = await this.userService.findOne({_id:userObjId});
        const today = moment().toDate();

        const voteAggs = await this.votingEventService.aggregate(
            [
                {
                    $match:{
                        approved:false,
                        status:'support'
                    }
                }
            ]
        );
        if(voteAggs.length > 0){
            for(const vote of voteAggs){
                if(vote.countSupport >= vote.minSupport){
                    // auto approve
                    const query = {_id: new ObjectID(vote._id)};
                    const newValues = {
                        $set:{
                            closed:false,
                            closeDate: null,
                            approved:true,
                            approveUsername:user.displayName,
                            approveDatetime:today,
                            pin:true,
                            showVoteResult:true,
                            status: 'vote'
                        }};  
                    await this.votingEventService.update(query,newValues);              
                } else {
                    continue;
                }
            }
        }
        const successResponse = ResponseUtil.getSuccessResponse('Auto approve.', undefined);
        return res.status(200).send(successResponse);
    }

    // auto close
    @Post('/auto/close')
    @Authorized('')
    public async AutoClose(@Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const user = await this.userService.findOne({_id:userObjId});
        const today = moment().toDate();

        const voteAggs = await this.votingEventService.aggregate([]);
        if(voteAggs.length > 0){
            for(const vote of voteAggs){
                if(today.getTime() > vote.endVoteDatetime.getTime()) {
                    const query = {_id: new ObjectID(vote._id)};
                    const newValues = {
                        $set:{
                            closed:true,
                            closeDate: today,
                            approved:true,
                            approveUsername:user.displayName,
                            approveDatetime:today,
                            pin:false,
                            showVoteResult:true,
                            status: 'close'
                        }};  
                    await this.votingEventService.update(query,newValues);   
                } else {
                    continue;
                }
            }
        }
        const successResponse = ResponseUtil.getSuccessResponse('Auto Closed.', undefined);
        return res.status(200).send(successResponse);
    }

}