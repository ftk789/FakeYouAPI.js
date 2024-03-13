<div align="center">
    <p><a href="https://fakeyou.js.org"><img src="./icon.png" width="640"/></a></p>
	<p><a href="https://discord.gg/H72KFXm"><img src="https://img.shields.io/static/v1?label=DISCORD&message=FakeYou&color=7289da&style=for-the-badge" alt="Discord" /></a> <a href="https://www.npmjs.com/package/fakeyouapi.js"><img src="https://img.shields.io/npm/v/fakeyouapi.js?label=NPM&color=red&style=for-the-badge" alt="NPM" /></a> <a href="https://github.com/ftk789/FakeYouAPI.js"><img src="https://img.shields.io/github/license/leunamcrack/fakeyou.js?style=for-the-badge" alt="GITHUB" /></a>
	</p>
</div>

> **fakeyouapi.js is a powerful [Node.js](https://nodejs.org) module that allows you to interact with the [FakeYouAPI](https://docs.fakeyou.com) easily. (An updated version of FakeYou.js )**

## Features

- [Login or use your token](#login-or-use-your-token)
- [Search models](#search-models)
- [Make TTS requests( Text to Speech )](#make-tts-request)
- [Make TTI requests ( Text to Image )](#make-tti-request)
- [LeaderBoard](#leaderboard)
- [Edit client user](#edit-client-user)
- [Get all data from an entity](#get-all-data-from-an-entity)

## Examples

### Login or use your token

```js
const FakeYou = require("fakeyou.js");
const fy = new FakeYou.Client({
  token: "anOptionalSecretToken",
  usernameOrEmail: "anOptionalCoolUsernameOrEmail",
  password: "anOptionalSuperSecretPassword",
});
await fy.start(); //required
```

### Search TTS models

```js
let models = fy.searchModel("mario");
models.first();
```

### Make TTS Request

```js
await fy.makeTTS("mario", "A cool text to speech");
//or
let model = fy.searchModel("mario").first();
if (model) {
  await model.request("A cool text to speech");
}
```

### Make TTI Request

```js
// You can search for weights by using the method below:
let weights = await fy.getTTIModels();
// This will return an array of all the available models, You log it and pick one like how you pick from an array.

// the format of the array is like this:
/*
[
  ...
  {
    title: Weight_Title, weight_token: Weight_Token
  }
  ...
]
*/

let response = await fy.makeTTI(weights[8], "A cool text to image prompt", LoraModel, NegativeText, seed, imageShape, sampler, CGF_Scale, SamplesNumber, BatchCount);

/* 

The current variables are optional and not:



LoraModel (string), NegativeText (string), seed (integer), imageShape (string), sampler (string), CGF_Scale (integer), SamplesNumber (integer), BatchCount (integer) .

You can obtain those values and inputs from FakeYou's website.

Inserting a wrong format of a integer value or a text, Will result in an error.

*/

//or

let response = await fy.makeTTI(weights[4], "A cool text to image prompt");


/*

An example of a response:

[
  'https://storage.googleapis.com/vocodes-public/media/0/3/4/2/m/0342m88c1vqjt24zd5qpat5gns270bdr/image_0342m88c1vqjt24zd5qpat5gns270bdr.png',
  'https://storage.googleapis.com/vocodes-public/media/y/9/t/k/j/y9tkj5nt40q3cqgaseje1h0zg46agwf8/image_y9tkj5nt40q3cqgaseje1h0zg46agwf8.png',
  'https://storage.googleapis.com/vocodes-public/media/h/c/s/1/d/hcs1d36papj6gknxdb8s80g4z35ndwdg/image_hcs1d36papj6gknxdb8s80g4z35ndwdg.png',
  'https://storage.googleapis.com/vocodes-public/media/f/d/j/y/k/fdjykhmrnyqj3jjjyxy4trp6dvde6qfy/image_fdjykhmrnyqj3jjjyxy4trp6dvde6qfy.png'
]

*/

```

### LeaderBoard

```js
let lb = await fy.leaderboard();
lb.getPosition(3, true);
```

### Edit client user

```js
await fy.user.edit({
  description: "Another **random** user in FakeYou",
  twitter: null,
  github: "a-cool-username",
  ttsVisibility: false,
});
```

### Get all data from an entity

```js
await fy.models.fetch("TM:7wbtjphx8h8v");
//or
await fy.fetchUser("acoolusername");
//or
let result = fy.results.cache.get("TR:tn7gq96wg6httvnq91y4y9fka76nj");
if (result) {
  await result.fetch();
}
```

## Useful links

- [Documentation](https://fakeyou.js.org) ([source](https://github.com/ftk789/FakeYouAPI.js/tree/docs))
- [GitHub repository](https://github.com/ftk789/FakeYouAPI.js)
- [NPM package](https://www.npmjs.com/package/fakeyouapi.js)
- [FakeYou Discord server](https://discord.gg/H72KFXm)
