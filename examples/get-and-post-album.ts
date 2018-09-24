/*tslint:disable:no-console*/

/**
 * Fetch a list of albums with a simple request,
 * take the first,
 * take the title,
 * create a new album with the title in upper-case
 * and print the result
 */

import 'isomorphic-fetch';
import {get, post} from '../src/index';

interface Album {
  userId: number;
  id: number;
  title: string;
}

const URL = 'http://jsonplaceholder.typicode.com/albums';

// same as: request('GET', URL)
get(URL)
  .map(data => (data.body as Album[])[0]) // this is not safe ;)
  .map(album => ({
    id: 1001,
    userId: album.userId,
    title: album.title.toUpperCase()
  }))
  .chain(newAlbum =>
    post(URL, {
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify(newAlbum)
    })
  )
  .run()
  .then(result =>
    result.fold(err => console.log(err), data => console.log(data.body))
  );
