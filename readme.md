# twitter-dashboard <img style="position: absolute; left: 100%;" alt-text="twitter-dashboard icon" title="twitter-dashboard" src="resources/icons/twitter-dashboard-48.png">


dashboard for **twitter-2**. a *quality of life* firefox plugin.

## building

```shell
$ npm i

$ npm run build

$ npm run clean

$ npm run cleanbuild
```

## config

see [./web-ext-config.mjs](/web-ext-config.mjs)

edit firefox binary/profile (remove for defaults)

## running

```shell
$ npm run start
```

or

```text
1. about:debugging#/runtime/this-firefox

2. .../dist/zip/twitter-dashboard-${version}.zip

3. install temporary addon
```

## dev

watch src files for changes

```shell
$ npm run watch
```

run webext && watch dist files for changes

```shell
$ npm run start
```

## testing

```shell
$ npm run test
```

*there are no tests...yet*

## license

[OUI](/license)