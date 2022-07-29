import fs from 'fs';
import ejs from 'ejs';
export class HtmlPlugin {
    apply(hooks) {
        hooks.emitHtml.tapPromise('html', (filePath, templatePath, outputPath) => {
            return new Promise((resolve, reject) => {
                const template = fs.readFileSync(templatePath, {
                    encoding: 'utf-8'
                })
                const result = ejs.render(template, { filePath })
                fs.writeFileSync(outputPath, result)
                resolve()
            })
        })
    }
}