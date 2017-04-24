import { ArrayProperty, Entity, EntityProperty, normalize, denormalize } from './index';
import * as normalizr from 'normalizr';
import * as assert from 'assert';

// Decorated classes and props to normalize
@Entity({key: 'users'})
class User {
  readonly id: number;
}

@Entity({key: 'comments'})
class Comment {
  readonly id: number;

  @EntityProperty()
  commenter: User;
}

@Entity({key: 'articles', options: {idAttribute: 'key'}})
class Article {
  readonly id: number;
  readonly key: string;

  @EntityProperty()
  author: User;

  @ArrayProperty(Comment)
  comments: Comment[];
}

const originalData: any = {
  id: 123,
  key: 456,
  author: {
    id: 1,
    name: 'Paul'
  },
  title: 'My awesome blog post',
  comments: [
    {
      id: 324,
      commenter: {
        id: 2,
        name: 'Nicole'
      }
    }
  ]
};


let normalizedDataViaDecoratorApi;
var {entities, result} = normalizedDataViaDecoratorApi = normalize(originalData, Article);
const denormalizedDataViaDecoratorApi = denormalize(result, Article, entities);

// Setup normalization through existing normalizr API
const user = new normalizr.schema.Entity('users');
const comment = new normalizr.schema.Entity('comments', {commenter: user});
const article = new normalizr.schema.Entity('articles', {author: user, comments: [ comment ]}, {idAttribute: 'key'});

let normalizedDataViaExistingApi;
var {entities, result} = normalizedDataViaExistingApi = normalizr.normalize(originalData, article);
const denormalizedDataViaExistingApi = normalizr.denormalize(result, article, entities);

// Test 1: normalized data from decorator API should be deep strict equal to existing API
assert.deepStrictEqual(normalizedDataViaDecoratorApi, normalizedDataViaExistingApi, 'Normalized data via decorator API is not equal to existing API');

// Test 2: denormalized data from decorator API should be deep strict equal to existing API
assert.deepStrictEqual(denormalizedDataViaDecoratorApi, denormalizedDataViaExistingApi, 'Denormalized data via decorator API is not equal to existing API');

// Test 3: denormalized data from decorator API should be deep strict equal to original data
assert.deepStrictEqual(denormalizedDataViaDecoratorApi, originalData, 'Denormalized data via decorator API is not equal to original data');
