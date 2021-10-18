import { useState } from 'react'
import { API } from 'aws-amplify'
import { createCategory } from '../graphql/mutations'

function AddCategory({ emmiter }) {

    const [name, setName] = useState("")

    async function addCategory() {
        const newCategory = {
            name: name
        }

        await API.graphql({
            query: createCategory,
            variables: {
                input: newCategory
            },
            authMode: 'AMAZON_COGNITO_USER_POOLS'
        })

        emmiter.emit("showModal", false, "", "", null)
    }

    function cancel(){
        emmiter.emit("showModal", false, "", "", null)
    }

    return (

        <div className="space-y-3 h-full flex flex-col">
            <div className="flex-grow pt-4 px-4">
                <label className="block border-gray-600">Name</label>
                <input className="w-full border-gray-100 border-2 rounded p-1" type="text" onChange={(event) => setName(event.target.value)} />
            </div>

            <div className="bg-gray-100 flex justify-end sticky">
                <button className="bg-white text-base rounded text-gray-800 hover:bg-gray-50 transform transition shadow px-4 py-2 my-4 mr-4" onClick={cancel}>Cancel</button>
                <button className="bg-purple-600 text-base rounded text-white hover:bg-purple-800 transform transition shadow p-4 py-2 my-4 mr-4" onClick={addCategory}>Create</button>
            </div>

        </div>

    )
}

export default AddCategory
