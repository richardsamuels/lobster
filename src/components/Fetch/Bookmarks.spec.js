import React from 'react';
import Enzyme from 'enzyme';
import assert from 'assert';
import { Bookmarks, BookmarkContainer } from './Bookmarks';

test('Bookmarks', function() {
  let scrollTo = -1;

  const scroll = (num) => {
    scrollTo = num;
  };
  const data = [
    {lineNumber: 0},
    {lineNumber: 5},
    {lineNumber: 10},
    {lineNumber: 20}
  ];

  const wrapper = Enzyme.mount(<Bookmarks bookmarks={data} setScroll={scroll} />);
  data.map(function(bkmark, index) {
    const bookmarkWrapper = wrapper.find('div').find('div').find('div').children().at(index + 1);
    bookmarkWrapper.simulate('click', {});
    assert.equal(scrollTo, bkmark.lineNumber);
  });

  assert.ok(wrapper.containsAllMatchingElements([
    <BookmarkContainer lineNumber={0} />,
    <BookmarkContainer lineNumber={5} />,
    <BookmarkContainer lineNumber={10} />,
    <BookmarkContainer lineNumber={20} />
  ]));
  assert.ok(!wrapper.containsAllMatchingElements([
    <BookmarkContainer lineNumber={1} />,
    <BookmarkContainer lineNumber={6} />
  ]));
});

test('bookmark-container', function() {
  let scrollTo = -1;

  const scroll = (event) => {
    if (event.currentTarget.innerHTML) {
      scrollTo = parseInt(event.target.innerHTML, 10);
    }
  };

  const wrapper = Enzyme.mount(<BookmarkContainer lineNumber={5} scrollFunc={scroll} />);
  wrapper.simulate('click', {});
  assert.equal(scrollTo, 5);
});
