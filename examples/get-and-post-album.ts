/*tslint:disable:no-console*/

/**
 * 1. Fetch a list of albums with a simple request,
 * 2. take the first,
 * 3. take the title,
 * 4. create a new album with the title in upper-case
 * 5. and print the result
 */

import * as E from 'fp-ts/lib/Either';
import * as TE from 'fp-ts/lib/TaskEither';
import {pipe} from 'fp-ts/lib/pipeable';
import 'isomorphic-fetch';
import {get, post} from '../src/index';

interface Album {
  userId: number;
  id: number;
  title: string;
}

const URL = 'http://jsonplaceholder.typicode.com/albums';

const request = pipe(
  get(URL), // same as: request('GET', URL)
  TE.map(data => (data.body as Album[])[0]), // this is not safe ;)
  TE.map(album => ({
    id: 1001,
    userId: album.userId,
    title: album.title.toUpperCase()
  })),
  TE.chain(newAlbum =>
    post(URL, {
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify(newAlbum)
    })
  )
);

request().then(E.fold(err => console.log(err), data => console.log(data.body)));
