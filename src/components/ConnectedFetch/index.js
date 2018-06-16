// @flow strict
import React from 'react';
// $FlowFixMe
import { StoreConnector } from 'hadron-react-components';
import Fetch from '../Fetch';
import type { Props } from '../Fetch';
import store from '../../stores';
import actions from '../../actions';

class ConnectedFetch extends React.PureComponent<Props> {
  static displayName = 'ConnectedFetch';
  render() {
    return (
      <StoreConnector store={store}>
        <Fetch actions={actions} {...this.props} />
      </StoreConnector>
    );
  }
}

export default ConnectedFetch;
export { ConnectedFetch };
