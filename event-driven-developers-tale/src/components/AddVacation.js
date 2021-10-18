import { useState, useEffect } from 'react'
import { API } from 'aws-amplify'
import { submitVacationRequest } from '../graphql/mutations'
import moment from 'moment'

function AddVacation({ emmiter }) {

    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("")
    const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"))
    const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"))
    
    const categories = {
        ANNUAL_LEAVE: "Annual Leave",
        PUBLIC_HOLIDAYS: "Public Holidays",
        SICK_LEAVE: "Sick Leave",
        PATERNITY_LEAVE: "Patternity Leave",
        ADOPTIVE_LEAVE: "Adoptive Leave",
        CARERS_LEAVE: "Carer's Leave",
        PARENTAL_LEAVE: "Parental Leave"
    }

    useEffect(() => {
        setCategory("ANNUAL_LEAVE")
    }, [])

    async function addVacation() {
        const newVacationRequest = {
            description: description,
            approvalStatus: "PENDING_VALIDATION",
            category: `${category}`,
            startDate: `${startDate}Z`,
            endDate: `${endDate}Z`
        }

        await API.graphql({
            query: submitVacationRequest,
            variables: {
                input: newVacationRequest
            },
            authMode: 'AMAZON_COGNITO_USER_POOLS'
        })

        emmiter.emit("showModal", false, "", "", null)        
    }

    function cancel() {
        emmiter.emit("showModal", false, "", "", null)
    }

    return (

        <div className="space-y-3 h-full flex flex-col">
            <div className="flex-grow">
                <div className=" pt-4 px-4">
                    <label className="block border-gray-600">Description</label>
                    <input className="w-full border-gray-100 border-2 rounded p-1" type="text" onChange={(event) => setDescription(event.target.value)} />
                </div>

                <div className="flex-grow pt-4 px-4">
                    <label className="block border-gray-600">Category</label>
                    <select className="w-full border-gray-100 border-2 rounded p-1" id="dropdown" onChange={(event) => setCategory(event.target.value)}>
                        {
                            Object.keys(categories).map((key, index) => {
                                return <option key={index} value={key}>{categories[key]}</option>
                            })
                        }
                    </select>
                </div>

                <div className="flex-grow pt-4 px-4">
                    <label className="block border-gray-600">Start Date</label>
                    <input className="w-full border-gray-100 border-2 rounded p-1" type="date" defaultValue={moment().format("YYYY-MM-DD")} onChange={(event) => setStartDate(event.target.value)} />
                </div>

                <div className="flex-grow pt-4 px-4">
                    <label className="block border-gray-600">End Date</label>
                    <input className="w-full border-gray-100 border-2 rounded p-1" type="date" defaultValue={moment().format("YYYY-MM-DD")} onChange={(event) => setEndDate(event.target.value)} />
                </div>
            </div>
            <div className="bg-gray-100 flex justify-end sticky">
                <button className="bg-white text-base rounded text-gray-800 hover:bg-gray-50 transform transition shadow px-4 py-2 my-4 mr-4" onClick={cancel}>Cancel</button>
                <button className="bg-purple-600 text-base rounded text-white hover:bg-purple-800 transform transition shadow p-4 py-2 my-4 mr-4" onClick={addVacation}>Create</button>
            </div>

        </div>

    )
}

export default AddVacation
