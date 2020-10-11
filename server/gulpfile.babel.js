const path = require('path');
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const changed = require('gulp-changed');
const babel = require('gulp-babel');
const nodemon = require('gulp-nodemon');
const del = require('del');

const paths = {
  js: [
    'src/**/*.js',
    '!dist/**',
    '!node_modules/**',
  ],
  locales: ['locales/**'],
  package: ['./package.json'],
};

// Clean up dist and coverage directory
gulp.task('clean', () => del(['dist/**', '!dist']));

gulp.task('locales', () => gulp.src(paths.locales)
  .pipe(gulp.dest('dist/locales')));

gulp.task('package', () => gulp.src(paths.package)
  .pipe(gulp.dest('dist')));

gulp.task('copy', gulp.parallel('locales', 'package'));

// Compile ES6 to ES5 and copy to dist
gulp.task('babel', () => gulp.src(paths.js, { base: '.' })
  .pipe(changed('dist'))
  .pipe(sourcemaps.init())
  .pipe(babel({
    presets: [
      [
        '@babel/preset-env', {
          targets: {
            node: 'current',
          },
        },
      ],
    ],
  }))
  .pipe(sourcemaps.write('.', { includeContent: false, sourceRoot: '../' }))
  .pipe(gulp.dest('dist')));

gulp.task('build', gulp.series('clean', gulp.parallel('copy', 'babel')));

gulp.task('nodemon', (done) => nodemon({
  script: path.join('dist', 'index.js'),
  ext: 'js',
  ignore: ['dist', '**/*___jb_tmp___'],
  tasks: ['build'],
  done,
}));

gulp.task('run', gulp.series('build', 'nodemon'));

// default task: clean dist, compile js files and copy non-js files
gulp.task('default', gulp.series('build'));
