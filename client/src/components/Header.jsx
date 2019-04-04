import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import "../assets/css/Header.css";

class Header extends Component {
  myFunction() {
    var x = document.getElementById("myTopnav");
    x.className = x.className === "topnav" ? "topnav responsive" : "topnav";
  }

  handleHeaderSubmit = event => {
    event.preventDefault();
    this.props.history.push(
      "./users?search=" + encodeURIComponent(this.state.query)
    );
    console.log(this.state);
    console.log(this.props);
  };

  handleHeaderInputChanged = event => {
    this.setState({
      query: event.target.value
    });
  };

  render() {
    return (
      <header>
        <div className="header_image">
          <div className="header_title">BeMentor.</div>
        </div>
        <div className="topnav" id="myTopnav">
          <form
            className="search__form"
            action=""
            autoComplete="on"
            onSubmit={this.handleHeaderSubmit}
          >
            <input
              id="search_input"
              name="search"
              type="search"
              placeholder="Find your Mentor"
              onChange={this.handleHeaderInputChanged}
            />
            <input id="search_submit" value="Search" type="submit" />
          </form>
          <Link to="/myprofile">MY PROFILE</Link>
          <Link to="/login">LOGIN</Link>
          <Link to="/contact">CONTACT</Link>
          <Link to="/users">SEARCH USERS</Link>
          <Link to="/home">HOME</Link>
          <a href="#" className="icon" onClick={this.myFunction}>
            <i className="fa fa-bars" />
          </a>
        </div>
      </header>
    );
  }
}

export default withRouter(Header);
