/**
 * Define Gulp Objects
 */
var gulp        = require('gulp'),
gulpif      = require('gulp-if'),
gutil       = require('gulp-util'),
sass        = require('gulp-sass')(require('node-sass')),
concat      = require('gulp-concat'),
coffee      = require('gulp-coffee'),
header      = require('gulp-header'),
uglify      = require('gulp-uglify'),
cssnano     = require('gulp-cssnano'),
addsrc      = require('gulp-add-src'),
changed     = require('gulp-changed'),
browserSync = require('browser-sync').create(),
pkg         = require('./package.json'),
prefix      = require('gulp-autoprefixer'),
strip       = require('gulp-strip-css-comments'),
yaml            = require('js-yaml'),
fs              = require('fs'),
reload      = browserSync.reload;

// isProduction = process.env.NODE_ENV is 'production';
var isProduction = false;

// ----------------------------------------------------------------------------

/**
 * Define Configuration object
 */
 var config;
if(isProduction) {
   config = yaml.load(fs.readFileSync('gulp_config.yaml', 'utf-8'));
}else{
    config = yaml.load(fs.readFileSync('gulp_ghost_config.yaml', 'utf-8'));
}
// ----------------------------------------------------------------------------

/**
 * Compile SASS into CSS
 */
// gulp.task 'js-common', ->
//   gulp.src src.js.common.main
//   .pipe changed dist.js
//   .pipe coffee().on 'error', gutil.log
//   .pipe addsrc src.js.common.vendor
//   .pipe concat dist.name + '.common.js'
//   .pipe gulpif(isProduction, uglify())
//   .pipe gulpif(isProduction, header banner, pkg: pkg)
//   .pipe gulp.dest dist.js
//   return

gulp.task('js-common', function(done){
    gulp.src(config.src.js.common.main)
        .pipe(changed(config.dist.js))
        .pipe(coffee())
        .pipe(addsrc(config.src.js.common.vendor))
        .pipe(concat(config.dist.name+ '.common.js'))
        .pipe(gulpif(isProduction, uglify()))
        //.pipe(gulpif(isProduction,))
        .pipe(gulp.dest(config.dist.js))
        .on('end', done);
});

// gulp.task 'js-post', ->
//   gulp.src src.js.post
//   .pipe changed dist.js
//   .pipe concat dist.name + '.post.js'
//   .pipe gulpif(isProduction, uglify())
//   .pipe gulpif(isProduction, header banner, pkg: pkg)
//   .pipe gulp.dest dist.js
//   return

gulp.task('js-post', function(done){
    gulp.src(config.src.js.post)
    .pipe(changed(config.dist.js))
    .pipe(concat(config.dist.name + '.post.js'))
    .pipe(gulpif(isProduction, uglify()))
    .pipe(gulp.dest(config.dist.js))
    .on('end', done);
});


// gulp.task 'css', ->
//   gulp.src src.css.vendor
//   .pipe changed dist.css
//   .pipe addsrc src.sass.main
//   .pipe sass().on('error', sass.logError)
//   .pipe concat '' + dist.name + '.css'
//   .pipe gulpif(isProduction, prefix())
//   .pipe gulpif(isProduction, strip all: true)
//   .pipe gulpif(isProduction, cssnano())
//   .pipe gulpif(isProduction, header banner, pkg: pkg)
//   .pipe gulp.dest dist.css
//   return
gulp.task('css', function(done) {
    gulp.src(config.src.css.vendor, {allowEmpty: true})
        .pipe(changed(config.dist.css))
        .pipe(addsrc(config.src.sass.main))
        //.pipe sass().on('error', sass.logError)
        .pipe(sass())
        .pipe(concat(config.dist.name + '.css'))
        .pipe(gulpif(isProduction, prefix()))
        // .pipe(gulpif(isProduction, strip('all')))
        .pipe(gulpif(isProduction, cssnano()))
        //.pipe gulpif(isProduction, header banner, pkg: pkg)
        .pipe(gulp.dest(config.dist.css,  {allowEmpty: true}))
        .on('end', done);
});

// gulp.task 'default', ->
//   gulp.start ['build', 'server']
//   gulp.watch src.sass.files, ['css', reload]
//   gulp.watch src.js.common.main, ['js-common', reload]
//   gulp.watch src.js.post, ['js-post', reload]

gulp.task('server', function(done){
    browserSync.init(pkg.browserSync);
    
    //  gulp.watch(config.src.sass.files, {'usePolling': true}, gulp.series('css', browserSync.reload))
     gulp.watch(config.src.sass.files, {'usePolling': true}).on('change',gulp.series('css', browserSync.reload));
    gulp.watch(config.src.js.common.main, {'usePolling': true}).on('change',gulp.series('js-common', browserSync.reload));
    // gulp.watch(config.src.js.common.main, {'usePolling': true}, gulp.series('js-common', browserSync.reload))
    gulp.watch(config.src.js.post, {'usePolling': true}).on('change',gulp.series('js-post', browserSync.reload));
    gulp.watch("content/themes/uno-zen/partials/*.hbs", {'usePolling': true}).on('change', browserSync.reload);
    // gulp.watch(config.src.js.post, {'usePolling': true}, gulp.series('js-post', browserSync.reload))
    done();
});

gulp.task('js', gulp.series(['js-common','js-post']));
gulp.task('build', gulp.series(['css','js']));

gulp.task('default', gulp.series(['build']));

gulp.task('watch', gulp.series(['server']));
