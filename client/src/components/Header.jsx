import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import Cookies from "universal-cookie";

import "../assets/css/Header.css";

const cookies = new Cookies();

class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      q: "",
      isRegistering: false,
      isLoggingIn: false
    };
  }

  doLogout = async () => {
    cookies.remove("token");
    this.props.history.push("/");
  };

  startLogin = () => {
    this.setState({ isLoggingIn: true });
  };

  startRegistration = () => {
    this.setState({ isRegistering: true });
  };

  stopLogin = () => {
    this.setState({ isLoggingIn: false });
  };

  stopRegistration = () => {
    this.setState({ isRegistering: false });
  };

  myFunction(event) {
    event.preventDefault();

    var x = document.getElementById("myTopnav");
    x.className = x.className === "topnav" ? "topnav responsive" : "topnav";
  }

  handleHeaderSubmit = event => {
    event.preventDefault();
    if (!this.state.q) {
      return;
    }

    this.props.history.push("./users?q=" + encodeURIComponent(this.state.q));
    console.log(this.state);
    console.log(this.props);
  };

  handleHeaderInputChanged = event => {
    this.setState({
      q: event.target.value
    });
  };

  render() {
    // const { isRegistering, isLoggingIn } = this.state;
    const isAuthenticated = !!cookies.get("token");

    return (
      <header>
        <div className="header_image">
          <div className="header_title">BeMentor.</div>
        </div>
        <div className="topnav" id="myTopnav">
          {!isAuthenticated && (
            <>
              <Link to="/login">LOGIN</Link>
              <Link to="/myprofile">REGISTER</Link>
            </>
          )}

          {isAuthenticated && (
            <>
              <form
                className="search__form"
                action=""
                autoComplete="on"
                onSubmit={this.handleHeaderSubmit}
              >
                <input
                  id="search_input"
                  name="q"
                  type="search"
                  placeholder="Find your Mentor"
                  onChange={this.handleHeaderInputChanged}
                />
                <input id="search_submit" value="Search" type="submit" />
              </form>
              <Link to="#" onClick={this.doLogout}>
                LOG OUT
              </Link>
              <Link to="/myprofile">MY PROFILE</Link>
              <Link to="/users">CONNECT</Link>
            </>
          )}

          <Link to="/home">HOME</Link>
          <a href="." className="icon" onClick={this.myFunction}>
            <i className="fa fa-bars" />
          </a>
        </div>
      </header>
    );
  }
}

export default withRouter(Header);
