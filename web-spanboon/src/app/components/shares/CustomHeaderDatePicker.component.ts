import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
} from '@angular/core';
import { MatCalendar, MatDatepickerIntl, MatCalendarHeader } from '@angular/material/datepicker';

/** @title Datepicker with custom calendar header */
@Component({
    selector: 'datepicker-custom-header',
    templateUrl: 'CustomHeaderDatePicker.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomHeaderDatePicker {
    headerDate = HeaderDate;
}

/** Custom header component for datepicker. */
@Component({
    selector: 'custom-date-header',
    template: `
  <div class="mat-calendar-header">
    <div class="mat-calendar-controls">
      <button mat-button type="button" class="mat-calendar-period-button"
              (click)="currentPeriodClicked()" [attr.aria-label]="periodButtonLabel"
              cdkAriaLive="polite">
        {{periodButtonText}}
        <div class="mat-calendar-arrow"
             [class.mat-calendar-invert]="calendar.currentView != 'month'"></div>
      </button>
  
      <div class="mat-calendar-spacer"></div>
  
      <ng-content></ng-content>
  
      <button mat-icon-button type="button" class="mat-calendar-previous-button"
              [disabled]="!previousEnabled()" (click)="customPrev()"
              [attr.aria-label]="prevButtonLabel">
      </button>
  
      <button mat-icon-button type="button" class="mat-calendar-next-button"
              [disabled]="!nextEnabled()" (click)="customNext()"
              [attr.aria-label]="nextButtonLabel">
      </button>
    </div>
  </div>  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderDate extends MatCalendarHeader<any> {

    /** Handles user clicks on the period label. */
    currentPeriodClicked(): void {
        this.calendar.currentView = this.calendar.currentView == 'month' ? 'multi-year' : 'month';
    }

    /** Handles user clicks on the previous button. */
    customPrev(): void {
        console.log(this.calendar.activeDate)
        this.previousClicked()
    }

    /** Handles user clicks on the next button. */
    customNext(): void {
        console.log(this.calendar.activeDate)
        this.nextClicked()
    }

}