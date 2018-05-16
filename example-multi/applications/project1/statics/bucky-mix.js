module.exports = mix => {
  mix
    .minify()
    // .hash()
    .sourceMap()

    .js('./a.js')

    .copy('./bucky.jpg')
    .copy('./favicon.ico')
}
