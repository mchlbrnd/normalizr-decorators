import * as normalizr from 'normalizr';
import { ArrayProperty, denormalize, Entity, EntityProperty, normalize, UnionProperty } from '../index';
import { denormalize as $denormalize, normalize as $normalize } from 'normalizr';

// Setup normalization through existing normalizr API
const user: normalizr.Schema = new normalizr.schema.Entity('users');
const group: normalizr.Schema = new normalizr.schema.Entity('groups');
const comment: normalizr.Schema = new normalizr.schema.Entity('comments', {commenter: user});
const ownerWithUser: normalizr.Schema = new normalizr.schema.Union({user, group}, 'type');
const ownerWithGroup: normalizr.Schema = new normalizr.schema.Union({user, group}, 'type');
const article: normalizr.Schema = new normalizr.schema.Entity('articles', {author: user, comments: [comment], ownerWithUser, ownerWithGroup});
const articles: normalizr.Schema = new normalizr.schema.Array(article);

// Decorated classes and props to normalize
@Entity({key: 'users'})
class User {
  public readonly id: number;
  public type: string;
}

@Entity({key: 'groups'})
class Group {
  public readonly id: number;
  public type: string;
}

@Entity({key: 'comments'})
class Comment {
  public readonly id: number;

  @EntityProperty()
  public commenter: User;
}

@Entity({key: 'articles'})
class Article {
  public readonly id: number;

  @EntityProperty()
  public author: User;

  @ArrayProperty(Comment)
  public comments: Comment[];

  @UnionProperty({user: User, group: Group, schemaAttribute: 'type'})
  public ownerWithUser: User[] | Group[];

  @UnionProperty({user: User, group: Group, schemaAttribute: 'type'})
  public ownerWithGroup: User[] | Group[];
}

const originalData: any = {
  id: 123,
  title: 'My awesome blog post',
  author: {
    id: 1,
    name: 'Paul',
    type: 'user',
  },
  comments: [
    {
      id: 324,
      commenter: {
        id: 2,
        name: 'Nicole',
      },
    },
  ],
  ownerWithUser: {
    id: 2,
    name: 'John',
    type: 'user',
  },
  ownerWithGroup: {
    id: 42,
    name: 'LIFE',
    type: 'group',
  },
};

let normalizedData: any;
let denormalizedData: any;
let expectedNormalizedData: any;
let expectedDenormalizedData: any;

describe('Entity', () => {
  beforeEach(() => {
    const {result, entities} = normalizedData = normalize(originalData, Article);
    expectedNormalizedData = $normalize(originalData, article);
    denormalizedData = denormalize(result, Article, entities);
    expectedDenormalizedData = $denormalize(result, article, entities);
  });

  describe('normalize with decorated class', () =>
    test('to equal normalized data returned by normalizr.normalize', () =>
      expect(normalizedData).toEqual(expectedNormalizedData)));

  describe('denormalize with decorated class', () =>
    test('to equal denormalized data returned by normalizr.deqnormalize', () =>
      expect(denormalizedData).toEqual(expectedDenormalizedData)));
});

describe('Array', () => {
  beforeEach(() => {
    const {result, entities} = normalizedData = normalize(originalData, [Article]);
    expectedNormalizedData = $normalize(originalData, articles);
    denormalizedData = denormalize(result, [Article], entities);
    expectedDenormalizedData = $denormalize(result, articles, entities);
  });

  describe('normalize with decorated class', () =>
    test('to equal normalized data returned by normalizr.normalize', () =>
      expect(normalizedData).toEqual(expectedNormalizedData)));

  describe('denormalize with decorated class', () =>
    test('to equal denormalized data returned by normalizr.deqnormalize', () =>
      expect(denormalizedData).toEqual(expectedDenormalizedData)));
});

describe('Union', () => {
  beforeEach(() => {
    const {result, entities} = normalizedData = normalize(originalData, Article);
    expectedNormalizedData = $normalize(originalData, article);
    denormalizedData = denormalize(result, Article, entities);
    expectedDenormalizedData = $denormalize(result, article, entities);
  });

  describe('normalize with decorated class', () =>
    test('to equal normalized data returned by normalizr.normalize', () =>
      expect(normalizedData).toEqual(expectedNormalizedData)));

  describe('denormalize with decorated class', () =>
    test('to equal denormalized data returned by normalizr.deqnormalize', () =>
      expect(denormalizedData).toEqual(expectedDenormalizedData)));
});
