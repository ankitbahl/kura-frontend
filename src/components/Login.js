import React from 'react';
import {setCookie} from "../proto/cookieFunctions";
class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    login() {
        let user = document.getElementById('username').value;
        let pass = document.getElementById('password').value;
        let string = `${user}:${pass}`;
        setCookie('auth', string, 24);
        let x = this.props;
        this.props.loginCallback();
    }

    render() {
        return <div style={{padding: '10vh'}}>
            <span>Username: </span><input id="username"/>
            <br/>
            <br/>
            <span>Password: </span><input type="password" style={{marginLeft: '0.3em'}} id="password"/>
            <br/>
            <br/>
            <button onClick={() => this.login()}>Login</button>
        </div>;
    }
}

export default Login;