import { CurrentUser } from '@/src/modules/users/application/decorators/current-user.decorator';

describe('CurrentUser Decorator', () => {
  it('should be defined', () => {
    expect(CurrentUser).toBeDefined();
  });

  it('should be a function', () => {
    expect(typeof CurrentUser).toBe('function');
  });

  it('should create a param decorator', () => {
    const decorator = CurrentUser();
    expect(typeof decorator).toBe('function');
  });
});
