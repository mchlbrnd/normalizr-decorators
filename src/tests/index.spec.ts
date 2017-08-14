import * as normalizr from 'normalizr';
import { ArrayProperty, denormalize, Entity, EntityProperty, normalize } from '../index';
import { normalize as $normalize, denormalize as $denormalize } from "normalizr";

// Setup normalization through existing normalizr API
const user: normalizr.Schema = new normalizr.schema.Entity('users');
const comment: normalizr.Schema = new normalizr.schema.Entity('comments', {commenter: user});
const article: normalizr.Schema = new normalizr.schema.Entity('articles', {author: user, comments: [ comment ]});
const articles: normalizr.Schema = new normalizr.schema.Array(article);

// Decorated classes and props to normalize
@Entity({key: 'users'})
class User {
  public readonly id: number;
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
}

const originalData: any = {
  id: 123,
  author: {
    id: 1,
    name: 'Paul',
  },
  title: 'My awesome blog post',
  comments: [
    {
      id: 324,
      commenter: {
        id: 2,
        name: 'Nicole',
      },
    },
  ],
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
})


