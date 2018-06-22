
/**
* created at 18/05/01
* @author fozero
* @github https://github.com/fozero
*/
var gulp = require('gulp');

// less
var less = require("gulp-less");// less预编译
var postcss = require('gulp-postcss');//与autoprefixer一同使用 添加浏览器前缀
var sourcemaps   = require('gulp-sourcemaps');//-生成sourcemap文件 查看源代码排查问题
var autoprefixer = require('autoprefixer');//-添加浏览器前缀
var filter = require('gulp-filter');//解决css修改后浏览器无法刷新问题

// minify-css压缩
var cleanCSS = require('gulp-clean-css');//-css压缩处理
var rename = require("gulp-rename");//-文件重命名
var rev = require('gulp-rev');         //- 对文件名加MD5后缀

// rev路径替换
var revCollector = require('gulp-rev-collector');  //- 路径替换

// browser-sync浏览器自动刷新
var browserSync = require('browser-sync').create();//-开启静态服务，浏览器自动刷新

// 清空文件
var del  = require('del');   //-删除文件及目录

// 同步任务执行
var runSequence = require('run-sequence');




/**
* 编译less  处理浏览器前缀 支持sourcemaps
*/
gulp.task('less',function(){
	return gulp.src('./src/less/index.less')
		.pipe(less())
		.pipe(sourcemaps.init())
		.pipe(postcss([autoprefixer()]))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('./src/css'))
		.pipe(filter('**/*.css')) // Filtering stream to only css files
		.pipe(browserSync.reload({stream: true})); 
});


/**
* 压缩并重命名  md5文件命名  生成rev-manifest.json文件   压缩之前先清空文件
*/
gulp.task('minify-css',function(){
	return gulp.src('./src/css/*.css')
		.pipe(cleanCSS())   //压缩处理
		.pipe(rename({suffix:'.min'})) //文件重命名  suffix添加后缀   其他的还有prefix ， extname等
		.pipe(rev())         //- 文件名加MD5后缀
		.pipe(gulp.dest('./dist/css'))  //- 输出文件本地
		.pipe(rev.manifest())          //- 生成一个rev-manifest.json    后面的文件路径替换依据此文件内容
		.pipe(gulp.dest('./rev/css')); //- 将 rev-manifest.json 保存到 rev 目录内      
});


// 压缩js
var uglify = require('gulp-uglify'); 
gulp.task('minify-js',function(){
	 gulp.src('src/js/*.js')
	 	.pipe(uglify()) 
	 	.pipe(rename({suffix:'.min'}))  
	 	.pipe(rev()) 
	 	.pipe(gulp.dest('dist/js'))
	 	.pipe(rev.manifest())
	 	.pipe(gulp.dest('./rev/js'));
});

// 压缩html
var htmlmin = require('gulp-htmlmin');
gulp.task('minify-html', function() {
	var options = {
	    removeComments: true,//清除HTML注释
	    collapseWhitespace: false,//压缩HTML
	    collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
	    removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
	    removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
	    removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
	    minifyJS: true,//压缩页面JS
	    minifyCSS: true//压缩页面CSS
	};
  return gulp.src('src/*.html')
    .pipe(htmlmin(options))
    .pipe(gulp.dest('dist'));
});

// 压缩图片
// var imagemin = require('gulp-imagemin');
// gulp.task('minify-imgs', function() {
//   return gulp.src('src/images/*.{png,jpg,gif,ico}')
//     .pipe(imagemin({
//             optimizationLevel: 4, //类型：Number  默认：3  取值范围：0-7（优化等级）
//             progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
//             interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
//             multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
//         }))
//     .pipe(rev())
//     .pipe(gulp.dest('dist/images'))
//     .pipe(rev.manifest())
//     .pipe(gulp.dest('./rev/images'));
// });

var imagemin = require('gulp-imagemin');
gulp.task('minify-imgs', function() {
  return gulp.src('src/images/*.{png,jpg,gif,ico}')
    .pipe(imagemin({
            optimizationLevel: 4, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
        }))
    .pipe(gulp.dest('dist/images'))
});

/**
* 替换html文件中资源路径  如js，css，images
* 根据生成的rev-manifest.json文件  文件引用路径替换  **表示多层目录
*/
gulp.task('revHtml', function() {
    return gulp.src(['./rev/**/*.json', './dist/*.html'])   //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe(revCollector())                                   //- 执行文件内css名的替换
        .pipe(gulp.dest('./dist'));                     //- 替换后的文件输出的目录
});
// 替换资源css文件中资源路径  如images
gulp.task('revCss', function() {
    return gulp.src(['./rev/**/*.json', './dist/css/*.css'])   //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe(revCollector())                                   //- 执行文件内img名的替换
        .pipe(gulp.dest('./dist/css'));                     //- 替换后的文件输出的目录
});

/**
* 清空目录（build）
*/
gulp.task('clean',function(){
  return del(['./dist'],{force: true});
})

/**
* 浏览器自动刷新  设备同步刷新
* 静态服务器 + 监听 less/html 文件
*/
gulp.task('browser-sync',function(){
	browserSync.init({
        server: {
            baseDir: "./dist"// 从这个项目的src目录启动服务器
        }
    });
    gulp.watch("./dist/*.html").on('change', browserSync.reload);//监听html文件变化 自动刷新浏览器
});

//监听文件变化 执行copy任务
gulp.task('watch',function(){
	gulp.watch([
			'./src/less/*.less',
			'./src/js/*.js',
			'./src/images/*.{png,jpg,gif,ico}',
			'./src/*.html'
		],function(){
			gulp.start('copy');
		}
	);
});


// 同步处理任务  less编译-》压缩-》html及css文件中资源路径替换
gulp.task('copy',function() {
  return runSequence('less','minify','revCss','revHtml');//['a','b']异步执行
});
// 压缩文件
gulp.task('minify',['minify-css','minify-js','minify-imgs','minify-html']);


/**
* 开发模式   #gulp
*/
gulp.task('default',['watch','browser-sync']);

/**
* build构建，runSequence任务按顺序同步执行
*/
gulp.task('build', function() {
 	return runSequence('clean','copy');
});

