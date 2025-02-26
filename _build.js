#!/usr/bin/env node
/**
 * twitter-dashboard
 *
 * _build.js
 */
import { globSync } from 'node:fs'
import zip from 'adm-zip'
import fs from 'fs-extra'
import minimist from 'minimist'
import { exit } from 'process'
import * as sass from 'sass'

// get name & version from package.json
import packagejson from './package.json' with {type: 'json'}

// config
const config = {
    outname: `${packagejson.name}-${packagejson.version}.zip`,
    dirs: {
        ext: 'dist/ext',
        out: { zip: 'dist/zip', dist: 'dist' },
        in: ['resources/', 'dist/rolledup',]
    },
    src: {
        res: 'src\\resources',
        js: ['src/**/*.js'],
        sass: ['src/**/*.scss']
    }
}

// copy javascript
function copyJs() {
    try {
        const files = globSync(config.src.js)
        for (let file of files) {
            const dest = file.includes('resources') ? config.dirs.ext+file.replace(config.src.res, '') : config.dirs.ext+file.replace('src', '')
            fs.cpSync(file, dest)
        }
    } catch (e) {
        console.error(e)
        exit(1)
    }
}

// compile sass files
function compileSass() {
    try {
        const files = globSync(config.src.sass)
        for (let file of files) {
            const result = sass.compile(file)
            const dest = (config.dirs.ext+file.replace(config.src.res, '')).replace('scss', 'css')
            fs.writeFileSync(dest, result.css)
        }
    } catch (e) {
        console.error(e)
        exit(1)
    }
}

// zip
function zipit() {
    // dir sync check
    fs.ensureDirSync(config.dirs.out.zip)
    // init zip object
    const zipFile = new zip()
    // add in folders to build
    zipFile.addLocalFolder(config.dirs.ext)
    // create zip
    zipFile.writeZip(`${config.dirs.out.zip}/${config.outname}`)
}

// web-ext packaging
function webextPrepare() {
    // add in folders to build
    config.dirs.in.find((dir) => fs.copySync(dir, config.dirs.ext))
}

// build
function build() {
    // dir sync check
    fs.ensureDirSync(config.dirs.ext)
    // copy js
    copyJs()
    // compile sass
    compileSass()
    // prepare webext package
    webextPrepare()
    // zip it
    zipit()
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
