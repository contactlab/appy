# Changelog

## [4.0.0](https://github.com/contactlab/appy/releases/tag/4.0.0)

**Breaking:**

- Drop support for Nodejs <12

**Bug Fix:**

- Handle invalid URLs in withUrlParams ([#331](https://github.com/contactlab/appy/issues/331))
- Fix method for "get", "post", "put", "patch" and "del" request creators ([#332](https://github.com/contactlab/appy/issues/332))

**New Feature:**

- `withMethod` combinator to set `method` on `Request` ([#335](https://github.com/contactlab/appy/pull/335))

**Dependencies:**

- `[internal]` Upgrade fp-ts (and other dependencies) ([#333](https://github.com/contactlab/appy/issues/333))

**Documentation:**

- `[internal]` Changelog in documentation ([#334](https://github.com/contactlab/appy/issues/334))

## [3.1.3](https://github.com/contactlab/appy/releases/tag/3.1.3)

**Bug Fix:**

- Wrong headers definition in withDecoder ([#328](https://github.com/contactlab/appy/issues/328))

## [3.1.2](https://github.com/contactlab/appy/releases/tag/3.1.2)

**Bug Fix:**

- `[documentation]` Fix ReqInput merging strategy in combinators ([#326](https://github.com/contactlab/appy/pull/326))

## [3.1.1](https://github.com/contactlab/appy/releases/tag/3.1.1)

**Internal:**

- Remove useless `clearTimeout` in `combinators/abort` ([#320](https://github.com/contactlab/appy/pull/320))

## [3.1.0](https://github.com/contactlab/appy/releases/tag/3.1.0)

**New Feature:**

- Add timeout and abort combinator ([#315](https://github.com/contactlab/appy/issues/315))

## [3.0.2](https://github.com/contactlab/appy/releases/tag/3.0.2)

**Documentation:**

- Fix io-ts integration example in README ([#312](https://github.com/contactlab/appy/issues/312))
- Add reference to setup for Nodejs ([#311](<(https://github.com/contactlab/appy/issues/311)>))

## [3.0.1](https://github.com/contactlab/appy/releases/tag/3.0.1)

**Documentation:**

- Use categories in docs ([#305](https://github.com/contactlab/appy/issues/305))
- Make links absolute in docs ([#302](https://github.com/contactlab/appy/issues/302))
- add io-ts Decoder example ([#303](https://github.com/contactlab/appy/pull/303)) - thanks to @enricopolanski

**Internal:**

- `[dependencies]` Upgrade ESLint to v7 ([#304](https://github.com/contactlab/appy/issues/304))

## [3.0.0](https://github.com/contactlab/appy/releases/tag/3.0.0)

This version introduces another **big** breaking change with previous API.

Motivations and guide-lines can be found in the related [issue](https://github.com/contactlab/appy/issues/298) and in the [new documentation site](https://contactlab.github.io/appy).

**Breaking:**

- More agnostic API ([#298](https://github.com/contactlab/appy/issues/298))

## [2.0.1](https://github.com/contactlab/appy/releases/tag/2.0.1)

This release only fixes a NPM versioning issue

## [2.0.0](https://github.com/contactlab/appy/releases/tag/2.0.0)

**Breaking:**

- Move fp-ts to version 2.x ([#220](https://github.com/contactlab/appy/issues/220))

## [1.4.0](https://github.com/contactlab/appy/releases/tag/1.4.0)

**Internal:**

- set `fp-ts` version to be at least [1.9.0](https://github.com/gcanti/fp-ts/releases/tag/1.19.0) - this can lead to some deprecation warnings ([#183](https://github.com/contactlab/appy/pull/183))

## [1.3.0](https://github.com/contactlab/appy/releases/tag/1.3.0)

**Internal:**

- "\*-ts" dependencies with caret range ([#106](https://github.com/contactlab/appy/issues/106))
- Compile also as ES6 modules for better tree-shaking ([#107](https://github.com/contactlab/appy/issues/107))
- Update `io-ts` to version 1.8.1 ([#116](https://github.com/contactlab/appy/pull/116))

**Polish:**

- Remove classes in favour of interfaces + creator functions ([#108](https://github.com/contactlab/appy/issues/108))

**Deprecation:**

- Deprecate types with "Appy" prefix ([c03514e](https://github.com/contactlab/appy/commit/c03514e))

**Documentation:**

- Drop automatic generation of `CHANGELOG` ([#109](https://github.com/contactlab/appy/issues/109))

## [1.2.7](https://github.com/contactlab/appy/releases/tag/1.2.7)

**Internal:**

- Update `Typescript` to version 3.2.2 ([#99](https://github.com/contactlab/appy/pull/99))
- Update `io-ts` to version 1.6.2 ([#97](https://github.com/contactlab/appy/issues/97))

**Documentation:**

- Update min `Typescript`'s version to 3.2.2 in `README` ([#101](https://github.com/contactlab/appy/pull/101))

## [1.2.6](https://github.com/contactlab/appy/releases/tag/1.2.6)

**Internal:**

- Update `fp-ts` to version 1.12.3 ([#94](https://github.com/contactlab/appy/pull/94))
- Update `io-ts` to version 1.5.2 ([#95](https://github.com/contactlab/appy/pull/95))

## [1.2.5](https://github.com/contactlab/appy/releases/tag/1.2.5)

**Internal:**

- Update `fp-ts` to version 1.12.2 ([#91](https://github.com/contactlab/appy/pull/91))

## [1.2.4](https://github.com/contactlab/appy/releases/tag/1.2.4)

**Internal:**

- Update `fp-ts` to version 1.12.1 ([#82](https://github.com/contactlab/appy/pull/82))
- Update `io-ts` to version 1.5.1 ([#86](https://github.com/contactlab/appy/pull/86))

## [1.2.3](https://github.com/contactlab/appy/releases/tag/1.2.3)

**Internal:**

- Update `fp-ts` to version 1.12.0 ([#67](https://github.com/contactlab/appy/issues/67))
- Update `io-ts` to version 1.4.2 ([#63](https://github.com/contactlab/appy/pull/63))

## [1.2.2](https://github.com/contactlab/appy/releases/tag/1.2.2)

**Internal:**

- Update `Typescript` to version 3.1.6 ([#58](https://github.com/contactlab/appy/pull/58))
- Update `io-ts` to version 1.4.0 ([#54](https://github.com/contactlab/appy/pull/54))

## [1.2.1](https://github.com/contactlab/appy/releases/tag/1.2.1)

**Internal:**

- Update `fp-ts` to version 1.10.0 ([#44](https://github.com/contactlab/appy/pull/44))

## [1.2.0](https://github.com/contactlab/appy/releases/tag/1.2.0)

**Bug Fix:**

- Change `USVString` type alias to string type ([#38](https://github.com/contactlab/appy/issues/38))

**Internal:**

- Update `Typescript` to version 3.1.3 ([#39](https://github.com/contactlab/appy/issues/38))
- Update `io-ts` to version 1.3.1 ([#37](https://github.com/contactlab/appy/pull/37))
- Add changelog automatically generated ([#25](https://github.com/contactlab/appy/issues/25))
- Add keywords to package.json ([#23](https://github.com/contactlab/appy/issues/23))

## [1.1.1](https://github.com/contactlab/appy/releases/tag/1.1.1)

**Internal:**

- Fix a couple of typos in README

## [1.1.0](https://github.com/contactlab/appy/releases/tag/1.1.0)

**Internal:**

- Update `fp-ts` to version 1.9.0 ([ab499bf](https://github.com/contactlab/appy/commit/ab499bf))

## [1.0.0](https://github.com/contactlab/appy/releases/tag/1.0.0)

This version introduces a huge and breaking change which affect the below main topics.

Technical explanation could be found in the related issues.

Full documentation could be found in the `README` file.

**Breaking:**

- Moving from Flow type checker to `Typescript` ([#11](https://github.com/contactlab/appy/issues/11))
- Implementation of a more functional API ([#12](https://github.com/contactlab/appy/issues/12))

**New Feature:**

- Handle `fetch()` network errors (a.k.a. `TypeError`) ([#10](https://github.com/contactlab/appy/issues/10))

## [0.3.0](https://github.com/contactlab/appy/releases/tag/0.3.0)

**Bug Fix:**

- Types declared in the main export ([#5](https://github.com/contactlab/appy/issues/5))

**Polish:**:

- Published content is transpiled ([#6](https://github.com/contactlab/appy/issues/6))

## [0.2.0](https://github.com/contactlab/appy/releases/tag/0.2.0)

**New Feature:**

- Add PATCH method to request lib ([#1](https://github.com/contactlab/appy/issues/1))
- Token should not be passed in api configuration ([#2](https://github.com/contactlab/appy/issues/2))

**Documentation:**

- `README` file ([#3](https://github.com/contactlab/appy/issues/3))

## [0.1.0](https://github.com/contactlab/appy/releases/tag/0.1.0)

First alpha version
