import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'customDateFormat',
    pure: false
})

export class CustomDateFormat implements PipeTransform {
    transform(value: number): string {
        if (value) {
            const months = Math.floor(value / 30);
            const years = Math.floor(value / 365);

            if (years > 0) {
                return `${years} ปี`;
            } else {
                return `${months} เดือน`;
            }
        }
    }
}
