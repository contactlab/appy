/**
 * `Response` module: exports utilites to work with `Response` objects.
 *
 * @since 4.0.1
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Response|Response}
 */

/**
 * Clones a `Response` object with the provided content as body.
 *
 * **Warning:** if the content is a plain object and _stringifying_ it fails, the cloned `Response`'s body will be set to `null` (the default value).
 *
 * @category helpers
 * @since 4.0.1
 */
export function cloneResponse<A>(from: Response, content: A): Response {
  let body: BodyInit | null;

  try {
    body =
      typeof content === 'object' ? JSON.stringify(content) : String(content);
  } catch (e) {
    body = null;
  }

  return new Response(body, {
    headers: from.headers,
    status: from.status,
    statusText: from.statusText
  });
}
