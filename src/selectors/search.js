// @flow strict

import { createSelector } from 'reselect';
import type { Line, Bookmark, Filter, Settings } from '../models';

function mergeActiveFilters(filterList: Filter[], caseSensitive: boolean): RegExp[] {
  return filterList
    .filter((elem) => elem.on && !elem.inverse)
    .map((elem) => caseSensitive ? new RegExp(elem.text) : new RegExp(elem.text, 'i'));
}

function mergeActiveInverseFilters(filterList: Filter[], caseSensitive: boolean): RegExp[] {
  return filterList
    .filter((elem) => elem.on && elem.inverse)
    .map((elem) => caseSensitive ? new RegExp(elem.text) : new RegExp(elem.text, 'i'));
}

function findBookmark(bookmarkList: Bookmark[], lineNum: number): number {
  return bookmarkList.findIndex(function(bookmark) {
    return bookmark.lineNumber === lineNum;
  });
}

function matchFilters(filter: RegExp[], string: string, isIntersection: boolean): boolean {
  if (isIntersection) {
    return filter.every(regex => string.match(regex));
  }
  return filter.some(regex => string.match(regex));
}

function shouldPrintLine(bookmarks: Bookmark[], line: Line, filterIntersection: boolean, filter: RegExp[], inverseFilter: RegExp[]): boolean {
  if (findBookmark(bookmarks, line.lineNumber) !== -1) {
    return true;
  }

  if ((!filter && !inverseFilter) || (filter.length === 0 && inverseFilter.length === 0)) {
    return true;
  } else if (!filter || filter.length === 0) {
    if (matchFilters(inverseFilter, line.text, filterIntersection)) {
      return false;
    }
    return true;
  } else if (!inverseFilter || inverseFilter.length === 0) {
    if (matchFilters(filter, line.text, filterIntersection)) {
      return true;
    }
    return false;
  }
  // If there are both types of filters, it has to match the filter and not match
  // the inverseFilter.
  if (filterIntersection) {
    if (matchFilters(filter, line.text, filterIntersection) &&
          !matchFilters(inverseFilter, line.text, filterIntersection)) {
      return true;
    }
  } else if (matchFilters(filter, line.text, filterIntersection) ||
        !matchFilters(inverseFilter, line.text, filterIntersection)) {
    return true;
  }
  return false;
}

function makeRegexp(regexp: string, caseSensitive: boolean) {
  if (!regexp) {
    return new RegExp('');
  }

  if (!caseSensitive) {
    return new RegExp(regexp, 'i');
  }
  return new RegExp(regexp);
}


const getSearchTerm = (state) => state.logviewer.find.searchTerm;
const getLogLines = (state) => state.log.lines;
const getFilters = (state) => state.logviewer.filters;
const getBookmarks = (state) => state.logviewer.bookmarks;
const getSettings = (state) => state.logviewer.settings;

export default createSelector(
  getSearchTerm,
  getLogLines,
  getFilters,
  getBookmarks,
  getSettings,
  function(searchTerm: ?string, lines: Line[], filters: Filter[], bookmarks: Bookmark[], settings: Settings) {
    if (searchTerm == null) {
      return lines;
    }

    const findRegexpFull = makeRegexp(searchTerm, settings.caseSensitive);
    const filter = mergeActiveFilters(filters, settings.caseSensitive);
    const inverseFilter = mergeActiveInverseFilters(filters, settings.caseSensitive);

    return lines.filter((line) => {
      if (findRegexpFull.test(line.text) && shouldPrintLine(bookmarks, line, settings.filterIntersection, filter, inverseFilter)) {
        return true;
      }
      return false;
    });
  }
);
