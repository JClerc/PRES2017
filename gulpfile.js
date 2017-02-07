// Require each gulp plugins
var gulp         = require('gulp');
var uglify       = require('gulp-uglify');
var sass         = require('gulp-sass');
var browserSync  = require('browser-sync').create();
var imagemin     = require('gulp-imagemin');
var autoprefixer = require('gulp-autoprefixer');
var babel        = require('gulp-babel');
var sourcemaps   = require('gulp-sourcemaps');
var concat       = require('gulp-concat');
var plumber      = require('gulp-plumber');
var config       = require('./config.json');

// Html
gulp.task('html', () => {
  gulp.src(config.tasks.html.src)
  .pipe(plumber())
  .pipe(gulp.dest(config.tasks.html.dest))
  .pipe(browserSync.stream());
});

// Task script
gulp.task('script', () => {
  gulp.src(config.tasks.script.src)
  .pipe(plumber())
  .pipe(sourcemaps.init())

  .pipe(babel({ presets: ['es2015'] }))
  .pipe(concat('app.js'))
  .pipe(uglify())

  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(config.tasks.script.dest))
  .pipe(browserSync.stream());
});

// Task libs
gulp.task('libs', () => {
  gulp.src(config.tasks.script.libs)
  .pipe(plumber())

  .pipe(concat('libs.js'))
  .pipe(uglify())

  .pipe(gulp.dest(config.tasks.script.dest))
  .pipe(browserSync.stream());
});

// Task style
gulp.task('style', () => {
  gulp.src(config.tasks.style.src)
  .pipe(plumber())
  .pipe(sourcemaps.init())

  .pipe(sass({ outputStyle: 'compressed' }))
  .pipe(autoprefixer('last 2 versions'))
  .pipe(concat('app.css'))

  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(config.tasks.style.dest))
  .pipe(browserSync.stream());
});

// Image compressor
gulp.task('image', () => {
  gulp.src(config.tasks.image.src)
  .pipe(imagemin())
  .pipe(gulp.dest(config.tasks.image.dest));
});

// resources files
gulp.task('resources', () => {
  gulp.src(config.tasks.resources.src)
  .pipe(gulp.dest(config.tasks.resources.dest));
});

// Fonts
gulp.task('fonts', () => {
  gulp.src(config.tasks.fonts.src)
  .pipe(plumber())
  .pipe(gulp.dest(config.tasks.fonts.dest))
  .pipe(browserSync.stream());
});

// Watches changes
gulp.task('watch', () => {
  browserSync.init({ server: config.server.directory, browser: [] });
  gulp.watch(config.tasks.html.src, ['html']);
  gulp.watch(config.tasks.image.src, ['image']);
  gulp.watch(config.tasks.resources.src, ['resources']);
  gulp.watch(config.tasks.script.src, ['script']);
  gulp.watch(config.tasks.script.libs, ['libs']);
  gulp.watch(config.tasks.fonts.src, ['fonts']);
  gulp.watch(config.tasks.style.src, ['style']);
  gulp.watch(config.tasks.html.src).on('change', browserSync.reload);
});

// Default
gulp.task('default', () => {
  console.log('');
  console.log('$ gulp dev : build then watch for changes');
  console.log('$ gulp build : make all assets');
  console.log('');
});

// Trigger build & watch
gulp.task('dev', ['script', 'libs', 'fonts', 'style', 'image', 'resources', 'html', 'watch']);

// Only build
gulp.task('build', ['script', 'libs', 'fonts', 'style', 'image', 'resources', 'html']);
