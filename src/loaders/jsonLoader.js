export function jsonLoader(source) {
    this.addDeps('log dep')
    return `export default ${JSON.stringify(source)}`
}