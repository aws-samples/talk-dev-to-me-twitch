import React from "react";
import { useHistory } from "react-router-dom";
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { StylesProvider, createGenerateClassName } from '@material-ui/core/styles';

const faketoken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

const generateClassName = createGenerateClassName({
    seed:'signin'
});

const SignIn = () => {
    let history = useHistory();

    const onSignIn = () => {
        window.sessionStorage.setItem("token", faketoken);
        history.push("/shop");
    }

    return (
        <StylesProvider generateClassName={generateClassName}>
            <form>
                <div>
                <Typography component="p">
                    Username:
                </Typography>
                <TextField id="username" />
                </div>
                <div>
                <Typography component="p">
                    Password:
                </Typography>
                <TextField id="password"
                            type="password"
                            autoComplete="current-password"/>
                </div>
                <br/>
                <Button variant="contained" onClick={onSignIn}>Sign in</Button>
            </form>
        </StylesProvider>
    );
}

export default SignIn;
                