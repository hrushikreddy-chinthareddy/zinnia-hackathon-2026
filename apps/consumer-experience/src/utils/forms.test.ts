import { getDirtyValues } from './forms';

describe('getDirtyValues', () => {
  it('should return an empty object if no fields are dirty', () => {
    const dirtyFields = {};
    const values = {
      name: 'John',
      age: 30,
      address: {
        street: '123 Main St',
        city: 'Anytown',
      },
    };

    const result = getDirtyValues(dirtyFields, values);
    expect(result).toEqual({});
  });

  it('should return dirty values for flat structure', () => {
    const dirtyFields = {
      name: true,
      age: false,
    };
    const values = {
      name: 'John',
      age: 30,
    };

    const result = getDirtyValues(dirtyFields, values);
    expect(result).toEqual({ name: 'John' });
  });

  it('should return dirty values for nested structure', () => {
    const dirtyFields = {
      name: true,
      address: {
        street: true,
        city: false,
      },
    };
    const values = {
      name: 'John',
      age: 30,
      address: {
        street: '123 Main St',
        city: 'Anytown',
      },
    };

    const result = getDirtyValues(dirtyFields, values);
    expect(result).toEqual({
      name: 'John',
      address: { street: '123 Main St' },
    });
  });

  it('should return dirty values for array structure', () => {
    const dirtyFields = {
      hobbies: [true, false],
    };
    const values = {
      hobbies: ['reading', 'sports'],
    };

    const result = getDirtyValues(dirtyFields, values);
    expect(result).toEqual({ hobbies: ['reading', 'sports'] });
  });

  it('should return dirty values for mixed structure', () => {
    const dirtyFields = {
      name: true,
      address: {
        street: true,
        city: false,
      },
      hobbies: [true, false, null],
    };
    const values = {
      name: 'John',
      age: 30,
      address: {
        street: '123 Main St',
        city: 'Anytown',
      },
      hobbies: ['reading', 'sports', 'music'],
    };

    const result = getDirtyValues(dirtyFields, values);
    expect(result).toEqual({
      name: 'John',
      address: { street: '123 Main St' },
      hobbies: ['reading', 'sports', 'music'],
    });
  });

  it('should handle null dirtyFields', () => {
    const dirtyFields = {
      name: null,
      address: {
        street: true,
        city: null,
      },
    };
    const values = {
      name: 'John',
      age: 30,
      address: {
        street: '123 Main St',
        city: 'Anytown',
      },
    };

    const result = getDirtyValues(dirtyFields, values);
    expect(result).toEqual({
      address: { street: '123 Main St' },
    });
  });
});
