// Monogram / Gulpfile
// Copyright (C) 2017 Monogram (monogram.design)
// -------------------------------------------------

// Gulp

var gulp 		 = require('gulp'),
	browserSync  = require('browser-sync'),
    cp 			 = require('child_process'),
    htmlhint 	 = require('gulp-htmlhint'),
    htmlmin 	 = require('gulp-htmlmin'),
	rename 		 = require("gulp-rename"),
	// imageResize  = require('gulp-image-resize'),
	// imagemin	 = require('gulp-imagemin'),
	uglify 		 = require('gulp-uglify'),
	inlineMinify = require('gulp-minify-inline');

// PostCSS

var postcss		 = require('gulp-postcss'),
	cssnano 	 = require('cssnano'),
	autoprefixer = require('autoprefixer'),
	nested	 	 = require('postcss-nested'),
	extend	 	 = require('postcss-extend'),
	atImport	 = require('postcss-import'),
	comment  	 = require('postcss-inline-comment'),
	colors  	 = require('postcss-color-function');

// Jekyll

var jekyll 		 = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';

// Build the Jekyll Site

gulp.task('jekyll-build', function(done) {
    browserSync.notify('<span style="color: grey">Running:</span> $ jekyll build');
    return cp.spawn(jekyll, ['build'], {
            stdio: 'inherit'
        })
        .on('close', done);
});


// HTML linting, cleaning, and code styling

gulp.task('html', ['jekyll-build'], function() {

    gulp.src('_deploy/**/*.html')
		.pipe(htmlhint('htmlhintrc'))
		.pipe(htmlhint.reporter())
		.pipe(inlineMinify())
        .pipe(htmlmin({
            collapseWhitespace: true,
			minifyURLs: true,
			removeComments: true,
			quoteCharacter: "",
			removeScriptTypeAttributes: true,
			removeStyleLinkTypeAttributes: true
        }))
        .pipe(gulp.dest('_deploy/'));

});

// Rebuild Jekyll & do page reload

gulp.task('reload', ['html', 'scripts'], function() {
    browserSync.reload();
});

// Compile files from _scss into both _deploy (for live injecting) and _source (for future jekyll builds)

gulp.task('styles', function() {
	var plugins = [
		comment(),
		atImport(),
		colors(),
		nested(),
		extend(),
		autoprefixer({browsers: ['last 2 versions']}),
		cssnano()
	];
    return gulp.src('_source/assets/css/_source.css')
		.pipe(postcss(plugins))
		.pipe(rename("assets/css/main.css"))
		.pipe(gulp.dest('_source/'))
        .pipe(browserSync.reload({
            stream: true
        }))
        .pipe(gulp.dest('_deploy/'));

});

// Images

// gulp.task('thumbnails', function() {
//
//     gulp.src([
// 		'_source/assets/img/[^_]**/[^_]*.*',
// 		'!_source/assets/img/thumbs/**'
// 	])
// 	.pipe(imageResize({
// 		width : 300,
// 		upscale : false
// 	}))
// 	.pipe(gulp.dest('_source/assets/img/thumbs/'));
//
// });
//
// gulp.task('images', ['thumbnails'], function() {
//
// 	gulp.src('_source/assets/img/[^_]**')
// 		.pipe(imagemin())
// 		.pipe(gulp.dest('_source/assets/img/'));
//
// });

// Scripts

gulp.task('scripts', ['jekyll-build'], function() {

	gulp.src('_deploy/assets/js/ibi.js')
		.pipe(uglify({
			preserveComments: 'license',
		}))
		.pipe(gulp.dest('_deploy/assets/js/'));

});

// Wait for jekyll-build, then launch the server

gulp.task('build-serve', ['reload'], function() {
    browserSync({
        server: {
            baseDir: '_deploy'
        },
		port: 3020,
        notify: false
    });
});

// Watch

gulp.task('watch', function() {
	// watch for CSS changes and trigger 'styles'
    gulp.watch('_source/assets/css/**', ['styles']);

	// watch JS
	gulp.watch('_scripts/assets/js/**', ['scripts']);

	// watch for image changes and trigger 'images'
	// gulp.watch('_source/assets/img/[^_]**/[^_]**', ['thumbnails', 'images']);

	// watch for any non-CSS changes and trigger 'reload'
    gulp.watch([
		'_source/**',
		'!**/**.scss',
		'!**/**.css',
	], ['reload']);
});


// Use for demo: `gulp serve`

gulp.task('serve', function() {
    browserSync({
        server: {
            baseDir: '_deploy'
        },
        notify: false
    });
});

// Default task, running `gulp` will compile the sass,
// compile the jekyll site, launch BrowserSync & watch files.

gulp.task('default', ['build-serve', 'watch']);

