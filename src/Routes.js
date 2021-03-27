import React from "react";
import {  Route, Switch ,HashRouter} from "react-router-dom";

import ArtHome from './ArtHome';
import PublishArt from './PublishArt';
import MyWallet from './MyWallet';
import ArtDetail from './ArtDetail';
import ArtExclusive from './ArtExclusive';
import ArtSold from './ArtSold';

class Routes extends React.Component {
  render() {
    return (
      <HashRouter>
      <Switch>
        <Route exact path="/" component={ArtHome} />
        <Route exact path="/home" component={ArtHome} />
        <Route exact path="/exclusive" component={ArtExclusive} />
        <Route exact path="/sold" component={ArtSold} />

        <Route exact path="/publishArt" component={PublishArt} />
        <Route exact path="/myWallet" component={MyWallet} />
        <Route  path="/art/:selectedId" component={ArtDetail} />
      <Route
        render={function() {
          return <h1>Not Found</h1>;
        }}
      />
    </Switch>
    </HashRouter>
    );
  }
}

export default Routes;
