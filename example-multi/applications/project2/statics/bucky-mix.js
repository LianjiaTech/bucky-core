module.exports = mix => {
  mix
    // .minify()
    // .hash()
    // .sourceMap()
    // .dest('./.mix')

    .js('./a.js')
    .js('./b.js')
    .copy('./bucky.jpg')
    .copy('./favicon.ico')
}
