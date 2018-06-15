// @flow strict
import { Button } from 'react-bootstrap';
import React from 'react';


export type Filter = {
  text: string,
  on: bool,
  inverse: bool
}

type Props = {
  filters: Filter[],
  removeFilter: (string) => void,
  toggleFilter: (string) => void,
  toggleFilterInverse: (string) => void
}

export const Filters = (props: Props) => {
  return (
    <div className="filterBox">
      <div className="filter-box">{props.filters.map(function(filter, key) {
        return (
          <FilterContainer
            key={key}
            filter={filter}
            removeFilter={props.removeFilter}
            toggleFilter={props.toggleFilter}
            toggleFilterInverse={props.toggleFilterInverse}
          />
        );
      })}
      </div>
    </div>
  );
};

type FilterProps = {
  filter: Filter,
  removeFilter: (string) => void,
  toggleFilter: (string) => void,
  toggleFilterInverse: (string) => void
}

export class FilterContainer extends React.PureComponent<FilterProps> {
  removeFilter = () => this.props.removeFilter(this.props.filter.text);
  toggleFilter = () => this.props.toggleFilter(this.props.filter.text);
  toggleFilterInverse = () => this.props.toggleFilterInverse(this.props.filter.text);

  render() {
    return (
      <div className="filter">
        <Button className="filter-button" onClick={this.removeFilter} bsStyle="danger" bsSize="xsmall">{'\u2715'}</Button>
        <Button className="filter-button" onClick={this.toggleFilter} bsStyle="warning" bsSize="xsmall">{this.props.filter.on ? '||' : '\u25B6'}</Button>
        <Button className="filter-button-big" onClick={this.toggleFilterInverse} bsStyle="success" bsSize="xsmall">{this.props.filter.inverse ? 'out' : 'in'}</Button>
        <span className="filter-text">{this.props.filter.text}</span>
      </div>
    );
  }
}
