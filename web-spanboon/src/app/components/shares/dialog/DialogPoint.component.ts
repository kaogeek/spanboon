import { Component, Inject, EventEmitter, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, ThemePalette } from '@angular/material';
import { AuthenManager, PointEventFacade } from '../../../services/services';
import { AbstractPage } from '../../pages/AbstractPage';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

const PAGE_NAME: string = 'point';

@Component({
  selector: 'dialog-point',
  templateUrl: './DialogPoint.component.html',
})
export class DialogPoint extends AbstractPage {

  public static readonly PAGE_NAME: string = PAGE_NAME;

  private pointFacade: PointEventFacade;
  public dialog: MatDialog;
  public apiBaseURL = environment.apiBaseURL;
  public countTab: number = 0;
  public coupon: any = {};

  constructor(public dialogRef: MatDialogRef<DialogPoint>, @Inject(MAT_DIALOG_DATA) public data: any,
    dialog: MatDialog, authenManager: AuthenManager, router: Router,
    pointFacade: PointEventFacade) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.dialog = dialog;
    this.pointFacade = pointFacade;
    this.authenManager = authenManager;

  }

  public ngOnInit() {
    if (this.data.type !== 'banner') this._getProduct();
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  isPageDirty(): boolean {
    // throw new Error('Method not implemented.');
    return false;
  }
  onDirtyDialogConfirmBtnClick(): EventEmitter<any> {
    // throw new Error('Method not implemented.');
    return;
  }
  onDirtyDialogCancelButtonClick(): EventEmitter<any> {
    // throw new Error('Method not implemented.');
    return;
  }

  public onClose(data?) {
    if (!!data) {
      this.dialogRef.close(data);
    } else {
      this.dialogRef.close(false);
    }
  }

  public calculatePercentage(max: number, value: number): number {
    const remaining = max - value;
    const percentage = (remaining / max) * 100;

    return Math.max(0, Math.min(100, percentage));
  }

  public clickDialog(isBanner?) {
    if (isBanner) {
      window.open(this.data.point.link, '_blank');
    } else {
      this.showAlertDialog('ท่านสามารถแลกคูปองได้บนแอปพลิเคชั่นทูเดย์เท่านั้น');
    }
  }

  private async _getProduct() {
    let data = await this.pointFacade.getProduct(this.data.point._id);
    if (!!data) {
      this.coupon = {
        use: data.productDetail.useCoupon,
        redeem: data.productDetail.redeemCoupon,
        expire: data.productDetail.couponExpire === -1 ? false : true,
      }
    }
  }

  public checkCondition() {
    if (
      (this.coupon.expire && !this.coupon.redeem) ||
      (this.coupon.expire && this.coupon.redeem) ||
      (!this.coupon.expire && this.coupon.redeem)
    ) {
      return true;
    } else if (!this.coupon.expire && !this.coupon.redeem) {
      return false;
    } else {
      return false;
    }
  }
}
