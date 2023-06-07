/***************************************************
 * Author: Christian Ocon 
 * File Name: Contact.js
 * Description:
 *      This file is for the Contact page
 ****************************************************/

import './Contact.css'

import _ from "lodash";
import React, { Component } from "react";
import { Search } from "semantic-ui-react";
import { SURVEYOR_LIST } from '../constants/constants'


export default class Contant extends Component {
    constructor(props) {
        super(props)

        this.initialState = {
            isLoading: false,
            results: [],
            value: "",
            return_val: []
        };

        this.state = {
            searchBar: this.initialState
        }


    }

    handleResultSelect = (e, { result }) => {
        this.setState({
            searchBar: {
                isLoading: false,
                value: result.title,
                results: this.state.searchBar.results,
                return_val: [result.title, result.description, result.vessel_type]
            }
        });

        console.log('On Select: ', [result.title, result.description, result.vessel_type])
    }

    handleSearchChange = (e, { value }) => {
        console.log('this state: ', this.state)
        this.setState({
            searchBar: { isLoading: true, value, results: this.state.searchBar.results, return_val: ['', '', ''] },
        });

        // This is a search time out. after 300ms, returns results.
        setTimeout(() => {
            console.log('Search Bar', this.state.searchBar)
            if (this.state.searchBar.value.length < 1) return this.setState({ searchBar: this.initialState });
            const re = new RegExp(_.escapeRegExp(this.state.searchBar.value), "i");
            const isMatch_Title = (result) => re.test(result.title);
            const isMatch_Description = (result) => re.test(result.description);
            const isMatch_Operation = (result) => re.test(result.operation);
            const filteredResults = _.reduce(
                SURVEYOR_LIST,
                (memo, data, name) => {
                    const results_title = _.filter(data.results, isMatch_Title);
                    const results_description = _.filter(data.results, isMatch_Description);
                    const results_operation = _.filter(data.results, isMatch_Operation);
                    let results_cat = results_title.concat(results_description).concat(results_operation)
                    results_cat = [...new Set([...results_title,...results_description, ...results_operation])]
                    const results = results_cat
                    if (results.length) memo[name] = { name, results }; // eslint-disable-line no-param-reassign
                    return memo; 
                },
                {}
            );

            this.setState({
                searchBar: {
                    isLoading: false,
                    value: this.state.searchBar.value,
                    results: filteredResults,
                    return_val: ['', '', '']
                }
            });
        }, 300);
    };

    render() {
        const { isLoading, value, results } = this.state.searchBar;

        return (
            <div className="Contact">
                <h1> Contact </h1>
                <div className='Search'>
                    <Search
                        className='Commercial-Class'
                        category
                        aligned={'left'}
                        loading={isLoading}
                        onResultSelect={this.handleResultSelect}
                        onSearchChange={_.debounce(this.handleSearchChange, 500, {
                            leading: true
                        })}
                        results={results}
                        value={value}
                    />
                </div>
            </div>
        );
    }
}
