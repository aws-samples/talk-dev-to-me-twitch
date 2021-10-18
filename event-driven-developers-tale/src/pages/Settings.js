// import { useState, useEffect } from 'react'
// import { listCategories } from '../graphql/queries'
// import { API } from 'aws-amplify'
// import CategoryItem from '../components/CategoryItem'
// import AddCategory from '../components/AddCategory'

function Settings({emmiter}) {
    // const [categories, setCategories] = useState([])

    // useEffect(()=> {
    //     getCategories()
    // }, [])

    // async function getCategories(){
    //     const result = await API.graphql({query: listCategories, authMode: 'AMAZON_COGNITO_USER_POOLS'})
    //     setCategories(result.data.listCategories.items)
    // }

    // function showAddCategory(){
    //     emmiter.emit("showModal", true, "Create Category", "Create a new category to help employees classify their vacations.", <AddCategory emmiter={emmiter} />)
    // }

    

    return (
        <div>
            <h1 className="border-b-2 pb-2">SETTINGS</h1>
            {/* CATEGORIES */}
            {/* Header */}
            {/* <div className="flex justify-between mt-6">
                <h3 className="text-xl">Categories</h3>
                <div>
                    <button className="bg-yellow-600 text-base px-2 py-1 rounded text-white hover:bg-yellow-700 transform transition shadow" onClick={showAddCategory} >Add</button>
                </div>
            </div> */}

            {/* List Categories */}
            {/* { categories.map((category, index) => {
                return (
                   <CategoryItem key={index} category={category} /> 
                )
            }) 
            
            }    */}        
            
        </div>
    )
}

export default Settings
