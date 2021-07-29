import React, {useState} from "react";

const AccountDetails = (props) => {
    
    const [lastPaymentDate, setPaymentChanged] = useState("Jan 2021")

    props.emitter.on("paymentChanged", date => setPaymentChanged(date))

    return (
        <div>
            <h3>Account Details</h3>
            <ul>
                <li><i>name:</i> Luca</li>
                <li><i>surname:</i> Mezzalira</li>
                <li><i>email:</i> guesswho@lm.com</li>
                <li><i>member since:</i> Jan 2021</li>
                <li><i>last payment changed: </i>{lastPaymentDate}</li>
                <li><a href="#">Change account details</a></li>
            </ul>
        </div>
    
    );
}

export default AccountDetails;
                