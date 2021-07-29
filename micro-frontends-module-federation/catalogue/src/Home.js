import React from "react";
import {useRouteMatch} from "react-router-dom";
import { StylesProvider, createGenerateClassName } from '@material-ui/core/styles';
import Product from "./Product";

const catalogueData = [
    {
        id: 123,
        productName: "Black no.1 T-Shirt",
        image: "http://localhost:3002/imgs/black1.jpeg",
        cost: "$3.99"
    },
    {
        id: 234,
        productName: "Black no.2 T-Shirt",
        image: "http://localhost:3002/imgs/black2.jpeg",
        cost: "$4.99"
    },
    {
        id: 456,
        productName: "White T-Shirt",
        image: "http://localhost:3002/imgs/white.jpeg",
        cost: "$5.99"
    }
]

const generateClassName = createGenerateClassName({
    seed:'catalogue'
});

const Home = () => {
    let { path } = useRouteMatch();

    return(
        <StylesProvider generateClassName={generateClassName}>
            <div>
                    {          
                        catalogueData.map(item => {
                            return (
                                <Product key={item.id} data={item} url={`${path}/product/${item.id}`}/>
                            )
                        })
                    }
            </div>
        </StylesProvider>
    )
}

export default Home;