import { CustomTranslatePipe } from './custom-translate.pipe';

describe('CustomTranslatePipe', () => {
  it('create an instance', () => {
    const pipe = new CustomTranslatePipe(null, null, null);
    expect(pipe).toBeTruthy();
  });
});
