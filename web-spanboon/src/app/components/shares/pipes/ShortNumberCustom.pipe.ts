import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortNumberCustom'
})
export class ShortNumberCustomPipe implements PipeTransform {
  transform(number: any, customThresholds: { key: string, value: number }[] = []): any {
    if (isNaN(number) || number === undefined || number === null || number <= 0) {
      return 0;
    }

    let abs = Math.abs(number);
    const rounder = Math.pow(10, 1);
    const isNegative = number < 0;
    let key = '';

    const powers = [
      { key: 'T', value: Math.pow(10, 12) },
      { key: 'B', value: Math.pow(10, 9) },
      { key: 'M', value: Math.pow(10, 6) },
      { key: 'K', value: Math.pow(10, 3) },
    ];

    const allPowers = [...powers, ...customThresholds];

    for (let i = 0; i < allPowers.length; i++) {
      let reduced = abs / allPowers[i].value;
      reduced = Math.round(reduced * rounder) / rounder;
      if (reduced >= 1) {
        abs = reduced;
        key = allPowers[i].key;
        break;
      }
    }

    return (isNegative ? '-' : '') + abs + key;
  }
}
