import * as api from './evergreen';

describe('evergreen', () => {
  test('taskLogURL', () => {
    expect(api.taskLogURL('task0', 123, 'all')).toBe('http://evergreen.invalid/task_log_raw/task0/123?type=ALL');
    expect(api.taskLogRawURL('task0', 123, 'all')).toBe('http://evergreen.invalid/task_log_raw/task0/123?type=ALL&text=true');
  });

  test('testLogURL', () => {
    expect(api.testLogURL('test0')).toBe('http://evergreen.invalid/test_log/test0');
    expect(api.testLogRawURL('test0')).toBe('http://evergreen.invalid/test_log/test0?raw=1');
  });

  test('taskURL', () => {
    expect(api.taskURL('task0')).toBe('http://evergreen.invalid/task/task0');
    expect(api.taskURL('task0', 1)).toBe('http://evergreen.invalid/task/task0/1');
  });

  test('fetchEvergreen-task', (done) => {
    window.fetch = (req) => {
      expect(req.url).toBe(api.taskLogRawURL('task0', 123, 'all'));
      done();
    };

    api.fetchEvergreen({
      type: 'evergreen-task',
      id: 'task0',
      execution: 123,
      log: 'all'
    });
  });

  test('fetchEvergreen-test', (done) => {
    window.fetch = (req) => {
      expect(req.url).toBe(api.testLogRawURL('task0'));
      done();
    };

    api.fetchEvergreen({
      type: 'evergreen-test',
      id: 'task0'
    });
  });
});
