const { writeFileSync, lstatSync, readdirSync } = require('fs');
const { join } = require('path');

const scanDirs = ['server', 'src'];

const isFile = f => lstatSync(f).isFile();
const isDirectory = source => lstatSync(source).isDirectory();

// given a relative directory, return an array containing all directories
// located under that directory, including the directory itself
const getDirectories = source =>
  readdirSync(source)
    .map(val => join(source, val))
    .filter(isDirectory).reduce(reducer, []); // eslint-disable-line no-use-before-define
const reducer = (acc, val) => acc.concat(getDirectories(val)).concat([val]);

const endsWithAnyOf = (ends, testVal) =>
  ends.reduce((acc, val) => acc || testVal.endsWith(val), false);

const isFileWithEnding = (endings, file) =>
  isFile(file) && endsWithAnyOf(endings, file);

const hasJS = dir =>
  readdirSync(dir).reduce((acc, val) => acc || isFileWithEnding(['.js', '.jsx'], join(dir, val)), false);

const hasTests = dir =>
  readdirSync(dir).reduce((acc, val) => acc || isFileWithEnding(['.spec.js', '.test.js'], join(dir, val)), false);

function makeTask(prefix, cmd, match) {
  return function(dir) {
    return {
      'name': prefix + '-' + dir.replace(/\//g, '-').toLowerCase(),
      'commands': [
        {
          'func': 'preamble'
        },
        {
          'func': 'npm',
          'vars': {
            'cmd': 'run-script ' + cmd + ' -- ' + dir + '/' + match
          }
        }
      ]
    };
  };
}


const dirs = scanDirs.reduce((acc, val) => acc.concat(getDirectories(val)), []).concat(scanDirs);
const testDirs = dirs.filter(hasTests);
const jsDirs = dirs.filter(hasJS);
console.log('Will run tests in: ', testDirs);
console.log('Will run lints in: ', jsDirs);

const lintTasks = jsDirs.map(makeTask('lint', 'eslint', '*.{js,jsx}'))
  .concat([makeTask('lint', 'eslint', '*.{js,jsx}')('.')]);
const testTasks = testDirs.map(makeTask('test', 'test-ci', '*.{spec,test}.js'));
var gt = {
  'buildvariants': [
    {
      'name': 'ubuntu1604',
      'tasks': testTasks.map(task => task.name).concat(['lint-group']),
      'display_tasks': [
        {
          'name': 'lint',
          'execution_tasks': lintTasks.map(task => task.name)
        }
      ]
    }
  ],
  'task_groups': [
    {
      'name': 'lint-group',
      'max_hosts': 1,
      'tasks': lintTasks.map(task => task.name),
      'setup_group': [
        {
          'func': 'preamble'
        }
      ],
      'teardown_task': [
        {
          'func': 'results-attach'
        },
        {
          'func': 'results-clean'
        }
      ]
    }
  ],
  'tasks': testTasks.concat(lintTasks)
};

console.log('Generating tasks with the following payload: ', JSON.stringify(gt, null, 2));

const outFile = join(__dirname, '.tasks.json');
console.log('Writing to: ', outFile);
writeFileSync(outFile, JSON.stringify(gt));
