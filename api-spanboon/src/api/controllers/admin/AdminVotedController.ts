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

    @Post('/search/all')
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

        const query = {_id:voteObjId};
        const newValues = {
            $set:{
                approve_name:user.displayName,
                approve_datetime:today,
                approved:votingEventRequest.approved,
                closed:votingEventRequest.closed,
                pin:votingEventRequest.pin,
                status:votingEventRequest.status,
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
        const deleteAsset = await this.assetService.delete({_id:voteItemObj.assetId});
        const deleteVoteItem = await this.voteItemService.deleteMany({votingId:voteObj.id});
        const deleteVoteChoice = await this.voteChoiceService.deleteMany({voteItemId:voteItemObj.id});
        const deleteVoted = await this.votedService.deleteMany({votingId:voteObj.id});
        const deleteUserSupport = await this.userSupportService.deleteMany({votingId:voteObj.id});

        if(deleteVoteEvent && 
            deleteAsset && 
            deleteVoteItem && 
            deleteVoteChoice && 
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
}