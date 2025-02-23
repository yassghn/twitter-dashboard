#!/usr/bin/env node
/**
 * twitter-dashboard
 *
 * _build.js
 */
import zip from 'adm-zip'
import fs from 'fs-extra'
import minimist from 'minimist'
import { exit } from 'process'

// get name & version from package.json
import packagejson from './package.json' with {type: 'json'}

// config
const config = {
    outname: `${packagejson.name}-${packagejson.version}.zip`,
    dirs: {
        out: {
            zip: 'dist/zip',
            ext: 'dist/ext',
            dist: 'dist'
        },
        in: ['src/', 'resources/', 'dist/rolledup',]
    }
}

// zip
function zipit() {
    // dir check
    fs.ensureDirSync(config.dirs.out.zip)
    // init zip object
    const zipFile = new zip()
    // add in folders to build
    config.dirs.in.find((dir) => zipFile.addLocalFolder(dir))
    // create zip
    zipFile.writeZip(`${config.dirs.out.zip}/${config.outname}`)
}

// web-ext packaging
function webextPrepare() {
    // dir check
    fs.ensureDirSync(config.dirs.out.ext)
    // add in folders to build
    config.dirs.in.find((dir) => fs.copySync(dir, config.dirs.out.ext))
}

// build
function build() {
    // zip it
    zipit()
    // prepare webext package
    webextPrepare()
    // exit process success
    exit(0)
}

// clean
function clean() {
    // wipe dist dirs
    Object.entries(config.dirs.out)
        .forEach((dir, index) => { fs.removeSync(dir[1]) })
    // exit process success
    exit(0)
}

// parse args
function parseArgs() {
    // get args
    const args = minimist(process.argv.slice(2))

    // check for build
    if (args.b) {
        build()
    }

    // check for clean
    if (args.c) {
        clean()
    }

    // exit error
    exit(1)
}

// main
function _build() {
    // parse args
    parseArgs()
}

// run
_build()
