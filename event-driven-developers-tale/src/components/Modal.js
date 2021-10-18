function Modal({ showModal, setShowModal, header, subtitle, content }) {
    return (
        <>
            {showModal &&
                <div className="w-full h-full fixed flex bg-gray-500 bg-opacity-10">
                        <div className="w-[500px] h-full inset-x-full -ml-120 relative z-10 items-start shadow-lg bg-white transform transition-all duration-500 ease-in-out -mb-2 flex flex-col">
                            <div className="bg-purple-600 w-full h-24 p-2">
                                <h1 className=" text-white text-2xl m-2 pb-2 -mb-1">{header}</h1>
                                <span className=" text-white text-sm mx-2 flex-wrap">{subtitle}</span>

                            </div>
                            <div className="flex-grow w-full">
                                {content}
                            </div>
                        </div>
                </div>
            }
        </>
    )
}

export default Modal
