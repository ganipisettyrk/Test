import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customEllipse'
})
export class CustomEllipsePipe implements PipeTransform {

  transform(value: any, type: string, size: number): any {

    let result = null;

    if (null != value) {
      if (type == 'ringback' || type == 'realtone' || type == 'ringback_station') {
        result = value.track_name;
      } else if (type == 'chart') {
        result = value.name;
      } else if (type == 'album') {
        result = value.album_name;
      } else if (type == 'artist') {
        result = value.primary_artist_name;
      }

      if (null != result && result.length > size) {
        result = result.slice(0, size) + "...";
      }
    }
    return result;
  }

}
