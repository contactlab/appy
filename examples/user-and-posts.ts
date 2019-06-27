/*tslint:disable:no-console*/

/**
 * Create 2 new posts for the user with id 1,
 * get the data of the user with id 1
 * and print the data combined
 */

import {sequenceT} from 'fp-ts/lib/Apply';
import {taskEither} from 'fp-ts/lib/TaskEither';
import * as t from 'io-ts';
import {failure} from 'io-ts/lib/PathReporter';
import 'isomorphic-fetch';
import {ApiError, ApiFetch, api} from '../src/index';

interface Post extends t.TypeOf<typeof Post> {}
type PostPayload = Pick<Post, Exclude<keyof Post, 'id' | 'userId'>>;
const Post = t.type(
  {
    userId: t.number,
    id: t.number,
    title: t.string,
    body: t.string
  },
  'Post'
);

const Geo = t.type(
  {
    lat: t.string,
    lng: t.string
  },
  'Geo'
);

const Address = t.type(
  {
    street: t.string,
    suite: t.string,
    city: t.string,
    zipcode: t.string,
    geo: Geo
  },
  'Address'
);

const Company = t.type(
  {
    name: t.string,
    catchPhrase: t.string,
    bs: t.string
  },
  'Company'
);

const BaseUser = t.type(
  {
    id: t.number,
    name: t.string,
    username: t.string,
    email: t.string,
    address: Address,
    phone: t.string,
    website: t.string,
    company: Company
  },
  'Base user'
);

const WithPosts = t.partial(
  {
    posts: t.array(Post)
  },
  'With posts'
);

interface User extends t.TypeOf<typeof User> {}
const User = t.intersection([BaseUser, WithPosts]);

const myApi = api({baseUri: 'http://jsonplaceholder.typicode.com'});
const token = 'secret';

const createPost = (
  userId: number,
  title: string,
  body: string
): ApiFetch<Post> =>
  myApi.post('/posts', {
    token,
    decoder: Post,
    body: JSON.stringify({userId, title, body})
  });

const getUser = (id: number): ApiFetch<User> =>
  myApi.get(`/users/${id}`, {token, decoder: User});

const concatPosts = sequenceT(taskEither);

const main = (
  userId: number,
  post1: PostPayload,
  post2: PostPayload
): ApiFetch<User> =>
  concatPosts(
    createPost(userId, post1.title, post1.body),
    createPost(userId, post2.title, post2.body)
  )
    .map(posts => posts.map(x => x.body))
    .chain(posts =>
      getUser(userId).map(userResp => ({
        ...userResp,
        body: {...userResp.body, posts}
      }))
    );

const printErr = (err: ApiError): void => {
  switch (err.type) {
    case 'DecoderError':
      return console.error(failure(err.errors));
    case 'NetworkError':
    case 'BadUrl':
    case 'BadResponse':
      return console.error(err);
  }
};

const POST1 = {
  body: 'My first post body',
  title: 'First post'
};

const POST2 = {
  body: 'My second post body',
  title: 'Second post'
};

main(1, POST1, POST2)
  .run()
  .then(resp => resp.fold(printErr, data => console.log(data.body)));
