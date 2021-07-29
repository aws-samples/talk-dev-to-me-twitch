import React from "react";
import {Link, useParams} from "react-router-dom";

const Home = () => {

    const {productId} = useParams()

    return(
        <div>
            {`Details page, product id: ${productId}`}
            <br/>
            <Link to="/shop">All products</Link>
        </div>
    )
}

export default Home;