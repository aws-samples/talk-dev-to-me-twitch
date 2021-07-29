import React from "react";
import {Switch, Route, useRouteMatch} from "react-router-dom";
import Home from "./Home";
import Details from "./Details";


const Catalogue = () => {
    let { path } = useRouteMatch();

    return(
        <div>
            <h1>
                Shop 
            </h1>
            <Switch>
                <Route exact path={`${path}`} component={Home}/>
                <Route exact path={`${path}/product/:productId`} component={Details}/>
            </Switch>
        </div>
    )
}

export default Catalogue;