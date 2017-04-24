# normalizr-decorators (highly experimental)
TypeScript normalizr decorators for normalization of class and property definitions

## Which normalizr Schema types can be used as decorators?
* Class
  * Entity via @Entity({key: string, options?: EntityOptions})
* Property
  * Entity via @EntityProperty()
  * Array via @ArrayProperty(element)

## Example decorating, normalizing and denormalizing
```javascript
import { ArrayProperty, Entity, EntityProperty, normalize, denormalize } from './index';

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

@Entity({key: 'articles'})
class Article {
  readonly id: number;

  @EntityProperty()
  author: User;

  @ArrayProperty(Comment)
  comments: Comment[];
}

const originalData = {
  id: 123,
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


const {entities, result}  = normalize(originalData, Article);
const denormalizedData = denormalize(result, Article, entities);
```
