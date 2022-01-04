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
browserSync = require('browser-sync'),
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
var config = yaml.load(fs.readFileSync('gulp_config.yaml', 'utf-8'));

// ----------------------------------------------------------------------------

/**
 * Compile SASS into CSS
 */
// gulp.task('Generate Styles', function () {
//     gulp.src(config.src.sass)
//         .pipe(plumber())
//         .pipe(sass())
//         .pipe(autoprefixer("> 1%"))
//         .pipe(gulp.dest(config.dest.css))
//         .pipe(minifyCss())
//         .pipe(gulp.dest(config.dest.css));
// });


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

gulp.task('js-common', function(){
    return gulp.src(config.src.js.common.main)
        .pipe(changed(config.dist.js))
        .pipe(coffee())
        .pipe(addsrc(config.src.js.common.vendor))
        .pipe(concat(config.dist.name+ '.common.js'))
        .pipe(gulpif(isProduction, uglify()))
        //.pipe(gulpif(isProduction,))
        .pipe(gulp.dest(config.dist.js))
});

// gulp.task 'js-post', ->
//   gulp.src src.js.post
//   .pipe changed dist.js
//   .pipe concat dist.name + '.post.js'
//   .pipe gulpif(isProduction, uglify())
//   .pipe gulpif(isProduction, header banner, pkg: pkg)
//   .pipe gulp.dest dist.js
//   return

gulp.task('js-post', function(){
    return gulp.src(config.src.js.post)
    .pipe(changed(config.dist.js))
    .pipe(concat(config.dist.name + '.post.js'))
    .pipe(gulpif(isProduction, uglify()))
    .pipe(gulp.dest(config.dist.js))
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
gulp.task('css', function() {
    return gulp.src(config.src.css.vendor, {allowEmpty: true})
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
});

// gulp.task 'default', ->
//   gulp.start ['build', 'server']
//   gulp.watch src.sass.files, ['css', reload]
//   gulp.watch src.js.common.main, ['js-common', reload]
//   gulp.watch src.js.post, ['js-post', reload]

gulp.task('server', function(){
    return browserSync.init(pkg.browserSync);
});

gulp.task('js', gulp.series(['js-common','js-post']));
gulp.task('build', gulp.series(['css','js']));

gulp.task('default', gulp.series(['build', 'server']), function(){
    gulp.watch(config.src.sass.files, gulp.series('css', reload))
    gulp.watch(config.src.js.common.main, gulp.series('js-common', reload))
    gulp.watch(config.src.js.post, gulp.series('js-post', reload))
});

// ----------------------------------------------------------------------------

/**
 * Compile CoffeeScript and Angular Code into JS
 */
// gulp.task('Generate Scripts', function () {
//     gulp.src(config.src.coffee)
//         .pipe(plumber())
//         .pipe(include())
//         .pipe(coffee({bare: true}))
//         .pipe(ngAnnotate())
//         .pipe(gulp.dest(config.dest.js));
// });

// // ----------------------------------------------------------------------------

// /**
//  * Compile Bower files
//  */
// gulp.task('Compress Third Party Files', function () {
//     // Combine JS Files
//     gulp.src(config.third_party.js)
//         .pipe(uglify())
//         .pipe(concat('dependencies.min.js'))
//         .pipe(gulp.dest(config.dest.js));

//     // Combine CSS files
//     gulp.src(config.third_party.css)
//         .pipe(minifyCss())
//         .pipe(concat('dependencies.min.css'))
//         .pipe(gulp.dest(config.dest.css));

//     // Flatten fonts
//     gulp.src(config.third_party.fonts)
//         .pipe(flatten())
//         .pipe(gulp.dest(config.dest.fonts));
// });

// // ----------------------------------------------------------------------------

// /**
//  * Create Watch Scripts
//  */
// gulp.task('Create Watch Scripts', function () {
//     watch({glob: config.src.coffee, emitOnGlob: false}, ['Generate Scripts']);
//     watch({glob: config.src.sass, emitOnGlob: false}, ['Generate Styles']);
// });

// // ----------------------------------------------------------------------------

// /**
//  * Default task
//  */
// gulp.task('default', [
//     'Generate Scripts',
//     'Generate Styles',
//     'Compress Third Party Files',
//     'Create Watch Scripts'
// ]);

// gulp.task('default', [
//     'js-common'
// ]);
