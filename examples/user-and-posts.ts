/*tslint:disable:no-console*/

/**
 * 1. Create 2 new posts for the user with id 1,
 * 2. get the data of the user with id 1
 * 3. and print the data combined
 */

import {sequenceT} from 'fp-ts/lib/Apply';
import * as E from 'fp-ts/lib/Either';
import * as TE from 'fp-ts/lib/TaskEither';
import {pipe} from 'fp-ts/lib/pipeable';
import * as t from 'io-ts';
import {failure} from 'io-ts/lib/PathReporter';
import 'isomorphic-fetch';
import {ApiError, ApiFetch, api} from '../src/index';

// --- Aliases
const teMap = TE.taskEither.map;

// --- Decoders
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

// --- Api
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

const concatPosts = sequenceT(TE.taskEither);

const main = (
  userId: number,
  post1: PostPayload,
  post2: PostPayload
): ApiFetch<User> =>
  pipe(
    concatPosts(
      createPost(userId, post1.title, post1.body),
      createPost(userId, post2.title, post2.body)
    ),
    TE.map(posts => posts.map(x => x.body)),
    TE.chain(posts =>
      teMap(getUser(userId), userResp => ({
        ...userResp,
        body: {...userResp.body, posts}
      }))
    )
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

// --- Execution
const POST1 = {
  body: 'My first post body',
  title: 'First post'
};

const POST2 = {
  body: 'My second post body',
  title: 'Second post'
};

main(1, POST1, POST2)().then(E.fold(printErr, data => console.log(data.body)));
