# twitter-dashboard <img align="right" alt-text="twitter-dashboard icon" title="twitter-dashboard" src="resources/icons/twitter-dashboard-48.png">


dashboard for **twitter-2**. a *quality of life* firefox plugin.

## building

clone

```gitignore
git clone git@github.com:yassghn/twitter-dashboard
```

build

```boo
$ cd ./twitter-dashboard

$ npm i

$ npm run build
```

clean

```boo
$ npm run clean
```

clean & build

```boo
$ npm run cleanbuild
```

## config

see [./web-ext-config.mjs](/web-ext-config.mjs)

edit firefox binary/profile (remove for defaults)

## running

```boo
$ npm run start
```

or

```gitignore
1. about:debugging#/runtime/this-firefox

2. .../dist/zip/twitter-dashboard-${version}.zip

3. install temporary addon
```

## dev

watch src files for changes

```boo
$ npm run watch
```

run webext & watch dist files for changes

```boo
$ npm run start
```

## testing

```boo
$ npm run test
```

*there are no tests...yet*

## license

[OUI](/license)
