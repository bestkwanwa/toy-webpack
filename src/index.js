import fs from 'fs';
import path from 'path';
import parser from '@babel/parser';
import traverse from '@babel/traverse';
import { transformFromAst } from 'babel-core';
import ejs from 'ejs';

let id = 0

/**
 * To access the info of file.
 * @param {String} filePath  specified path of file
 * @returns {Object}
 */
function createAsset(filePath) {
    const sourceCode = fs.readFileSync(filePath, {
        encoding: 'utf-8'
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

    !fs.existsSync('../dist') && fs.mkdirSync('../dist')

    fs.writeFileSync('../dist/bundle.js', result)

}

build(createGraph())

