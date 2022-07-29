export class ChangeOutputFilename {
    apply(hooks) {
        hooks.emitChange.tap('changeOutputFilename', (context) => {
            context.changeOutputFilename('main.js')
            console.log('output filename changed!');
        })
    }
}