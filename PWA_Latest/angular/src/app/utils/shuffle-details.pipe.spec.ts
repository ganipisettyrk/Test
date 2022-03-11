import { ShuffleDetailsPipe } from './shuffle-details.pipe';
import { CustomTranslateService } from './custom-translate.service';

describe('Pipe: ShuffleDetailsPipe', () => {
  let pipe: ShuffleDetailsPipe;
  let service: CustomTranslateService;

  beforeEach(() => {
    service = new CustomTranslateService(null);
    pipe = new ShuffleDetailsPipe(service);
  });

  it ('Should return the shuffle name with number of contents', () => {
    expect(pipe.transform('shuffleName', '3')).toBe('shuffleName(3)');
  });
});