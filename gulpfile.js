//
// -----------------------------------------------------------------------------
// Monogram / Gulpfile
// Copyright (C) 2017 Monogram (http://monogram.design)
// -----------------------------------------------------------------------------
//

// SETUP
// -----------------------------------------------------------------------------

var gulp = require('gulp');

// Load all plugins in package.json 'devDependencies' into the variable $
// -----
// This means we don't have to include/require new Gulp plugins here.
// They will automatically become available here once installed via npm.
// Refer to https://www.npmjs.com/package/gulp-load-plugins for more info.

const $ = require('gulp-load-plugins')({
    pattern: ['*'],
    scope: ['devDependencies']
});

// This loads all the variables from package.json and makes them available here
// with a prefix of "pkg". Usage example: pkg.author would return "Monogram"

const pkg = require('./package.json');

// Uses the child_process (cp) plugin to spawn "jekyll". Keep in mind that this
// only runs on Mac. Running this on both Windows and Mac will require the
// following check to be used:
//
// var jekyll = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
//

var bs = $.browserSync.create();

gulp.task('jekyll-build', function(done) {
    return $.child_process.spawn('jekyll', ['build'], {
            stdio: 'inherit'
        })
        .on('close', done);
});


// HTML
// -----------------------------------------------------------------------------

gulp.task('html', ['jekyll-build'], function() {

	// HTML linting, cleaning, and code styling

    gulp.src('_deploy/**/*.html')
		.pipe($.htmlhint('htmlhintrc'))
		.pipe($.htmlhint.reporter())
		.pipe($.minifyInline())
        .pipe($.htmlmin({
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

gulp.task('reload', ['html'], function() {
    bs.reload();
});


// STYLES
// -----------------------------------------------------------------------------

// Compile files from style directories into both _deploy (for live injecting)
// and _source (for future jekyll builds)

gulp.task('styles', function() {
    return gulp.src('_source/assets/styles/source.scss')
		.pipe($.sass({includePaths: ['_source/assets/styles/_framework/']}).on('error', $.sass.logError))
		.pipe($.rename('assets/styles/' + pkg.filename + '.css'))
		.pipe(gulp.dest('_source/'))
		.pipe($.cssnano())
		.pipe(gulp.dest('_deploy/'))
		.pipe(bs.reload({
            stream: true
        }));
});


// SCRIPTS
// -----------------------------------------------------------------------------

gulp.task('scripts', ['jekyll-build'], function() {

	gulp.src('_deploy/assets/scripts/*.js')
		.pipe($.uglify({
			preserveComments: 'license',
		}))
		.pipe(gulp.dest('_deploy/assets/scripts/'));
});


// WATCH
// -----------------------------------------------------------------------------

gulp.task('watch', function() {

	// watch for CSS changes and trigger `styles`
    gulp.watch([
		'_source/assets/styles/**/**.*'

	], ['styles']);

	// watch JavaScript
	gulp.watch('_scripts/assets/scripts/**', ['scripts']);

	// watch for any non-CSS changes and trigger `reload`
    gulp.watch([
		'_source/**',
		'!**/**.scss',
		'!**/**.css'
	], ['reload']);

});


// SERVE & RUN
// -----------------------------------------------------------------------------

// Used to serve demo without rebuilding: `gulp serve`

gulp.task('serve', function() {
    bs.init({
        server: {
            baseDir: '_deploy'
        },
		port: 3020,
        notify: false
    });
});

// Used to build site without serving: `gulp build`

gulp.task('build', ['html', 'scripts', 'styles']);

// Default task
// running `gulp` will compile the PostCSS, compile the jekyll site,
// launch BrowserSync & watch files

gulp.task('default', ['styles', 'scripts', 'reload', 'serve', 'watch']);