const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const changed = require('gulp-changed');
const babel = require('gulp-babel');
const del = require('del');
const path = require('path');

const paths = {
  js: [
    'config/**/*.js',
    'controllers/**/*.js',
    'businessLogic/**/*.js',
    'dataAccess/**/*.js',
    'models/**/*.js',
    'route/*.js',
    'helper/*.js',
    './index.js',
    '!dist/**',
    '!node_modules/**',
  ],
  nonJs: ['./package.json'],
};

// Clean up dist and coverage directory
gulp.task('clean', () => del(['dist/**', '!dist']));

gulp.task('copy', () => gulp.src(paths.nonJs)
  .pipe(changed('dist'))
  .pipe(gulp.dest('dist')));

// Compile ES6 to ES5 and copy to dist
gulp.task('babel', () => gulp.src(paths.js, { base: '.' })
  .pipe(changed('dist'))
  .pipe(sourcemaps.init())
  .pipe(babel({ presets: ['@babel/env'] }))
  .pipe(sourcemaps.write('.', { includeContent: false, sourceRoot: '../' }))
  .pipe(gulp.dest('dist')));

// gulp.task('run', () => {
//   nodemon({
//     script: path.join('dist', 'index.js'),
//     ext: 'js',
//     ignore: ['node_modules/**/*.js', 'dist/**/*.js'],
//     env: { NODE_ENV: 'development' },
//     tasks: ['babel'],
//   });
// });

// default task: clean dist, compile js files and copy non-js files
gulp.task('default', gulp.series('clean', gulp.parallel('copy', 'babel')));
