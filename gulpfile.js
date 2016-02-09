var gulp = require('gulp');
//
var path = require('path');
//var replace = require('gulp-replace')
var livereload = require('gulp-livereload');
//var _ = require('underscore');
//
//var fs = require("fs");
//var shell = require('gulp-shell')
//var node_less = require('less');
//
//var copy = require('gulp-copy');
//var concat = require("gulp-concat");
//var md2json = require("gulp-markdown-table-to-json");
//
//var rename = require("gulp-rename");
var cached = require("gulp-cached")
var gutil = require('gulp-util');
//var injectfile = require('gulp-inject-file')
//var headerfooter = require('gulp-header-footer');
//var merge = require('merge-stream');
//var yield_prefix = require('gulp-yield-prefix');
var babel = require('gulp-babel');
var less=require('gulp-less');



function get_babel_params() {
    return {
        //        compact: false,
//        presets: ['es2015'],
        //        plugins: ["transform-runtime"],
        //        optional: ['runtime'],
    }
}

//gulp.task('html', function () {
//        return gulp.src(['html/index.html'])
//        .pipe(cached("html"))
//        .pipe(injectfile({
//            pattern: '<!--\\sinject:<filename>-->',
//            recursive:true
//        }))
//        .pipe(gulp.dest('./')).pipe(livereload());
//})


gulp.task('less', function () {
    var less = require('gulp-less');
    var e = less({
        paths: [path.join(__dirname, 'less', 'includes')]
    });
    e.on('error', function (ee) {
        gutil.log(ee);
        e.end();
    });


    return gulp.src('less/**/*.less')
        .pipe(e)
        .pipe(cached("less"))
        .pipe(gulp.dest('dist/css')).pipe(livereload());
});

gulp.task('mv-dist', function () {
    return gulp.src('libs/**/*')
//        .pipe(rename(function (path) {
//            if (path.extname) {
//                path.dirname += "/libs";
//            }
//        }))
        .pipe(gulp.dest('dist/'));
});



gulp.task('es6',  function () {
    var babel_pipe = babel(get_babel_params());
    babel_pipe.on('error', function (ee) {
        gutil.log(ee);
        babel_pipe.end();
    });
    return gulp.src(['js/**/*.js'])
        .pipe(cached("es6"))
        .pipe(babel_pipe)
        //        .pipe(browserify(get_browserify_params()))
        .pipe(gulp.dest('dist/js'))
        .pipe(livereload());
});


gulp.task('default', function () {

    gulp.start(["less",  "es6","mv-dist"]);

});
gulp.task('reload', function () {

    gulp.src("").pipe(livereload());

});
livereload.listen();
gulp.watch('less/**/*.less', ['less']);
gulp.watch('js/**/*.js', ['es6']);
gulp.watch('index.html', ['reload']);
gulp.watch('html/**/*.html', ['html']);
