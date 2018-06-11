
/**
*
*/
var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var plugins = gulpLoadPlugins();
var browserSync = require('browser-sync');
var autoprefixer  = require('autoprefixer');


// var connect = require('gulp-connect');
// var proxy = require('http-proxy-middleware');
// gulp.task('connect', function() {
//   connect.server({
//         root: './dist',
//         livereload: true,
//         port: 8010,
//         middleware: function (connect, opt) {
//             return [
//                 proxy('/webapi/get_loan_rank', {
//                     target: 'https://www.yindou.com',
//                     changeOrigin:true
//                 })
//             ]
//         }
//   });
// });

var options = {
    removeComments: true,//清除HTML注释
    collapseWhitespace: false,//压缩HTML
    collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
    removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
    removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
    removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
    minifyJS: false,//压缩页面JS
    minifyCSS: false//压缩页面CSS
};
gulp.task('_copy',function() {
    return plugins.sequence('less','copy','revCss','revHtml')();
});
gulp.task('copy',['copycss','copyhtml','copyfonts']);




// // web字体压缩
// var fontSpider = require( 'gulp-font-spider' );
// gulp.task('fontspider', function() {
//     return gulp.src('src/*.html')
//         .pipe(fontSpider())
//         .on('error', log);;
// });

// 移动字体文件
gulp.task('copyfonts',function () {
   return gulp.src('src/fonts/*.ttf')
        .pipe(gulp.dest('./dist/fonts'))
       .on('error', log);
})

gulp.task('copycss',function () {
   return gulp
        .src('src/css/*.css')
        .pipe(plugins.cleanCss())
        .pipe(plugins.rename({extname: '.min.css'}))
        .pipe(plugins.rev())
        .pipe(gulp.dest('./dist/css'))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest('./rev/css'))
       .on('error', log);
})
gulp.task('copyhtml',function () {
   return gulp
        .src(['./src/*.html'])
        .pipe(plugins.htmlmin(options))
        .pipe(gulp.dest('./dist/'))
        .on('error', log);
})

//删除
gulp.task('clean', function() {
    return gulp
        .src(['./dist/'], {read: false})
        .pipe(plugins.clean({force: true}))
        .on('error', log);
});


// 编译Less
gulp.task('less', function() {
   return gulp.src(['./src/less/*.less']) //该任务针对的文件，*代表所有文件
       .pipe(plugins.less()) //该任务调用的模块
       .pipe(plugins.sourcemaps.init())
       .pipe(plugins.postcss([autoprefixer()]))
       .pipe(plugins.sourcemaps.write('.'))
       .pipe(gulp.dest('./src/css'))
       .on('error', log);
});


gulp.task('revHtml',function () {
    return gulp.src(['./rev/**/*.json', './dist/*.html'])
        .pipe(plugins.revCollector())
        .pipe(gulp.dest('./dist'))
        .on('error', log);
})

gulp.task('revCss',function () {
    return gulp.src(['./rev/**/*.json', './dist/css/*.css'])
        .pipe(plugins.revCollector())
        .pipe(gulp.dest('./dist/css'))
        .on('error', log);
})


/**
 * Watch for changes and recompile
 */
gulp.task('watch', function() {
    plugins.watch([
            './src/less/*.less',
            './src/images/*.{jpg,jpeg,png}',
            './src/*.html',
            './src/js/*.js'
        ],
        function() {
            gulp.start('_copy');
        });
});

gulp.task('browser-sync', function() {
    browserSync({
        files: ['dist/*.html','dist/css/*.css','dist/js/*.js'],
        server: {
            baseDir: "./dist"
        }
    });
    gulp.watch("./dist/*.html").on('change', browserSync.reload);
});

//错误日志
function log(error) {
    return console.error(error.toString && error.toString());
}

gulp.task('dev', ['watch','browser-sync']);

gulp.task('build',function(){
    return plugins.sequence('clean','_copy')();
});