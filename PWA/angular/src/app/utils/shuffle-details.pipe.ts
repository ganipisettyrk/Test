import { Pipe, PipeTransform } from '@angular/core';
import { CustomTranslateService } from './custom-translate.service';

@Pipe({
  name: 'shuffleDetails'
})
export class ShuffleDetailsPipe implements PipeTransform {

  constructor(private translate: CustomTranslateService) {

  }

  transform(trackName: string, itemCount: string): string {
    let result = null;

    if (null != trackName) {
      let text = this.translate.instant('pwa.shuffle.number.of.song.text',
        { trackName: trackName, noOfSongs: itemCount });
      return text;
    }

    result = null;
  }

}
