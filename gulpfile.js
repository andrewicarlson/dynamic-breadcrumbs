var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var gutil = require('gulp-util');
var pug = require('gulp-pug');
var assign = require('lodash.assign');
var buffer = require('vinyl-buffer');
var babelify = require('babelify');
var tsify = require('tsify');
var browserSync = require('browser-sync');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');

var paths = {
  before: './src',
  after: './dist'
};

paths.scripts = {
  entry: paths.before + '/index.ts',
  after: paths.after
};

paths.views = {
  before: paths.before + '/**/*.pug',
  after: paths.after
};

paths.server = paths.after;

var customOpts = {
    baseDir: '.',
    entries: [paths.scripts.entry],
    debug: true,
    cache: {},
    packageCache: {}
};

var opts = assign({}, watchify.args, customOpts);

var build = watchify(browserify(opts));

build
  .plugin(tsify)
  .transform(babelify, {

    presets: ['es2015'],
    extensions: ['.ts', '.tsx']
  });

build.on('update', bundle); // on dep update run bundler.
build.on('log', gutil.log); // output build logs to terminal.

function bundle() {

  return build.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('dynamic-breadcrumbs.js'))
    //.pipe(streamify(uglify()))
    .pipe(gulp.dest(paths.scripts.after));
}

gulp.task('views', function() {

  return gulp.src(paths.views.before)
    .pipe(pug({
      pretty: true
    }))
    .on('error', gutil.log)
    .pipe(gulp.dest(paths.views.after));
});

gulp.task('scripts', bundle);

gulp.task('serve', ['scripts', 'views'], function() {
    browserSync.init({
        server: {
            baseDir: paths.server
        }
    });

    gulp.watch(paths.views.before, ['views']);
    gulp.watch([
      paths.scripts.after + '/dynamic-breadcrumbs.js',
      paths.views.after + '/**/*.html'
    ]).on('change', browserSync.reload);
});

gulp.task('default', ['serve']);
