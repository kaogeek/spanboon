import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { environment } from '../../../environments/environment';
import { VoteEventFacade } from '../../services/facade/VoteEventFacade.service';
import { SearchFilter } from '../../models/SearchFilter';
import { MatCheckboxChange } from '@angular/material';
import { DialogWarningComponent } from '../shares/DialogWarningComponent.component';

const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
    selector: 'dialog-add-noti',
    templateUrl: './DialogAddNoti.component.html'
})
export class DialogAddNoti {
    public baseURL: string;
    private dialog: MatDialog;
    public voteFacade: VoteEventFacade;
    public listVote: any[] = [];
    public isSeeMore: boolean = false;
    public valueVote: any[] = [];

    constructor(public dialogRef: MatDialogRef<DialogAddNoti>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        voteFacade: VoteEventFacade,
        dialog: MatDialog) {
        this.dialog = dialog;
        this.baseURL = environment.apiBaseURL;
        this.voteFacade = voteFacade;
    }

    public ngOnInit(): void {
        this._getVoteEvent();
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
        }).catch((err: any) => {
        })
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
        if (this.valueVote.length >= 5) {
            return this.dialogWarning('ไม่สามารถเลือกโหวตเกิน 4 ตัวเลือก');
        }
        if (this.valueVote.length < 1) {
            return this.dialogWarning('กรุณาเลือกโหวตมากกว่า 1 ตัวเลือก');
        }
        this.dialogRef.close(this.valueVote);
    }
}