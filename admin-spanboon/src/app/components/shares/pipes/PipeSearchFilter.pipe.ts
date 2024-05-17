import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchText'
})

export class PipeSearchFilter implements PipeTransform {
  transform(value: any, args?: any): any {
    if (!args || !value) {
      return value;
    }
    return value.filter((item: any) => {
      return (item.title && item.title.toLocaleLowerCase().includes(args));
    });
  }
}