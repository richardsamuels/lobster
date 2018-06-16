// @flow strict
import React from 'react';
import ReactList from 'react-list';
import Highlighter from 'react-highlight-words';
import type { Line, ColorMap, Bookmark } from '../../stores';

import './style.css';

type LogLineTextProps = {
  caseSensitive: boolean,
  colorMap: {},
  find: string,
  lineNumber: number,
  lineRefCallback: (?HTMLSpanElement, number, ?boolean) => void,
  port: ?string,
  text: string
}

class LogLineText extends React.PureComponent<LogLineTextProps> {
  lineRef: ?HTMLSpanElement = null

  setRef = (element: ?HTMLSpanElement) => {
    this.lineRef = element;
  };

  componentDidMount() {
    if (this.lineRef) {
      this.props.lineRefCallback(this.lineRef, this.props.lineNumber);
    }
  }

  componentWillUnmount() {
    if (this.lineRef) {
      this.props.lineRefCallback(this.lineRef, this.props.lineNumber, true);
    }
  }

  render() {
    const color = this.props.port != null ? this.props.colorMap[this.props.port] : '';
    const style = {color: color};
    const highlightStyle = {color: color, 'backgroundImage': 'inherit', 'backgroundColor': 'pink'};
    return (
      <span ref={this.setRef}>
        <Highlighter
          highlightClassName={'findResult' + this.props.lineNumber}
          caseSensitive={this.props.caseSensitive}
          unhighlightStyle={style}
          highlightStyle={highlightStyle}
          textToHighlight={this.props.text}
          searchWords={[this.props.find]}
        />
      </span>
    );
  }
}

type LineNumberProps = {
  toggleBookmark: (number) => void,
  lineNumber: number,
};

class LineNumber extends React.PureComponent<LineNumberProps> {
  handleDoubleClick = () => {
    this.props.toggleBookmark(this.props.lineNumber);
  };

  render() {
    const style = {width: '60px', display: 'inline-block'};
    return <span data-pseudo-content={this.props.lineNumber} className="padded-text" style={style} onDoubleClick={this.handleDoubleClick}></span>;
  }
}

type LogOptionsProps = {
  gitRef: ?string
}

class LogOptions extends React.PureComponent<LogOptionsProps> {
  handleClick = () => {
    if (this.props.gitRef != null) {
      window.open(this.props.gitRef);
    }
  }

  render() {
    const style = {width: '30px', display: 'inline-block'};
    if (this.props.gitRef != null) {
      return <span style={style} data-pseudo-content="&nbsp;&#128279;&nbsp;" onClick={this.handleClick}></span>;
    }
    return <span style={style}></span>;
  }
}

type FullLogLineProps = {
    bookmarked: boolean,
    caseSensitive: boolean,
    colorMap: {},
    find: string,
    found: boolean,
    line: Line,
    lineRefCallback: (element: ?HTMLSpanElement, line: number, isUnmount: ?boolean) => void,
    toggleBookmark: (number) => void,
    wrap: boolean
}

class FullLogLine extends React.PureComponent<FullLogLineProps> {
  render() {
    let className = 'monospace hover-highlight inline';
    if (this.props.bookmarked) {
      className += ' bookmark-line';
    }
    if (!this.props.wrap) {
      className += ' no-wrap';
    } else {
      className += ' wrap';
    }
    if (this.props.found) {
      className += ' highlighted';
    }

    return (
      <div className={className}>
        <LineNumber lineNumber={this.props.line.lineNumber} toggleBookmark={this.props.toggleBookmark} />
        <LogOptions gitRef={this.props.line.gitRef} />
        <LogLineText lineRefCallback={this.props.lineRefCallback} text={this.props.line.text} lineNumber={this.props.line.lineNumber} port={this.props.line.port} colorMap={this.props.colorMap} find={this.props.find} caseSensitive={this.props.caseSensitive} />
      </div>
    );
  }
}

type LogViewProps = {
  findLine: number,
  bookmarks: Bookmark[],
  wrap: boolean,
  toggleBookmark: (number) => void,
  colorMap: ColorMap,
  find: string,
  caseSensitive: boolean,
  scrollLine: number,
  lines: Line[],
  filter: RegExp[],
  inverseFilter: RegExp[],
  shouldPrintLine: (Bookmark[], Line, RegExp[], RegExp[]) => boolean,
  findBookmark: (Bookmark[], number) => number
}

type LogViewState = {
  processed: string,
  lineMap: Map<number, ?HTMLSpanElement>
}

class LogView extends React.Component<LogViewProps, LogViewState> {
  logListRef: ?ReactList = null
  indexMap: { [number]: number } = {}
  filteredLines: Line[]

  constructor(props: LogViewProps) {
    super(props);
    this.state = {
      processed: '',
      lineMap: new Map()
    };
  }

  setLogListRef = (element: ?ReactList) => {
    this.logListRef = element;
  };

  lineRefCallback = (element: ?HTMLSpanElement, line: number, isUnmount: ?boolean = undefined) => {
    if (isUnmount === true) {
      this.state.lineMap.delete(line);
    } else {
      this.state.lineMap.set(line, element);
    }
  };

  genList = (index: number, key: number) => {
    return (
      <FullLogLine
        lineRefCallback={this.lineRefCallback}
        key={key}
        found={this.filteredLines[index].lineNumber === this.props.findLine}
        bookmarked={this.props.findBookmark(this.props.bookmarks, this.filteredLines[index].lineNumber) !== -1}
        wrap={this.props.wrap}
        line={this.filteredLines[index]}
        toggleBookmark={this.props.toggleBookmark}
        colorMap={this.props.colorMap}
        find={this.props.find}
        caseSensitive={this.props.caseSensitive}
      />
    );
  }

  scrollToLine(lineNumber: number) {
    let scrollIndex = this.indexMap[lineNumber] - 20;
    if (scrollIndex < 0) {
      scrollIndex = 0;
    }
    if (this.logListRef != null) {
      this.logListRef.scrollTo(scrollIndex);
    }

    window.scrollBy(0, -45);
  }

  shouldComponentUpdate(nextProps: LogViewProps) {
    if (nextProps.scrollLine !== null && nextProps.scrollLine >= 0) {
      this.scrollToLine(nextProps.scrollLine);
    }

    if (nextProps.lines !== this.props.lines) {
      return true;
    }
    if (nextProps.bookmarks !== this.props.bookmarks) {
      return true;
    }
    if (nextProps.filter !== this.props.filter) {
      return true;
    }
    if (nextProps.inverseFilter !== this.props.inverseFilter) {
      return true;
    }
    if (nextProps.find !== this.props.find) {
      return true;
    }
    if (nextProps.findLine !== this.props.findLine) {
      return true;
    }
    if (nextProps.wrap !== this.props.wrap) {
      return true;
    }
    if (nextProps.caseSensitive !== this.props.caseSensitive) {
      return true;
    }

    return false;
  }

  scrollFindIntoView() {
    if (this.props.findLine < 0 || !(this.props.findLine in this.state.lineMap)) {
      return;
    }
    const ele = this.state.lineMap.get(this.props.findLine);
    const findElements = ele != null ? ele.getElementsByClassName('findResult' + this.props.findLine) : [];
    if (findElements.length > 0) {
      const elem = findElements[0];
      const position = elem.getBoundingClientRect();
      const windowWidth = window.innerWidth;

      let scrollX = window.scrollX;
      const scrollY = window.scrollY - 45; // Account for header

      if (position.right > windowWidth) {
        // Scroll so the leftmost part of the component is 2/3 of the way into the screen.
        scrollX = position.left - windowWidth / 3;
      }
      window.scrollTo(scrollX, scrollY);
    }
  }

  componentDidUpdate(prevProps: LogViewProps, _prevState: LogViewState) {
    if (this.props.scrollLine !== null && this.props.scrollLine >= 0 && this.props.scrollLine !== prevProps.scrollLine) {
      this.scrollToLine(this.props.scrollLine);
    }

    // If the find index changed, scroll to the right if necessary.
    if (this.props.findLine !== prevProps.findLine || this.props.find !== prevProps.find) {
      this.scrollFindIntoView();
    }
  }

  render() {
    let j = 0;
    this.indexMap = {};

    this.filteredLines = this.props.lines.filter((line, i) => {
      if (!this.props.shouldPrintLine(this.props.bookmarks, line, this.props.filter, this.props.inverseFilter)) {
        return false;
      }
      this.indexMap[i] = j++;
      return true;
    });
    if (this.filteredLines.length !== 0) {
      return (
        <div>
          <ReactList
            ref={this.setLogListRef}
            itemRenderer={this.genList}
            length={this.filteredLines.length}
            initialIndex={this.props.scrollLine}
            type={this.props.wrap ? 'variable' : 'uniform'}
            useStaticSize={true}
          />
        </div>
      );
    }
    return (<div></div>);
  }
}
export default LogView;
