export class ChangeOutputFilename {
    apply(hooks) {
        hooks.emitChange.tap('changeOutputFilename', (context) => {
            context.changeOutputFilename('main-bundle.js')
            console.log('output filename changed!');
        })
    }
}