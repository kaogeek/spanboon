import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { environment } from '../../../environments/environment';
import { VoteEventFacade } from '../../services/facade/VoteEventFacade.service';
import { SearchFilter } from '../../models/SearchFilter';
import { MatCheckboxChange } from '@angular/material';
import { DialogWarningComponent } from '../shares/DialogWarningComponent.component';
import { LoadingService } from '../../services/loading/loading.service';

const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
    selector: 'dialog-add-noti',
    templateUrl: './DialogAddNoti.component.html'
})
export class DialogAddNoti {
    public baseURL: string;
    private dialog: MatDialog;
    private loadingService: LoadingService;
    public voteFacade: VoteEventFacade;
    public listVote: any[] = [];
    public isSeeMore: boolean = false;
    public valueVote: any[] = [];
    public limit: number = 4;

    constructor(public dialogRef: MatDialogRef<DialogAddNoti>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        voteFacade: VoteEventFacade,
        loadingService: LoadingService,
        dialog: MatDialog) {
        this.dialog = dialog;
        this.baseURL = environment.apiBaseURL;
        this.loadingService = loadingService;
        this.voteFacade = voteFacade;
    }

    public ngOnInit(): void {
        this._getVoteEvent();

        setTimeout(() => {
            this.loadingService.isLoading.next(false);
        }, 2000);
    }

    private _getVoteEvent() {
        let filter = new SearchFilter();
        filter.limit = SEARCH_LIMIT;
        filter.offset = SEARCH_OFFSET;
        filter.relation = [],
            filter.whereConditions = {},
            filter.count = false;
        filter.orderBy = {}
        this.voteFacade.search(filter).then((res: any) => {
            this.listVote = res;
            if (!!this.listVote && !!this.data.value && this.data.value.length > 0) {
                for (let i = 0; i < this.data.value.length; i++) {
                    const matchingIndex = this.findIndexWithMatchingId(this.data.value[i].id, this.listVote);
                    if (matchingIndex !== -1) {
                        this.listVote[matchingIndex].checked = true;
                        this._addValue(this.listVote[matchingIndex]);
                    }
                }
            }
        }).catch((err: any) => {
        })
    }

    public findIndexWithMatchingId(id, array2: any[]) {
        return array2.findIndex(item => item._id === id);
    }

    private _addValue(item: any) {
        let data = {
            id: item._id,
            image: !!item.s3CoverPageURL ? !!item.s3CoverPageURL : item.coverPageURL,
            title: item.title,
            detail: item.detail,
            status: item.status,
            s3: !!item.s3CoverPageURL ? true : false
        }
        this.valueVote.push(data);
    }

    public isWordCountOver(data: string): boolean {
        if (data === undefined || data === null) {
            return false;
        }

        return data.length > 220;
    }

    public onChange(selectedOption: MatCheckboxChange) {
        if (selectedOption.checked) {
            let img = (selectedOption.source.value as unknown as { s3CoverPageURL: string }).s3CoverPageURL
            const item: any = {
                id: (selectedOption.source.value as unknown as { _id: string })._id,
                image: !!img ? img : (selectedOption.source.value as unknown as { coverPageURL: string }).coverPageURL,
                title: (selectedOption.source.value as unknown as { title: string }).title,
                detail: (selectedOption.source.value as unknown as { detail: string }).detail,
                status: (selectedOption.source.value as unknown as { status: string }).status,
                s3: !!img ? true : false
            }
            this.valueVote.push(item);
        } else {
            let id = (selectedOption.source.value as unknown as { _id: string })._id
            const index = this.valueVote.findIndex(
                value => value.id === id
            );
            this.valueVote.splice(index, 1);
        }
    }

    public dialogWarning(message: string): void {
        this.dialog.open(DialogWarningComponent, {
            data: {
                title: message,
                error: true
            }
        });
    }

    public addVoteEvent() {
        if (this.valueVote.length >= (this.limit + 1)) {
            return this.dialogWarning('ไม่สามารถเลือกโหวตเกิน ' + this.limit + ' ตัวเลือก');
        }
        if (this.valueVote.length < 1) {
            return this.dialogWarning('กรุณาเลือกโหวตมากกว่า 1 ตัวเลือก');
        }
        this.dialogRef.close(this.valueVote);
    }
}