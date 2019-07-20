import React from 'react';
import ReCAPTCHA from "react-google-recaptcha";
const recaptchaRef = React.createRef();
class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            captcha: ''
        };
    }

    onChange(value) {
        if (value == null) {
            recaptchaRef.reset();
        }
        this.setState({captcha: value})
    }

    onExpired(value) {
        console.log(value);
    }

    login() {
        let user = document.getElementById('username').value;
        let pass = document.getElementById('password').value;
        let string = `${user}:${pass}`;
        this.props.loginCallback(string, this.state.captcha);
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
            <button style={{display: this.state.captcha === '' ? 'none': 'block'}} onClick={() => this.login()}>Login</button>
        </div>;
    }
}

export default Login;