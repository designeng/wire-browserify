var gulp = require('gulp');
var chalk = require('chalk');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');
var express = require('express');
var lrserver = require('tiny-lr')();
var refresh = require('gulp-livereload');
var livereload = require('connect-livereload');

var livereloadport = 35729;
var serverport = 5000;

var server = express();
server.use(livereload({
  port: livereloadport
}));
server.use(express.static('./public'));

function compile(watch) {
  var bundler = watchify(browserify('./src/index.js', { debug: true, extensions: ['.js', '.json'] }).transform(babel));

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source('build.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./public/build'));
  }

  function reload() {
    bundler.bundle().pipe(refresh(lrserver));
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
      reload();
    });
  }

  rebundle();
}

function watch() {
  return compile(true);
};

gulp.task('serve', function() {
  server.listen(serverport);
  lrserver.listen(livereloadport);
  console.log(chalk.blue('-> server listening on ' + serverport + ' port'));
});

gulp.task('build', function() { return compile(); });
gulp.task('watch', function() { return watch(); });

gulp.task('default', ['serve', 'watch']);