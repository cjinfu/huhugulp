var gulp = require('gulp');
var del = require('del');
var gulpif = require('gulp-if');
var browserify = require('browserify');
var template = require('gulp-template-compile');
var source = require('vinyl-source-stream');
var buffer = require('gulp-buffer');
var replace = require('gulp-replace');
var rev = require('gulp-rev');
var clean = require('gulp-clean');
var run = require('run-sequence');
var minifyHTML = require('gulp-minify-html');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var fs = require('fs');
var savefile = require('gulp-savefile');
var _ = require('lodash');
var async = require('async');

var project = require('./project');

var urlCdn=project.cdn;//代码中使用：___cdn 替换cdn路径
var urlWeb=project.root;//代码中使用：___web 替换web路径
var timeline=new Date().getTime();//代码中使用：___timeline 替换时间戳
//代码中使用：___md5字符戳的文件名将被md5 例如： test.js?___md5 ，支持的文件有js,css,img

gulp.task('cleandev', function() {
    return gulp.src(['./dev/*'], {read: false})
        .pipe(clean());
});
gulp.task('cleandist', function() {
    return gulp.src(['./dist/*'], {read: false})
        .pipe(clean());
});

gulp.task('filesclone', function(cb) {
    var q1=_.map([1], function(item) {
        return function(callback) {
            gulp.src('./src/lib/**')
                .pipe(gulp.dest('./dev/lib/'))
                .on('end', function() {
                    callback();
                });
        };
    });
    var q2=_.map([1], function(item) {
        return function(callback) {
            gulp.src('./src/img/**')
                .pipe(gulp.dest('./dev/img/'))
                .on('end', function() {
                    callback();
                });
        };
    });
    async.parallel(q1.concat(q2), function(err, result) {
        cb(err, result);
    });
});

gulp.task('tmpl',function(){
    return gulp.src('./src/js/tmpl/*.html')
        .pipe(template())
        .pipe(gulp.dest('./src/js/tmpl/'));
});

//@import url('./src/css/patch/wave.css');
gulp.task('import',function(){
    return gulp.src(['./src/css/*.css'])
        .pipe(replace(/@import url\('(.+?\.css)'\);*/ig, function(a,b){
            // console.log(b);
            // console.log(fs.existsSync(b));
            if (fs.existsSync(b)) {
                return fs.readFileSync(b);
            }
        }))
        .pipe(replace(/\_\_\_(cdn)/g, urlCdn))
        .pipe(replace(/\_\_\_(web)/g, urlWeb))
        .pipe(replace(/\_\_\_(timeline)/g, timeline))
        .pipe(gulp.dest('./dev/css/'));
});

//<!-- #include file = "myfile.html" -->
gulp.task('include',function(){
    return gulp.src(['./src/*.html'])
        .pipe(replace(/<\!--\s*#include file\s*=\s*"(.+?\.[html|css|js]+)"\s*-->/ig, function(a,b){
            // console.log(b);
            // console.log(fs.existsSync(b));
            if (fs.existsSync(b)) {
                return fs.readFileSync(b);
            }
        }))
        .pipe(replace(/\_\_\_(cdn)/g, urlCdn))
        .pipe(replace(/\_\_\_(web)/g, urlWeb))
        .pipe(replace(/\_\_\_(timeline)/g, timeline))
        .pipe(gulp.dest('./dev/'));
});

gulp.task('browserify',function(cb){
    var srcDir = './src/js/',
        devDir = './dev/js/';
    var fireList = fs.readdirSync(srcDir);
    var jss = [];
    fireList.forEach(function(item){
        if(fs.statSync(srcDir + item).isFile()){
            jss.push(item);
        }
    });
    var q1 = _.map(jss, function(item) {
        return function(callback) {
            return browserify(srcDir + item)
                .bundle()
                .pipe(source(item))
                .pipe(buffer())
                .pipe(replace(/\_\_\_(cdn)/g, urlCdn))
                .pipe(replace(/\_\_\_(web)/g, urlWeb))
                .pipe(replace(/\_\_\_(timeline)/g, timeline))
                .pipe(gulp.dest(devDir))
                .on('end', function() {
                    callback();
                });
        };
    });
    async.parallel(q1, function(err, result) {
        cb(err, result);
    });

    // var dir = './src/js/';
    // var fireList = fs.readdirSync(dir);
    // fireList.forEach(function(item){
    //     if(fs.statSync(dir + item).isFile()){
    //         return browserify(dir + item)
    //             .bundle()
    //             .pipe(source(item))
    //             .pipe(buffer())
    //             .pipe(replace(/\_\_\_(cdn)/g, urlCdn))
    //             .pipe(replace(/\_\_\_(web)/g, urlWeb))
    //             .pipe(replace(/\_\_\_(timeline)/g, timeline))
    //             .pipe(gulp.dest('./dev/js/'));
    //     }
    // });
});

gulp.task('main', function() {
    run('tmpl',['filesclone','import','include','browserify']);
});

gulp.task('default', ['cleandev'], function() {
    run('main');
    gulp.watch(['src/**'], ['main']);
});



// dev ↑
//===================================================================================
// dist ↓



gulp.task('move-img',function(){
    return gulp.src('./dev/img/**')
        .pipe(gulp.dest('./dist/img/'));
});
gulp.task('ift-img', ['move-img'], function(){
    return gulp.src('./dev/img/**')
        .pipe(rev())
        .pipe(gulp.dest('./dist/img/'))
        .pipe(rev.manifest({path:'ift-img.json'}))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('move-css',function(){
    return gulp.src('./dev/css/**')
        .pipe(gulp.dest('./dist/css/'));
});
gulp.task('ift-css', ['move-css'], function(){
    return gulp.src('./dev/css/**')
        .pipe(rev())
        .pipe(gulp.dest('./dist/css/'))
        .pipe(rev.manifest({path:'ift-css.json'}))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('move-js',function(){
    gulp.src('./dev/lib/**')
        .pipe(gulp.dest('./dist/lib/'));
    return gulp.src('./dev/js/**')
        .pipe(gulp.dest('./dist/js/'));
});
gulp.task('ift-js', ['move-js'], function(){
    return gulp.src('./dev/js/**')
        .pipe(rev())
        .pipe(gulp.dest('./dist/js/'))
        .pipe(rev.manifest({path:'ift-js.json'}))
        .pipe(gulp.dest('./dist/'));
});
gulp.task('move-html', ['cleandist'], function(){
    return gulp.src('./dev/*.html')
        .pipe(gulp.dest('./dist/'));
});

var G={};
G.ift={};//全部文件列表
G.usedkey={};//真正被使用的
gulp.task('creatdist',['move-html','ift-img', 'ift-css', 'ift-js'] , function(){
    // fs.readFile('./dist/ift-img.json',function(err, data){
    //     if(err){
    //         G.iftimg = {};
    //     }else{ 
    //         //console.log(data.length);
    //         G.iftimg = require('./dist/ift-img.json');
    //     }
    // });
    // fs.readFile('./dist/ift-css.json',function(err, data){
    //     if(err){
    //         G.iftcss = {};
    //     }else{ 
    //         //console.log(data.length);
    //         G.iftcss = require('./dist/ift-css.json');
    //     }
    // });
    // fs.readFile('./dist/ift-js.json',function(err, data){
    //     if(err){
    //         G.iftjs = {};
    //     }else{ 
    //         //console.log(data.length);
    //         G.iftjs = require('./dist/ift-js.json');
    //     }
    // });
    try {
        G.iftimg = require('./dist/ift-img.json');
    } catch(e) {
        G.iftimg = {};
    }
    try {
        G.iftcss = require('./dist/ift-css.json');
    } catch(e) {
        G.iftcss = {};
    }
    try {
        G.iftjs = require('./dist/ift-js.json');
    } catch(e) {
        G.iftjs = {};
    }
    for(var key in G.iftimg){
        G.ift[key] = G.iftimg[key];
    }
    for(var key in G.iftcss){
        G.ift[key] = G.iftcss[key];
    }
    for(var key in G.iftjs){
        G.ift[key] = G.iftjs[key];
    }
    var md5 = function(match,name){
        var key=match.replace(name,'').replace('?___md5','');
        if(G.ift[key]){
            G.usedkey[key]=true;//被使用标记
            return name+G.ift[key];
        }else{
            console.log('ERROR:'+key+' is undefined');
        }
    };
    return gulp.src(['./dist/css/**','./dist/js/**','./dist/*.html'],{base:'dist'})
        .pipe(replace(/css\/[\S]*\\?\_\_\_md5/g,function(match){
            return md5(match,'css/');
        }))
        .pipe(replace(/img\/[\S]*\\?\_\_\_md5/g,function(match){
            return md5(match,'img/');
        }))
        .pipe(replace(/js\/[\S]*\\?\_\_\_md5/g,function(match){
            return md5(match,'js/');
        }))
        .pipe(gulp.dest('./dist/'));
});
//保险起见处理完所有的替换逻辑再进行压缩处理
gulp.task('compresscss',function(){
    return gulp.src('./dist/css/**')
        .pipe(minifycss())
        .pipe(savefile());
});
gulp.task('compressjs',function(){
    return gulp.src('./dist/js/**')
        .pipe(uglify())
        .pipe(savefile());
});
gulp.task('compresshtml',function(){
    return gulp.src('./dist/*.html')
        .pipe(minifyHTML())
        .pipe(savefile());
});
//多余文件清理
gulp.task('filesclear',function(){
    for(var key in G.iftimg){
        if(G.usedkey[key]){//删除已经被md5后的源文件
            del('./dist/img/'+key, function (err) {
                if(err){
                    console.log('ERROR: del() '+err);
                }
            });
        }else{//删除未被使用多余的md5文件
            del('./dist/img/'+G.iftimg[key], function (err) {
                if(err){
                    console.log('ERROR: del() '+err);
                }
            });
        }
    }
    for(var key in G.iftcss){
        if(G.usedkey[key]){//删除已经被md5后的源文件
            del('./dist/css/'+key, function (err) {
                if(err){
                    console.log('ERROR: del() '+err);
                }
            });
        }else{//删除未被使用多余的md5文件
            del('./dist/css/'+G.iftcss[key], function (err) {
                if(err){
                    console.log('ERROR: del() '+err);
                }
            });
        }
    }
    for(var key in G.iftjs){
        if(G.usedkey[key]){//删除已经被md5后的源文件
            del('./dist/js/'+key, function (err) {
                if(err){
                    console.log('ERROR: del() '+err);
                }
            });
        }else{//删除未被使用多余的md5文件
            del('./dist/js/'+G.iftjs[key], function (err) {
                if(err){
                    console.log('ERROR: del() '+err);
                }
            });
        }
    }
    del(['./dist/ift-css.json','./dist/ift-js.json','./dist/ift-img.json'], function (err) {
        if(err){
            console.log('ERROR: del() '+err);
        }
    });
});

gulp.task('dist', ['cleandev','cleandist'], function() {
    run('tmpl',['filesclone','import','include','browserify'],'creatdist',['compresscss','compressjs','compresshtml'],'filesclear');
});