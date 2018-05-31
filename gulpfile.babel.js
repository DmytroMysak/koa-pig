import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import del from 'del';
import babel from 'gulp-babel';
import nodemon from 'gulp-nodemon';
import path from 'path';

const paths = {
  js: ['config/**/*.js', 'route/*.js', 'helper/*.js', './index.js', '!dist/**', '!node_modules/**'],
};

// Clean up dist and coverage directory
gulp.task('clean', () => del(['dist/**', '!dist']));

// Compile ES6 to ES5 and copy to dist
gulp.task('babel', () =>
  gulp.src(paths.js, { base: '.' })
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: ['env', 'stage-3'] }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist')));

gulp.task('run', () => {
  nodemon({
    script: path.join('dist', 'index.js'),
    ext: 'js',
    ignore: ['node_modules/**/*.js', 'dist/**/*.js'],
    env: { NODE_ENV: 'development' },
    tasks: ['babel'],
  });
});

// default task: clean dist, compile js files and copy non-js files, run server
gulp.task('default', gulp.series(['clean', 'babel', 'run']));
