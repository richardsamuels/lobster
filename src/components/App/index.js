// @flow strict
import React from 'react';
// $FlowFixMe
import { Switch, Route } from 'react-router-dom';
import './style.css';
import About from '../About/index.js';
import ConnectedFetch from '../ConnectedFetch';
import NotFound from '../NotFound';
import { Nav, NavItem } from 'react-bootstrap';

const Main = () => (
  <main>
    <Switch>
      <Route exact path="/lobster/about" component={About} />
      <Route path="/lobster/build/:build/test/:test" component={ConnectedFetch} />
      <Route path="/lobster/build/:build/all" component={ConnectedFetch} />
      <Route exact path="/lobster/" component={ConnectedFetch} />
      <Route path="*" component={NotFound} />
    </Switch>
  </main>
);

// The Header creates links that can be used to navigate
// between routes.
const Header = () => (
  <header className="head">
    <Nav bsStyle="pills">
      <NavItem eventKey={1} href="/lobster/about">About</NavItem>
      <NavItem eventKey={2} href="/lobster">Viewer</NavItem>
    </Nav>
  </header>
);

/*
  <Grid>
    <Row className="show-grid">
        <Col md={12}><Header /></Col>
    </Row>
  </Grid>
 */
const App = () => (
  <div>
    <Header />
    <Main />
  </div>
);
export default App;
