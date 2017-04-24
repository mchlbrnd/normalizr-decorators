"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("./index");
const normalizr = require("normalizr");
const assert = require("assert");
let User = class User {
};
User = tslib_1.__decorate([
    index_1.Entity({ key: 'users' })
], User);
let Comment = class Comment {
};
tslib_1.__decorate([
    index_1.EntityProperty(),
    tslib_1.__metadata("design:type", User)
], Comment.prototype, "commenter", void 0);
Comment = tslib_1.__decorate([
    index_1.Entity({ key: 'comments' })
], Comment);
let Article = class Article {
};
tslib_1.__decorate([
    index_1.EntityProperty(),
    tslib_1.__metadata("design:type", User)
], Article.prototype, "author", void 0);
tslib_1.__decorate([
    index_1.ArrayProperty(Comment),
    tslib_1.__metadata("design:type", Array)
], Article.prototype, "comments", void 0);
Article = tslib_1.__decorate([
    index_1.Entity({ key: 'articles', options: { idAttribute: 'key' } })
], Article);
const originalData = {
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
var { entities, result } = normalizedDataViaDecoratorApi = index_1.normalize(originalData, Article);
const denormalizedDataViaDecoratorApi = index_1.denormalize(result, Article, entities);
const user = new normalizr.schema.Entity('users');
const comment = new normalizr.schema.Entity('comments', { commenter: user });
const article = new normalizr.schema.Entity('articles', { author: user, comments: [comment] }, { idAttribute: 'key' });
let normalizedDataViaExistingApi;
var { entities, result } = normalizedDataViaExistingApi = normalizr.normalize(originalData, article);
const denormalizedDataViaExistingApi = normalizr.denormalize(result, article, entities);
assert.deepStrictEqual(normalizedDataViaDecoratorApi, normalizedDataViaExistingApi, 'Normalized data via decorator API is not equal to existing API');
assert.deepStrictEqual(denormalizedDataViaDecoratorApi, denormalizedDataViaExistingApi, 'Denormalized data via decorator API is not equal to existing API');
assert.deepStrictEqual(denormalizedDataViaDecoratorApi, originalData, 'Denormalized data via decorator API is not equal to original data');
//# sourceMappingURL=tests.js.map