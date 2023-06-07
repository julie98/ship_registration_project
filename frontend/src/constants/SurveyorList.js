import _ from "lodash";
import React, { Component } from "react";
import { Search } from "semantic-ui-react";

const initialState = { isLoading: false, results: [], value: "" };

const SurveyorList = {
  "Govenrment": {
    name: "Government Surveyor",
    results: [
      {
        title: "Kane Fisher",
        description: "3GA Marine Ltd"
      },
      {
        title: "River Maggio",
        description: "3GA Marine Ltd"
      }
    ]
  },
  "Cargo": {
    name: "Cargo Surveyor",
    results: [
      {
        title: "Chadd O'Kon",
        description: "Brighton Marine Surveys Ltd"
      },
      {
        title: "Opal Block",
        description: "Richard Watson & Co Ltd"
      },
      {
        title: "Mr. Hubert Howell",
        description: "3GA Marine Ltd"
      }
    ]
  },
  "Classification": {
    name: "Government Surveyor",
    results: [
      {
        title: "Florian Kertzmann",
        description: "Qodesh Engineering & Marine Services"
      },
      {
        title: "Cassie Waters",
        description: "Orcades Marine Management Consultants Ltd"
      },
      {
        title: "Jermey Zboncak",
        description: "Richard Watson & Co Ltd"
      }
    ]
  },
  "Independent": {
    name: "Government Surveyor",
    results: [
      {
        title: "Emelie Terry V",
        description: "Orcades Marine Management Consultants Ltd"
      }
    ]
  },
  "Yatch & Small Craft": {
    name: "Government Surveyor",
    results: [
      {
        title: "Remington Stark",
        description: "Wal-Zenith International Limited"
      },
      {
        title: "Jamaal Reichel",
        description: "Marine Surveyors Cayman Ltd"
      },
      {
        title: "Carissa Koelpin",
        description: "Wal-Zenith International Limited"
      },
      {
        title: "Laurine Bashirian",
        description: "B & H Marine Consultants"
      },
      {
        title: "Jessica Crona",
        description: "A R Brink and Associates"
      },
      {
        title: "Mrs. Jodie Hettinger",
        description: "Brighton Marine Surveys Ltd"
      }
    ]
  }
};

export default class SurveyorListTest extends Component {
  state = initialState;

  handleResultSelect = (e, { result }) =>
    this.setState({ 
      isLoading: false, 
      value: result.title,
      results: this.state.results });

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value });

    setTimeout(() => {
      if (this.state.value.length < 1) return this.setState(initialState);
      const re = new RegExp(_.escapeRegExp(this.state.value), "i");
      const isMatch = (result) => re.test(result.title);
      const filteredResults = _.reduce(
        SurveyorList,
        (memo, data, name) => {
          const results = _.filter(data.results, isMatch);
          if (results.length) memo[name] = { name, results }; // eslint-disable-line no-param-reassign
          return memo;
        },
        {}
      );

      this.setState({
        isLoading: false,
        value: this.state.value,
        results: filteredResults
      });
    }, 300);
  };

  render() {
    const { isLoading, value, results } = this.state;

    return (
      <Search
        category
        loading={isLoading}
        onResultSelect={this.handleResultSelect}
        onSearchChange={_.debounce(this.handleSearchChange, 500, {
          leading: true
        })}
        results={results}
        value={value}
      />
    );
  }
}
