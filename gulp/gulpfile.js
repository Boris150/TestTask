const { src, dest, watch, parallel, series } = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const svgSprite = require('gulp-svg-sprite');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const include = require('gulp-include');


function pages() {
	return src('app/pages/*.html')
		.pipe(include({
			includePaths: 'app/components'
		}))
		.pipe(dest('app'))
		.pipe(browserSync.stream())
}

//преобразование шрифтов
function fonts() {
	return src('app/fonts/src/*.*')
		.pipe(fonter({
			formats: ['woff', 'ttf']
		}))
		.pipe(src('app/fonts/*.ttf'))
		.pipe(ttf2woff2())
		.pipe(dest('app/fonts'))
}

//преобразование картинок
function images() {
	return src(['app/images/src/*.*', '!app/images/src/*.svg', '!app/images/src/*.gif'], { encoding: false })
		.pipe(newer('app/images/dist'))
		.pipe(avif({ quality: 50 }))
		.pipe(src('app/images/src/*.*'))
		.pipe(newer('app/images/dist'))
		.pipe(webp())
		.pipe(src(['app/images/src/*.*', '!app/images/src/*.gif'], { encoding: false }))
		.pipe(newer('app/images/dist'))
		.pipe(imagemin(
			[
				imagemin.gifsicle({ interlaced: true }),
				imagemin.mozjpeg({ quality: 55, progressive: true }),
				imagemin.optipng({ optimizationLevel: 5 }),
				imagemin.svgo({
					plugins: [
						{ removeViewBox: true },
						{ cleanupIDs: false }
					]
				})
			]
		))
		.pipe(dest('app/images/dist'))
}

//преобразование svg
function sprite() {
	return src('app/images/dist/*.svg')
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: '../sprite.svg',
					example: true
				}
			}
		}))
		.pipe(dest('app/images/dist'))
}

//преобразование файла js
function scripts() {
	return src([
		'app/js/*.js',
		'app/js/*.min.js',
		'!app/js/main.min.js'
	])
		.pipe(concat('main.min.js'))
		.pipe(uglify())
		.pipe(dest('app/js'))
		.pipe(browserSync.stream())
};

//преобразование файла стилей
function styles() {
	return src('app/scss/style.scss')
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 10 version'],
			grid: true
		}))
		.pipe(concat('style.min.css'))
		.pipe(scss({ outputStyle: 'compressed' }))
		.pipe(dest('app/css'))
		.pipe(browserSync.stream())
};

//очистка
function cleanDist() {
	return src('dist')
		.pipe(clean())
}

//сборка итогового каталога
function building() {
	return src([
		'app/css/*.min.css',
		'app/css/*.css',
		'!app/css/style.css',
		'app/images/dist/*.*',
		'app/images/*.gif',
		//'!app/images/dist/*.svg',
		//'app/images/dist/sprite.svg',
		'app/fonts/*.*',
		'app/js/main.min.js',
		'app/*.html'
	], { base: 'app' })
		.pipe(dest('dist'))
}

//следим и наблюдаем
function watching() {
	browserSync.init({
		server: {
			baseDir: 'app/'
		}
	});
	watch(['app/scss/**/*.scss'], styles);
	watch(['app/images/src/'], images);
	watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
	watch(['app/components/*', 'app/pages/*'], pages);
	watch(['app/*.html']).on('change', browserSync.reload);
};

exports.styles = styles;
exports.images = images;
exports.fonts = fonts;
exports.pages = pages;
exports.building = building;
exports.sprite = sprite;
exports.scripts = scripts;
exports.watching = watching;

//последовательное выполнение
exports.build = series(cleanDist, building);
//запускаем одновременно несколько функций
exports.default = parallel(styles, images, scripts, pages, watching);