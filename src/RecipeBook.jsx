import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Listing from "./components/Listing";
import AddNew from "./components/AddNew";
import axios from "axios";

export default class RecipeBook extends React.Component {
  url = "https://dwad-recipe-api.onrender.com/";
  state = {
    active: "listing",
    data: [
      //   {
      //     _id: 1,
      //     title: "Chicken Rice",
      //     ingredients: ["Chicken Broth", "Chicken", "Rice"],
      //   },
      //   {
      //     _id: 2,
      //     title: "Duck Rice",
      //     ingredients: ["Duck", "Rice"],
      //   },
    ],
    newTitle: "",
    newIngredients: "",
  };

  updateFormField = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  fetchData = async () => {
    let response = await axios.get(this.url + "recipes");
    this.setState({ data: response.data });
  };

  setActive = (page) => {
    this.setState({
      active: page,
    });
  };

  addNew = () => {
    this.setState({
      data: [
        ...this.state.data,
        {
          _id: crypto.randomUUID(),
          title: this.state.newTitle,
          ingredients: this.state.newIngredients.split(","),
        },
      ],
      active: "listing",
    });
  };

  componentDidMount() {
    this.fetchData();
  }

  renderContent() {
    if (this.state.active === "listing") {
      return (
        <>
          <Listing data={this.state.data} />
        </>
      );
    } else if (this.state.active === "add") {
      return (
        <>
          <AddNew
            onAddNew={this.addNew}
            onUpdateFormField={this.updateFormField}
            newTitle={this.state.newTitle}
            newIngredients={this.state.newIngredients}
          />
        </>
      );
    }
  }

  render() {
    return (
      <>
        <div className="container mt-3">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={
                  this.state.active === "listing"
                    ? "nav-link active"
                    : "nav-link"
                }
                aria-current="page"
                onClick={() => {
                  this.setActive("listing");
                }}
              >
                Recipes
              </button>
            </li>
            <li className="nav-item">
              <button
                className={
                  this.state.active === "add" ? "nav-link active" : "nav-link"
                }
                onClick={() => {
                  this.setActive("add");
                }}
              >
                Add New
              </button>
            </li>
          </ul>
          {this.renderContent()}
        </div>
      </>
    );
  }
}
