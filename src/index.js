import fs from 'fs';
import path from 'path';
import parser from '@babel/parser';
import traverse from '@babel/traverse';
import { transformFromAst } from 'babel-core';
import ejs from 'ejs';
import { SyncHook } from 'tapable';

import { jsonLoader } from './jsonLoader.js';
import { ChangeOutputFilename } from './ChangeOutputFilename.js';

let id = 0

const config = {
    module: {
        rules: [
            {
                test: /\.json$/,
                use: [jsonLoader]
            },
        ],
    },
    plugins: [new ChangeOutputFilename()]
}

const hooks = {
    emitChange: new SyncHook(['pluginContext']),
}

function initPlugins() {
    const plugins = config.plugins
    plugins.forEach(plugin => {
        plugin.apply(hooks)
    })
}

/**
 * To access the info of file.
 * @param {String} filePath  specified path of file
 * @returns {Object}
 */
function createAsset(filePath) {
    let sourceCode = fs.readFileSync(filePath, {
        encoding: 'utf-8'
    })

    const loaders = config.module.rules

    const loaderContext = {
        addDeps(dep) {
            console.log('add deps:', dep);
        }
    }

    loaders.forEach(({ test, use }) => {
        if (test.test(filePath)) {
            if (Array.isArray(use)) {
                use.reverse().forEach(fn => {
                    sourceCode = fn.call(loaderContext, sourceCode)
                })
            } else {
                sourceCode = use.call(loaderContext, sourceCode)
            }
        }
    })

    const ast = parser.parse(sourceCode, {
        sourceType: 'module'
    })
    const deps = []
    traverse.default(ast, {
        enter(path) {
            if (path.node.type === "ImportDeclaration") {
                console.log('type is ImportDeclaration');
            }
        },
        ImportDeclaration(path) {
            const { node } = path
            deps.push(node.source.value)
        }
    })

    const { code } = transformFromAst(ast, undefined, {
        presets: ["env"]
    })

    return {
        filePath,
        code,
        deps,
        mapping: {},
        id: id++
    }
}

/**
 * To generate the dependency graph of module.
 * @returns 
 */
function createGraph() {
    const mainAsset = createAsset('../source/main.js')

    const queue = [mainAsset]

    for (const asset of queue) {
        asset.deps.forEach(relativePath => {
            const childAsset = createAsset(path.resolve('../source', relativePath))
            asset.mapping[relativePath] = childAsset.id
            queue.push(childAsset)
        });
    }

    return queue
}

/**
 * To generate the bundle.
 * @param {Array} graph 
 */
function build(graph) {
    const template = fs.readFileSync('./bundle.ejs', {
        encoding: 'utf-8'
    })

    const data = graph.map(asset => {
        const { id, code, mapping } = asset
        return {
            id,
            code,
            mapping,
        }
    })

    const result = ejs.render(template, { data })

    let outputFilename = 'bundle.js'

    const pluginContext = {
        changeOutputFilename(name) {
            outputFilename = name
        }
    }

    hooks.emitChange.call(pluginContext)

    !fs.existsSync('../dist') && fs.mkdirSync('../dist')

    fs.writeFileSync(`../dist/${outputFilename}`, result)

}

initPlugins()
build(createGraph())

