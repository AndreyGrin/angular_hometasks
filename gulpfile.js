// core
var gulp = require('gulp');

// html
var minifyHTML = require('gulp-minify-html');

// scripts
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

// styles
var minifyCss = require('gulp-minify-css');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var postcss = require('gulp-postcss');

// style options
var opacity = function(css) {
  css.eachDecl(function(decl, i) {
    if (decl.prop === 'opacity') {
      decl.parent.insertAfter(i, {
        prop: '-ms-filter',
        value: '"progid:DXImageTransform.Microsoft.Alpha(Opacity=' + (parseFloat(decl.value) * 100) + ')"'
      });
    }
  });
};

// plugins
var browserSync = require('browser-sync').create();
var imageop = require('gulp-image-optimization');

// tasks

// Watch less AND html files
gulp.task('serve', ['styles'], function () {

    // Serve files from the root of this project
    browserSync.init({
        server: {
            baseDir: "production",
            index: "index.html"
        }
    });
});

gulp.task('image', function(cb) {
    gulp.src(['develop/img/**/*.png','develop/img/**/*.jpg']).pipe(imageop({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true
    })).pipe(gulp.dest('./production/img')).on('end', cb).on('error', cb);
});

gulp.task('scripts', function() {
  gulp.src('develop/js/*.js')
    .pipe(concat('scripts.js'))
    //.pipe(uglify())
    .pipe(gulp.dest('production/js'))
});

gulp.task('styles', function() {

  gulp.src('develop/css/style.less')
    .pipe(less())
    .pipe(autoprefixer({browsers: ['last 2 versions']}))
    .pipe(postcss([opacity]))
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(browserSync.stream())
    .pipe(gulp.dest('production/css'));
});

gulp.task('minify-html', function() {
  var opts = {
    conditionals: true,
    spare:true
  };

  return gulp.src('develop/index.html')
    .pipe(minifyHTML(opts))
    .pipe(gulp.dest('production/'));
});

gulp.task('automate', function() {
    gulp.watch(['develop/index.html', 'develop/css/*.less', 'develop/js/*.js'], ['scripts', 'styles', 'minify-html']).on('change', browserSync.reload);
});

gulp.task('default', ['scripts', 'styles', 'automate', 'serve', 'minify-html', 'image']);