import React from 'react';
import ReCAPTCHA from "react-google-recaptcha";
import {deleteCookie, setCookie} from "../helpers/CookieFunctions";
import {login} from "../backend/FileServer";
const recaptchaRef = React.createRef();
class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            captcha: 'a'
        };
    }

    onChange(value) {
        if (value == null) {
            recaptchaRef.reset();
        } else {
            this.setState({captcha: value})
        }
    }

    onExpired(value) {
        console.log(value);
    }

    login(authString, captcha) {

    }

    sendLogin() {
        let user = document.getElementById('username').value;
        let pass = document.getElementById('password').value;
        let authString = `${user}:${pass}`;
        login(authString, this.state.captcha, (response) => {
            if (response) {
                const token = response.token;
                const expiry = response.expiry;
                setCookie('auth', token, expiry + 24*3600);
                window.location.replace("/files");

            } else {
                deleteCookie('auth');
                alert('Login incorrect');
            }
        });
    }

    render() {
        return <div style={{padding: '10vh'}}>
            <span>Username: </span><input id="username"/>
            <br/>
            <br/>
            <span>Password: </span><input type="password" style={{marginLeft: '0.3em'}} id="password"/>
            <br/>
            <br/>
            <ReCAPTCHA
                sitekey="6Lc_Ma4UAAAAAGrVEC3uqu9Og9tC8Nr9YVRO28Wr"
                onChange={(val) => this.onChange(val)}
                onExpired={() => this.onExpired()}
                ref={recaptchaRef}
            />
            <button style={{display: this.state.captcha === '' ? 'none': 'block'}} onClick={() => this.sendLogin()}>Login</button>
        </div>;
    }
}

export default Login;