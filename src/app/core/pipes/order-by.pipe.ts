import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy',
  standalone: true
})
export class OrderByPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(array: unknown | any, field: string) {
    array.sort((a: string, b: string) => {
      if (
        a[field]?.toString().toLowerCase() < b[field]?.toString().toLowerCase()
      ) {
        return -1;
      } else if (
        a[field]?.toString().toLowerCase() > b[field]?.toString().toLowerCase()
      ) {
        return 1;
      } else {
        return 0;
      }
    });
    return array;
  }
}
