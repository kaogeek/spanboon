import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'minimizeThDate',
    pure: false
})

export class PipeThDateFormat implements PipeTransform {
    transform(dateString: string): string {
        const date = new Date(dateString);
        const thaiMonthNames = [
            'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
            'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
        ];

        const thaiYear = date.getFullYear() + 543;
        const thaiMonth = thaiMonthNames[date.getMonth()];
        const thaiDay = date.getDate();

        return `${thaiDay} ${thaiMonth} ${thaiYear}`;
    }
}
