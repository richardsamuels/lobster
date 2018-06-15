// @flow strict
import React from 'react';

export type Bookmark = {
  lineNumber: number,
}

type Props = {
  bookmarks: Bookmark[],
  setScroll: (number) => void
}

export class Bookmarks extends React.PureComponent<Props> {
  scroll = (event: SyntheticMouseEvent<HTMLDivElement>) => {
    if (event.currentTarget.innerHTML != null) {
      this.props.setScroll(parseInt(event.currentTarget.innerHTML, 10));
    }
  }

  render() {
    return (
      <div className="bookmarks-bar monospace">
        <div>
          {this.props.bookmarks.map((bookmark, key) => {
            return (<BookmarkContainer key={key} lineNumber={bookmark.lineNumber} scrollFunc={this.scroll} />);
          })}
        </div>
      </div>
    );
  }
}

type BookmarkProps = {
  scrollFunc: (event: SyntheticMouseEvent<HTMLDivElement>) => void,
  lineNumber: number
}

export const BookmarkContainer = (props: BookmarkProps) => {
  return (
    <div onClick={props.scrollFunc} key={props.lineNumber}>
      {props.lineNumber}
    </div>
  );
};
